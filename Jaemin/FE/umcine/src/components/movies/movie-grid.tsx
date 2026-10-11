import type { Movie } from "../../types/movie";
import MovieCard from "./movie-card";
import type { CardSize } from "../../stores/display-store";
import { cn } from "../../utils/cn";

interface MovieGridProps {
  movies: Movie[];
  cardSize?: CardSize;
}

export default function MovieGrid({ movies, cardSize = "small" }: MovieGridProps) {
  return (
    <section className={cn(
      "grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2",
      cardSize === "large" ? "lg:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-5",
    )}>
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
        />
      ))}
    </section>
  );
}
