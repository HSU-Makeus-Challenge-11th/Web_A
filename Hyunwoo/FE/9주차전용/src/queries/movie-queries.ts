import { queryOptions } from "@tanstack/react-query";
import { getMovieDetail } from "../api/movies/get-movie-detail";
import { getMovies } from "../api/movies/get-movies";
import { searchMovies } from "../api/movies/search-movies";

export function movieListOptions(page: number) {
  return queryOptions({
    queryKey: ["movies", "list", { page }],
    queryFn: () => getMovies({ page }),
  });
}

export function movieSearchOptions(query: string) {
  return queryOptions({
    queryKey: ["movies", "search", { query }],
    queryFn: () => searchMovies({ query }),
    enabled: query.length > 0,
  });
}

export function movieDetailOptions(movieId: number) {
  return queryOptions({
    queryKey: ["movies", "detail", movieId],
    queryFn: () => getMovieDetail(movieId),
    staleTime: 30 * 1000,
  });
}
