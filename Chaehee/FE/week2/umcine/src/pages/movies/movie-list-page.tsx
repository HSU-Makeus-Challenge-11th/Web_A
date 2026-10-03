import { useState } from 'react';
import MovieGrid from '../../components/movies/movie-grid';
import { movies as initialMovies } from '../../data/movies';
import type { Movie } from '../../types/movie';

export function MovieListPage() {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);

  const handleToggleBookmark = (id: number) => {
    setMovies((prevMovies) =>
      prevMovies.map((movie) =>
        movie.id === id ? { ...movie, isBookmarked: !movie.isBookmarked } : movie,
      ),
    );
  };

  return (
    <main className="mx-auto w-full max-w-[1328px] px-6 pb-16 pt-8">
      <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900">영화 목록</h1>
      <MovieGrid movies={movies} onToggleBookmark={handleToggleBookmark} />
    </main>
  );
}
