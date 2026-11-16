import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { test } from "node:test";
import ts from "typescript";

registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier) ? `${specifier}.ts` : specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith(".ts") && !url.includes("/node_modules/")) {
      return { format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(new URL(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 },
      }).outputText };
    }
    return nextLoad(url, context);
  },
});

test("persisted stores can import and rehydrate without browser globals", async () => {
  assert.equal(typeof window, "undefined");
  for (const name of ["auth", "bookmark", "display", "profile"]) {
    const storeModule = await import(`../src/stores/${name}-store.ts`);
    const store = Object.values(storeModule).find((value) => value?.persist);
    assert.equal(store.persist.hasHydrated(), false);
    await store.persist.rehydrate();
    assert.equal(store.persist.hasHydrated(), true);
  }
});

test("TMDB handler restricts endpoints, preserves queries and upstream errors", async () => {
  const { GET } = await import("../src/app/api/tmdb/[...path]/route.ts");
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.TMDB_ACCESS_TOKEN;
  const originalBase = process.env.TMDB_API_BASE_URL;
  try {
    process.env.TMDB_ACCESS_TOKEN = "server-only-test-token";
    process.env.TMDB_API_BASE_URL = "https://tmdb.test/3";
    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({ url: String(url), options });
      return Response.json({ status_message: "Not found" }, { status: 404 });
    };
    const request = { nextUrl: new URL("http://localhost/api/tmdb/movie/42?language=ko-KR&api_key=ignored") };
    const response = await GET(request, { params: Promise.resolve({ path: ["movie", "42"] }) });
    assert.equal(response.status, 404);
    assert.equal(calls[0].url, "https://tmdb.test/3/movie/42?language=ko-KR");
    assert.equal(calls[0].options.headers.Authorization, "Bearer server-only-test-token");
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    const denied = await GET(request, { params: Promise.resolve({ path: ["account", "42"] }) });
    assert.equal(denied.status, 404);
    assert.equal(calls.length, 1);
    delete process.env.TMDB_ACCESS_TOKEN;
    assert.equal((await GET(request, { params: Promise.resolve({ path: ["movie", "42"] }) })).status, 503);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.TMDB_ACCESS_TOKEN; else process.env.TMDB_ACCESS_TOKEN = originalToken;
    if (originalBase === undefined) delete process.env.TMDB_API_BASE_URL; else process.env.TMDB_API_BASE_URL = originalBase;
  }
});
