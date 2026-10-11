import MovieGrid from '../../components/movies/movie-grid';
import { movies } from '../../data/movies';

export function MovieListPage() {
  return (
    <main className="mx-auto w-full max-w-[1328px] px-6 pb-16 pt-8">
      <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900">영화 목록</h1>
      <MovieGrid movies={movies} />
    </main>
  );
}
