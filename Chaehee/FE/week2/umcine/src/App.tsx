import { useState } from 'react';
import Header from './components/header';
import MovieGrid from './components/movie-grid';
import Pagination from './components/pagination';
import { movies as initialMovies } from './data/movies';
import type { Movie } from './types/movie';
import './App.css';

function App() {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [currentPage, setCurrentPage] = useState(1);

  const handleToggleBookmark = (id: number) => {
    setMovies((prevMovies) =>
      prevMovies.map((movie) =>
        movie.id === id ? { ...movie, isBookmarked: !movie.isBookmarked } : movie,
      ),
    );
  };

  return (
    <>
      <Header />
      <main className="page">
        <h2 className="page__title">영화 목록</h2>
        <MovieGrid movies={movies} onToggleBookmark={handleToggleBookmark} />
        <Pagination 
          currentPage={currentPage} 
          onPageChange={setCurrentPage} 
        />
      </main>
    </>
  );
}

export default App;
