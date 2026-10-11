import { Link } from "@tanstack/react-router";
import type { Movie } from "../../types/movie";
import { BookmarkButton } from "../bookmark-button";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({
  movie,
}: MovieCardProps) {
  return (
    <article className="min-w-0">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[6px] bg-[#eeeeee]">
        <Link
          to="/movies/$movieId"
          params={{ movieId: String(movie.id) }}
          className="block h-full w-full"
        >
          <img
            className="block h-full w-full object-cover"
            src={movie.posterPath}
            alt={`${movie.title} 포스터`}
          />
        </Link>

        <BookmarkButton movieId={movie.id} variant="icon" />
      </div>

      <div className="pt-[10px]">
        <h2 className="m-0 mb-[5px] truncate text-[14px] font-semibold">{movie.title}</h2>
        <p className="m-0 text-[12px] text-[#888888]">{movie.releaseDate}</p>
      </div>
    </article>
  );
}
