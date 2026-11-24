import { useQueries } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { getMovieDetail } from '../../api/movies/get-movie-detail';
import { useFavoritesQuery } from '../../hooks/use-favorites-query';
import { getTmdbPosterUrl } from '../../utils/movies/tmdb-image';
import Pagination from '../movies/pagination';

const PAGE_SIZE = 10;

export function FavoriteMovies() {
  const favoritesQuery = useFavoritesQuery();
  const bookmarkedMovieIds = favoritesQuery.data?.map((favorite) => favorite.movieId) ?? [];
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(bookmarkedMovieIds.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageMovieIds = bookmarkedMovieIds.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const movieQueries = useQueries({
    queries: pageMovieIds.map((movieId) => ({
      queryKey: ['movies', 'detail', movieId],
      queryFn: () => getMovieDetail(movieId),
    })),
  });

  if (favoritesQuery.isPending) {
    return <p className="py-16 text-center text-gray-500">즐겨찾기를 불러오는 중이에요.</p>;
  }

  if (favoritesQuery.isError) {
    return <p className="py-16 text-center text-gray-500">즐겨찾기를 불러오지 못했어요.</p>;
  }

  if (bookmarkedMovieIds.length === 0) {
    return (
      <p className="py-16 text-center text-gray-500">
        아직 즐겨찾기한 영화가 없어요. 영화 목록에서 북마크를 눌러 보세요.
      </p>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {movieQueries.map((movieQuery, index) => {
          const movieId = pageMovieIds[index];

          if (movieQuery.isPending) {
            return (
              <li
                key={movieId}
                className="flex aspect-[7/8] items-center justify-center rounded-xl bg-gray-200 text-sm text-gray-500"
              >
                불러오는 중
              </li>
            );
          }

          if (movieQuery.isError) {
            return (
              <li
                key={movieId}
                className="flex aspect-[7/8] items-center justify-center rounded-xl bg-gray-200 text-sm text-gray-500"
              >
                영화 정보를 불러오지 못했어요.
              </li>
            );
          }

          const movie = movieQuery.data;
          const posterUrl = getTmdbPosterUrl(movie.poster_path);

          return (
            <li key={movieId}>
              <Link
                to="/movies/$movieId"
                params={{ movieId: String(movie.id) }}
                className="flex flex-col gap-2"
              >
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={`${movie.title} 포스터`}
                    className="block aspect-[7/8] w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex aspect-[7/8] w-full items-center justify-center rounded-xl bg-gray-200 text-sm text-gray-500">
                    이미지 없음
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className="truncate text-base font-bold leading-tight tracking-tight text-gray-900">
                    {movie.title}
                  </span>
                  <span className="text-sm leading-none text-gray-400">{movie.release_date}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
}
