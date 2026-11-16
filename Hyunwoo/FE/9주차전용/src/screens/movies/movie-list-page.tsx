"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useFavoriteList } from "../../hooks/use-favorites";

import { TMDB_MAX_PAGE } from "../../api/movies/get-movies";
import { movieListOptions } from "../../queries/movie-queries";
import { toMovie } from "../../utils/movies/to-movie";

import MovieGrid from "../../components/movies/movie-grid";
import Pagination from "../../components/movies/pagination";
import { useDisplayStore } from "../../stores/display-store";

export function MovieListPage() {
  const searchParams = useSearchParams();
  const requestedPage = Number(searchParams.get("page"));
  const page = Number.isInteger(requestedPage) && requestedPage >= 1 && requestedPage <= TMDB_MAX_PAGE ? requestedPage : 1;
  const router = useRouter();

  const { bookmarkIds, toggleBookmark, query: favoritesQuery, mutation: favoriteMutation } = useFavoriteList();

  const moviesQuery = useQuery(movieListOptions(page));

  const movies = moviesQuery.data?.results ?? [];
  const totalPages = Math.min(moviesQuery.data?.total_pages ?? 0, TMDB_MAX_PAGE);
  const movieCards = movies.map((movie) =>
    toMovie(movie, bookmarkIds.includes(movie.id)),
  );

  function handlePageChange(nextPage: number) {
    router.push(nextPage === 1 ? "/" : `/?page=${nextPage}`);
    window.scrollTo({ top: 0 });
  }

  function handleToggleBookmark(movieId: number) {
    toggleBookmark(movieId);
  }

  const cardSize = useDisplayStore((state) => state.cardSize);

  const setCardSize = useDisplayStore((state) => state.setCardSize);

  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 pb-10 pt-6 xl:px-0">
      <h1 className="mb-5 text-[36px] font-bold leading-tight tracking-tight text-[#202329]">
        영화 목록
      </h1>

      <div className="mb-5 flex gap-2">
        <button
          type="button"
          aria-pressed={cardSize === "small"}
          onClick={() => setCardSize("small")}
          className={`rounded-lg border px-3 py-2 ${cardSize === "small"
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700"
            }`}
        >
          작은 카드
        </button>

        <button
          type="button"
          aria-pressed={cardSize === "large"}
          onClick={() => setCardSize("large")}
          className={`rounded-lg border px-3 py-2 ${cardSize === "large"
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700"
            }`}
        >
          큰 카드
        </button>
      </div>

      {favoritesQuery.isError && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          즐겨찾기를 불러오지 못했어요. <button type="button" onClick={() => void favoritesQuery.refetch()}>다시 시도</button>
        </p>
      )}

      {moviesQuery.isPending ? (
        <p className="py-10 text-center text-sm text-[#8b95a5]">
          영화 목록을 불러오는 중이에요.
        </p>
      ) : moviesQuery.isError ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <p className="text-sm text-red-600">영화 목록을 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={() => void moviesQuery.refetch()}
            disabled={moviesQuery.isFetching}
            className="rounded-lg bg-[#17191d] px-4 py-2 text-sm font-bold text-white"
          >
            다시 시도
          </button>
        </div>
      ) : movieCards.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#8b95a5]">
          조건에 맞는 영화가 없어요.
        </p>
      ) : (
        <MovieGrid
          movies={movieCards}
          onToggleBookmark={handleToggleBookmark}
          bookmarkDisabled={favoritesQuery.isFetching || favoritesQuery.isError || favoriteMutation.isPending}
          cardSize={cardSize}
        />
      )}

      {moviesQuery.isSuccess && movieCards.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </main>
  );
}
