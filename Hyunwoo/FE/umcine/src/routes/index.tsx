import { createFileRoute } from "@tanstack/react-router";
import { TMDB_MAX_PAGE } from "../api/movies/get-movies";
import { MovieListPage } from "../pages/movies/movie-list-page";

export const Route = createFileRoute("/")({
  validateSearch: (search): { page?: number } => {
    const page = Number(search.page);

    return {
      page:
        Number.isInteger(page) && page >= 1 && page <= TMDB_MAX_PAGE
          ? page
          : undefined,
    };
  },
  component: MovieListPage,
});
