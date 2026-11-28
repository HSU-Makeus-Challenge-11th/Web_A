import type { Metadata } from 'next';
import { MovieListPage } from '../screens/movies/movie-list-page';

export const metadata: Metadata = {
  title: { absolute: '영화 목록 | UMCine' },
};

export default function HomePage() {
  return <MovieListPage />;
}
