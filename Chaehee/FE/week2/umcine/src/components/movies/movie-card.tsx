import { Link } from '@tanstack/react-router';
import type { TmdbMovieListItem } from '../../api/movies/models';
import { getTmdbPosterUrl } from '../../utils/movies/tmdb-image';
import { BookmarkButton } from '../bookmark-button';

interface MovieCardProps {
  movie: TmdbMovieListItem;
}

function MovieCard({ movie }: MovieCardProps) {
  const posterUrl = getTmdbPosterUrl(movie.poster_path);

  return (
    <div className="relative">
      <Link
        to="/movies/$movieId"
        params={{ movieId: String(movie.id) }}
        className="flex flex-col gap-2"
      >
        {posterUrl ? (
          <img
            className="block aspect-[7/8] w-full rounded-xl object-cover"
            src={posterUrl}
            alt={`${movie.title} 포스터`}
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

      <div className="absolute right-3 top-3 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-gray-900">
        <BookmarkButton movieId={movie.id} />
      </div>
    </div>
  );
}

export default MovieCard;
