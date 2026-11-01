import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getMovies } from '../../api/movies/get-movies';
import MovieGrid from '../../components/movies/movie-grid';
import Pagination from '../../components/movies/pagination';
import { useViewSettingsStore, type MovieSortOrder } from '../../stores/view-settings-store';
import { cn } from '../../utils/cn';

const sortOptions: { value: MovieSortOrder; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'title', label: '제목순' },
];

export function MovieListPage() {
  const sortOrder = useViewSettingsStore((state) => state.sortOrder);
  const setSortOrder = useViewSettingsStore((state) => state.setSortOrder);

  const [page, setPage] = useState(1);

  const moviesQuery = useQuery({
    queryKey: ['movies', 'list', { page }],
    queryFn: () => getMovies({ page }),
  });

  const movies = moviesQuery.data?.results ?? [];
  const totalPages = moviesQuery.data?.total_pages ?? 0;

  const sortedMovies = [...movies].sort((a, b) =>
    sortOrder === 'latest'
      ? b.release_date.localeCompare(a.release_date)
      : a.title.localeCompare(b.title, 'ko'),
  );

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  return (
    <main className="mx-auto w-full max-w-[1328px] px-6 pb-16 pt-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">영화 목록</h1>
        <div className="flex gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSortOrder(option.value)}
              aria-pressed={sortOrder === option.value}
              className={cn(
                'h-9 rounded-lg border px-3 text-sm font-semibold',
                sortOrder === option.value
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-600',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {moviesQuery.isPending ? (
        <p className="py-16 text-center text-gray-500">영화 목록을 불러오는 중이에요.</p>
      ) : moviesQuery.isError ? (
        <p className="py-16 text-center text-red-500">영화 목록을 불러오지 못했어요.</p>
      ) : sortedMovies.length === 0 ? (
        <p className="py-16 text-center text-gray-500">조건에 맞는 영화가 없어요.</p>
      ) : (
        <>
          <MovieGrid movies={sortedMovies} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </main>
  );
}
