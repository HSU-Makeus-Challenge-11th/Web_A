import MovieGrid from '../../components/movies/movie-grid';
import { movies } from '../../data/movies';
import { useViewSettingsStore, type MovieSortOrder } from '../../stores/view-settings-store';
import { cn } from '../../utils/cn';

const sortOptions: { value: MovieSortOrder; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'title', label: '제목순' },
];

export function MovieListPage() {
  const sortOrder = useViewSettingsStore((state) => state.sortOrder);
  const setSortOrder = useViewSettingsStore((state) => state.setSortOrder);

  const sortedMovies = [...movies].sort((a, b) =>
    sortOrder === 'latest'
      ? b.releaseDate.localeCompare(a.releaseDate)
      : a.title.localeCompare(b.title, 'ko'),
  );

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
      <MovieGrid movies={sortedMovies} />
    </main>
  );
}
