import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useState, type SubmitEvent } from 'react';
import { movies } from '../../data/movies';
import { cn } from '../../utils/cn';

export function SearchPage() {
  const { query } = useSearch({ from: '/search' });
  const navigate = useNavigate({ from: '/search' });
  const [searchText, setSearchText] = useState(query ?? '');

  useEffect(() => {
    setSearchText(query ?? '');
  }, [query]);

  const normalizedQuery = query?.trim().toLowerCase() ?? '';
  const hasQuery = normalizedQuery !== '';
  const searchResults = hasQuery
    ? movies.filter(
        (movie) =>
          movie.title.toLowerCase().includes(normalizedQuery) ||
          movie.originalTitle.toLowerCase().includes(normalizedQuery),
      )
    : [];

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = searchText.trim();
    navigate({
      search: nextQuery ? { query: nextQuery } : {},
    });
  }

  return (
    <main
      className={cn(
        'mx-auto w-full max-w-[1328px] px-6',
        hasQuery ? 'pb-16 pt-8' : 'pt-40 sm:pt-52',
      )}
    >
      <h1
        className={cn(
          'text-4xl font-extrabold tracking-tight text-gray-900',
          !hasQuery && 'text-center sm:text-5xl',
        )}
      >
        {hasQuery ? '영화 검색' : '어떤 영화를 찾고 있나요?'}
      </h1>

      <form
        onSubmit={handleSubmit}
        className={cn(
          'flex items-center gap-3 bg-white',
          hasQuery
            ? 'mt-6 h-14 rounded-xl border border-gray-200 px-4'
            : 'mx-auto mt-10 h-[72px] max-w-[800px] rounded-2xl border-2 border-gray-900 px-6 shadow-xl',
        )}
      >
        <img src="/icons/movie-icons/search.svg" alt="" className="h-5 w-5 opacity-60" />
        <input
          aria-label="검색어"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="예: 스파이더맨"
          className={cn(
            'min-w-0 flex-1 bg-transparent outline-none placeholder:text-gray-400',
            hasQuery ? 'font-semibold text-gray-900' : 'text-lg',
          )}
        />
        {hasQuery && searchText && (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={() => setSearchText('')}
            className="p-2"
          >
            <img src="/icons/movie-icons/close.svg" alt="" className="h-4 w-4 opacity-70" />
          </button>
        )}
        <button
          type="submit"
          className="h-10 shrink-0 rounded-lg bg-gray-900 px-5 text-sm font-semibold text-white"
        >
          {hasQuery ? '다시 검색' : '검색'}
        </button>
      </form>

      {hasQuery && (
        <section className="mt-6">
          <div className="flex items-baseline justify-between border-b border-gray-200 pb-4">
            <h2 className="text-xl font-bold text-gray-900">‘{query}’ 검색 결과</h2>
            <p className="text-sm text-gray-400">영화 {searchResults.length}편 · 1페이지</p>
          </div>

          {searchResults.length === 0 ? (
            <p className="py-16 text-center text-gray-500">검색 결과가 없어요.</p>
          ) : (
            <ul className="grid gap-x-10 md:grid-cols-2">
              {searchResults.map((movie) => (
                <li key={movie.id} className="flex gap-5 border-b border-gray-200 py-6">
                  <img
                    src={movie.posterPath}
                    alt={`${movie.title} 포스터`}
                    className="aspect-[2/3] w-28 shrink-0 self-start rounded-xl object-cover sm:w-32"
                  />
                  <div className="flex min-w-0 flex-col gap-2">
                    <h3 className="text-xl font-bold text-gray-900">{movie.title}</h3>
                    <p className="text-sm text-gray-400">
                      {movie.originalTitle}
                      <span className="ml-2">{movie.releaseDate}</span>
                    </p>
                    <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">
                      {movie.overview}
                    </p>
                    <Link
                      to="/movies/$movieId"
                      params={{ movieId: String(movie.id) }}
                      className="mt-3 text-sm font-semibold text-blue-600"
                    >
                      상세 보기 →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
