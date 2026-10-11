import { Link } from '@tanstack/react-router';
import type { Movie } from '../../types/movie';
import { BookmarkButton } from '../bookmark-button';

interface MovieCardProps {
  movie: Movie;
}

function MovieCard({ movie }: MovieCardProps) {
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

      <div className="absolute right-3 top-3 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-gray-900">
        <BookmarkButton movieId={movie.id} />
      </div>
    </div>
  );
}

export default MovieCard;
