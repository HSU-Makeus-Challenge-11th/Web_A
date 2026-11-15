import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { test } from "node:test";
import ts from "typescript";
import { MutationObserver, QueryClient, QueryObserver } from "@tanstack/react-query";

// Run the real API modules with a test URL and mocked transport; no live data is changed.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith("/src/config/env.ts")) {
      return { format: "module", source: 'export const env = { apiBaseUrl: "https://api.test" };', shortCircuit: true };
    }
    if (url.endsWith(".ts") && !url.includes("/node_modules/")) {
      return {
        format: "module",
        source: ts.transpileModule(readFileSync(new URL(url), "utf8"), {
          compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 },
        }).outputText,
        shortCircuit: true,
      };
    }
    return nextLoad(url, context);
  },
});

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
const calls = [];
let responseBody;
let responseStatus = 200;
globalThis.fetch = async (request) => {
  calls.push({
    path: new URL(request.url).pathname,
    method: request.method,
    authorization: request.headers.get("Authorization"),
    body: request.method === "POST" || request.method === "PATCH" ? await request.json() : undefined,
  });
  const body = typeof responseBody === "function" ? await responseBody(request) : responseBody;
  return Response.json(body ?? {}, { status: responseStatus });
};

const favorites = await import("../src/api/favorites.ts");
const ratings = await import("../src/api/ratings.ts");
const { useAuthStore } = await import("../src/stores/auth-store.ts");
const { getTokenMemberId } = await import("../src/utils/auth-member-id.ts");
const { getMe } = await import("../src/api/members/me.ts");
const { ME_QUERY_KEY, invalidateMeQuery, setMeQueryData } = await import("../src/queries/member-cache.ts");
const { updateMeMutationOptions } = await import("../src/mutations/member-mutations.ts");
const { loginMutationOptions, signupMutationOptions } = await import("../src/mutations/auth-mutations.ts");
const { favoriteMutationOptions } = await import("../src/mutations/favorite-mutations.ts");

test("member API requests match endpoint contracts", async (suite) => {
  useAuthStore.getState().setAccessToken("test-token");
  const cases = [
    ["favorites list", () => favorites.getFavorites(), { result: [{ movieId: 42 }] }, [{ movieId: 42 }], "GET", "/favorites"],
    ["favorite status", () => favorites.getFavorite(42), { result: { isFavorite: true } }, true, "GET", "/favorites/42"],
    ["add favorite", () => favorites.addFavorite(42), {}, undefined, "POST", "/favorites", { movieId: 42 }],
    ["delete favorite", () => favorites.deleteFavorite(42), {}, undefined, "DELETE", "/favorites/42"],
    ["member ratings are a plain array", () => ratings.getMemberRatings(7), [{ ratingId: 3, movieId: 42, score: 4, comment: "좋아요" }], [{ ratingId: 3, movieId: 42, score: 4, comment: "좋아요" }], "GET", "/members/7/ratings"],
    ["create rating", () => ratings.createRating({ movieId: 42, score: 4, comment: "좋아요" }), {}, undefined, "POST", "/ratings", { movieId: 42, score: 4, comment: "좋아요" }],
    ["update rating", () => ratings.updateRating(3, { score: 5, comment: "수정" }), {}, undefined, "PATCH", "/ratings/3", { score: 5, comment: "수정" }],
    ["delete rating", () => ratings.deleteRating(3), {}, undefined, "DELETE", "/ratings/3"],
  ];
  for (const [name, run, body, expected, method, path, requestBody] of cases) {
    await suite.test(name, async () => {
      responseBody = body;
      assert.deepEqual(await run(), expected);
      assert.deepEqual(calls.at(-1), {
        method,
        path,
        body: requestBody,
        authorization: path === "/members/7/ratings" ? null : "Bearer test-token",
      });
    });
  }

  await suite.test("failed mutation rejects without retrying", async () => {
    responseStatus = 400;
    const before = calls.length;
    await assert.rejects(() => ratings.createRating({ movieId: 42, score: 0, comment: "" }));
    assert.equal(calls.length, before + 1);
  });

  await suite.test("401 clears the persisted access token", async () => {
    responseStatus = 401;
    await assert.rejects(() => favorites.deleteFavorite(42));
    assert.equal(useAuthStore.getState().accessToken, null);
    assert.equal(JSON.parse(storage.get("umcine-auth-store")).state.accessToken, null);
  });
});

test("member ID comes from the backend JWT subject", () => {
  const token = `header.${Buffer.from(JSON.stringify({ sub: "7", email: "test@example.com" })).toString("base64url")}.signature`;
  assert.equal(getTokenMemberId(token), 7);
  for (const invalid of [null, "invalid", "a.e30.c", "a.eyJzdWIiOiItMSJ9.c"]) {
    assert.equal(getTokenMemberId(invalid), undefined);
  }
});

const previousMember = { email: "test@example.com", nickname: "before", createdAt: "2026-11-14" };
const updatedMember = { ...previousMember, nickname: "after" };

