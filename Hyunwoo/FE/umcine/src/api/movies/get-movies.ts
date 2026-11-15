import { tmdbClient } from "../tmdb-client";
import type { TmdbMovieListResponse } from "./models";

// TMDB 목록은 500페이지까지만 조회할 수 있어요.
const TMDB_MAX_PAGE = 500;

interface GetMoviesRequest {
  page?: number;
}

type GetMoviesResponse = TmdbMovieListResponse;

function getMovies({ page = 1 }: GetMoviesRequest = {}) {
  return tmdbClient
    .get("movie/popular", {
      searchParams: { language: "ko-KR", page },
    })
    .json<GetMoviesResponse>();
}

export { getMovies, TMDB_MAX_PAGE, type GetMoviesRequest, type GetMoviesResponse };