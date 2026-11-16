import type { TmdbMovieListResponse } from "./models";
type GetMoviesWithFetchResponse = TmdbMovieListResponse;
async function getMoviesWithFetch(page = 1): Promise<GetMoviesWithFetchResponse> {
  const params = new URLSearchParams({ language: "ko-KR", page: String(page) });
  const response = await fetch(`/api/tmdb/movie/popular?${params}`);
  if (!response.ok) throw new Error(`영화 목록 요청에 실패했어요: ${response.status}`);
  return response.json();
}
export { getMoviesWithFetch, type GetMoviesWithFetchResponse };