test("invalidateQueries keeps previous data during an extra active GET", async () => {
  responseStatus = 200;
  responseBody = { result: previousMember };
  useAuthStore.getState().setAccessToken("test-token");
  const client = new QueryClient();
  const options = { queryKey: ME_QUERY_KEY, queryFn: getMe, staleTime: 300_000, retry: false };
  await client.fetchQuery(options);
  const observer = new QueryObserver(client, options);
  const unsubscribe = observer.subscribe(() => {});
  let releaseGet;
  let markGetStarted;
  const pendingGet = new Promise((resolve) => { releaseGet = resolve; });
  const getStarted = new Promise((resolve) => { markGetStarted = resolve; });
  responseBody = async (request) => {
    if (request.method === "GET") {
      markGetStarted();
      await pendingGet;
    }
    return { result: updatedMember };
  };
  const before = calls.length;
  const mutation = new MutationObserver(client, {
    ...updateMeMutationOptions(),
    onSuccess: () => invalidateMeQuery(client),
  });
  try {
    const completion = mutation.mutate({ nickname: "after" });
    await getStarted;
    assert.equal(observer.getCurrentResult().data.nickname, "before");
    assert.equal(observer.getCurrentResult().isFetching, true);
    assert.equal(observer.getCurrentResult().isLoading, false);
    releaseGet();
    await completion;
    assert.equal(observer.getCurrentResult().data.nickname, "after");
    assert.deepEqual(calls.slice(before).map(({ method }) => method), ["PATCH", "GET"]);
  } finally {
    releaseGet();
    unsubscribe();
    client.clear();
  }
});

test("setQueryData updates active and newly mounted observers without an extra GET", async () => {
  responseStatus = 200;
  responseBody = { result: previousMember };
  const client = new QueryClient();
  const options = { queryKey: ME_QUERY_KEY, queryFn: getMe, staleTime: 300_000, retry: false };
  await client.fetchQuery(options);
  const observer = new QueryObserver(client, options);
  const unsubscribe = observer.subscribe(() => {});
  responseBody = { result: updatedMember };
  const before = calls.length;
  const mutation = new MutationObserver(client, {
    ...updateMeMutationOptions(),
    onSuccess: (response) => setMeQueryData(client, response.result),
  });
  let unsubscribeNext;
  try {
    await mutation.mutate({ nickname: "after" });
    assert.equal(observer.getCurrentResult().data.nickname, "after");
    assert.equal(observer.getCurrentResult().isFetching, false);
    const nextObserver = new QueryObserver(client, options);
    unsubscribeNext = nextObserver.subscribe(() => {});
    assert.equal(nextObserver.getCurrentResult().data.nickname, "after");
    assert.equal(nextObserver.getCurrentResult().isFetching, false);
    assert.deepEqual(calls.slice(before).map(({ method }) => method), ["PATCH"]);
  } finally {
    unsubscribeNext?.();
    unsubscribe();
    client.clear();
  }
});

test("invalidating inactive data waits until an observer mounts to GET", async () => {
  responseStatus = 200;
  responseBody = { result: previousMember };
  const client = new QueryClient();
  const options = { queryKey: ME_QUERY_KEY, queryFn: getMe, staleTime: 300_000, retry: false };
  await client.fetchQuery(options);
  const before = calls.length;
  await invalidateMeQuery(client);
  assert.equal(calls.length, before);
  assert.equal(client.getQueryState(ME_QUERY_KEY).isInvalidated, true);
  responseBody = { result: updatedMember };
  const observer = new QueryObserver(client, options);
  let unsubscribe;
  try {
    await new Promise((resolve) => {
      unsubscribe = observer.subscribe((result) => {
        if (result.data?.nickname === "after") resolve();
      });
    });
    assert.deepEqual(calls.slice(before).map(({ method }) => method), ["GET"]);
  } finally {
    unsubscribe?.();
    client.clear();
  }
});

test("shared mutationOptions execute login, signup, and favorite requests", async () => {
  responseStatus = 200;
  responseBody = { message: "성공", result: { accessToken: "new-token", nickname: "test" } };
  useAuthStore.getState().setAccessToken("test-token");
  const client = new QueryClient();
  const before = calls.length;
  try {
    const login = new MutationObserver(client, loginMutationOptions());
    assert.equal((await login.mutate({ email: "test@example.com", password: "password" })).result.accessToken, "new-token");
    await new MutationObserver(client, signupMutationOptions()).mutate({ email: "test@example.com", nickname: "test", password: "password" });
    const favorite = new MutationObserver(client, favoriteMutationOptions("test-token"));
    await favorite.mutate({ movieId: 42, isFavorite: false });
    await favorite.mutate({ movieId: 42, isFavorite: true });
    assert.deepEqual(calls.slice(before).map(({ method, path }) => [method, path]), [
      ["POST", "/auth/login"], ["POST", "/members"], ["POST", "/favorites"], ["DELETE", "/favorites/42"],
    ]);
    const anonymous = new MutationObserver(client, favoriteMutationOptions(null));
    const requestCount = calls.length;
    await assert.rejects(() => anonymous.mutate({ movieId: 42, isFavorite: false }), /로그인이 필요/);
    assert.equal(calls.length, requestCount);
  } finally {
    client.clear();
  }
});
