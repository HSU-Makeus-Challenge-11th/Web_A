import Link from "next/link";
import type { Movie } from "../../types/movie";
import { cn } from "../../utils/cn";

export type MovieCardData = Pick<Movie, "id" | "title" | "posterPath" | "releaseDate" | "isBookmarked">;

interface MovieCardProps {
  movie: MovieCardData;
  onToggleBookmark: (movieId: number) => void;
  bookmarkDisabled?: boolean;
}

export default function MovieCard({
  movie,
  onToggleBookmark,
  bookmarkDisabled,
}: MovieCardProps) {
  return (
    <article className="min-w-0">
      <div className="relative">
        {movie.posterPath ? (
          <img
            className="block w-full aspect-[242/274] object-cover rounded-[10px]"
            src={movie.posterPath}
            alt={`${movie.title} 포스터`}
          />
        ) : (
          <div className="flex w-full aspect-[242/274] items-center justify-center rounded-[10px] bg-[#e1e5ee] text-[12px] text-[#8b95a5]">
            이미지 없음
          </div>
        )}

        <button
          className={cn(
            "absolute right-[10px] top-[10px] flex h-[34px] w-[34px] items-center justify-center rounded-lg border cursor-pointer",
            movie.isBookmarked
              ? "border-[#2563eb] bg-[#2563eb]"
              : "border-white bg-[#17191d]/90",
          )}
          type="button"
          disabled={bookmarkDisabled}
          aria-label={`${movie.title} 북마크`}
          aria-pressed={movie.isBookmarked}
          onClick={() => onToggleBookmark(movie.id)}
        >
          <img
            className="h-6 w-6 brightness-0 invert"
            src={
              movie.isBookmarked
                ? "/icons/bookmark.svg"
                : "/icons/bookmark-outline.svg"
            }
            alt=""
          />
        </button>
      </div>

      <Link
        href={`/movies/${movie.id}`}
        className="text-inherit no-underline"
      >
        <h2 className="mt-2 text-[14px] font-bold leading-5 text-[#202329]">
          {movie.title}
        </h2>
      </Link>
      <p className="mt-1 text-[12px] leading-4 text-[#8b95a5]">
        {movie.releaseDate}
      </p>
    </article>
  );
}
