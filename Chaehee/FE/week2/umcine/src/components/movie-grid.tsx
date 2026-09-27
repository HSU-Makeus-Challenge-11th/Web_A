import './movie-grid.css';
import type { Movie } from '../types/movie';
import MovieCard from './movie-card';

interface MovieGridProps {
  movies: Movie[];
  onToggleBookmark: (id: number) => void;
}

function MovieGrid({ movies, onToggleBookmark }: MovieGridProps) {
  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onToggleBookmark={onToggleBookmark} />
      ))}
    </div>
  );
}

export default MovieGrid;
