import MovieCard, { type MovieCardData } from "./movie-card";

interface MovieGridProps {
  movies: MovieCardData[];
  onToggleBookmark: (movieId: number) => void;
  cardSize: "small" | "large";
  bookmarkDisabled?: boolean;
}

export default function MovieGrid({
  movies,
  onToggleBookmark,
  cardSize,
  bookmarkDisabled,
}: MovieGridProps) {
  return (
    <section
      id="movie-list"
      className={`grid grid-cols-1 gap-5 ${cardSize === "small"
          ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          : "sm:grid-cols-2 xl:grid-cols-3"
        }`}
    >
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onToggleBookmark={onToggleBookmark}
          bookmarkDisabled={bookmarkDisabled}
        />
      ))}
    </section>
  );
}
