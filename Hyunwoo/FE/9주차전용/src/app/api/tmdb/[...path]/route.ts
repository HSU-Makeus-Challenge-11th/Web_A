import type { NextRequest } from "next/server";
export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const endpoint = path.join("/");
  if (!/^(movie\/(popular|[1-9]\d*)|search\/movie)$/.test(endpoint)) {
    return Response.json({ message: "지원하지 않는 영화 경로예요." }, { status: 404 });
  }
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token) return Response.json({ message: "서버에 TMDB_ACCESS_TOKEN을 설정해 주세요." }, { status: 503 });
  const url = new URL(`${(process.env.TMDB_API_BASE_URL || "https://api.themoviedb.org/3").replace(/\/$/, "")}/${endpoint}`);
  for (const key of ["language", "page", "query", "include_adult"]) {
    const value = request.nextUrl.searchParams.get(key);
    if (value !== null) url.searchParams.set(key, value);
  }
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    return new Response(await response.text(), { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ message: "영화 서버에 연결하지 못했어요." }, { status: 502 });
  }
}
