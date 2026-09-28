import { Link } from '@tanstack/react-router';
import type { Movie } from '../../types/movie';
import { cn } from '../../utils/cn';

interface MovieCardProps {
  movie: Movie;
  onToggleBookmark: (id: number) => void;
}

function MovieCard({ movie, onToggleBookmark }: MovieCardProps) {
  return (
    <div className="relative">
      <Link
        to="/movies/$movieId"
        params={{ movieId: String(movie.id) }}
        className="flex flex-col gap-2"
      >
        <img
          className="block aspect-[7/8] w-full rounded-xl object-cover"
          src={movie.posterPath}
          alt={`${movie.title} 포스터`}
        />
        <div className="flex flex-col gap-1">
          <span className="truncate text-base font-bold leading-tight tracking-tight text-gray-900">
            {movie.title}
          </span>
          <span className="text-sm leading-none text-gray-400">{movie.releaseDate}</span>
        </div>
      </Link>

      <button
        type="button"
        className={cn(
          'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border',
          movie.isBookmarked ? 'border-blue-600 bg-blue-600' : 'border-white/70 bg-black/60',
        )}
        onClick={() => onToggleBookmark(movie.id)}
        aria-pressed={movie.isBookmarked}
        aria-label={movie.isBookmarked ? '북마크 해제' : '북마크 추가'}
      >
        <img
          src={
            movie.isBookmarked
              ? '/icons/movie-icons/bookmark.svg'
              : '/icons/movie-icons/bookmark-outline.svg'
          }
          alt=""
          className="h-4 w-4 brightness-0 invert"
        />
      </button>
    </div>
  );
}

export default MovieCard;
