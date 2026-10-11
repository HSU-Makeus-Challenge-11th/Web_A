import { BookmarkButton } from "../../components/bookmark-button";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useRef, useState, type SubmitEvent } from "react";
import { movies } from "../../data/movies";
import { cn } from "../../utils/cn";

function SearchForm({ query, hasQuery }: { query: string; hasQuery: boolean }) {
  const [searchText, setSearchText] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate({ from: "/search" });

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = searchText.trim();
    navigate({ search: nextQuery ? { query: nextQuery } : {} });
  }

  return (
    <form role="search" onSubmit={handleSubmit}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-gray-300",
        hasQuery ? "border-[#e1e5eb]" : "border-[#18191c] px-4 py-3 shadow-lg",
      )}
    >
      <img className="size-5 shrink-0" src="/icons/movie-icons/search.svg" alt="" />
      <input ref={inputRef} type="text" aria-label="영화 검색어" placeholder="예: 스파이더맨"
        value={searchText} onChange={(event) => setSearchText(event.target.value)}
        className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-gray-400" />
      {searchText && (
        <button type="button" aria-label="검색어 지우기" className="flex size-7 shrink-0 cursor-pointer items-center justify-center"
          onClick={() => { setSearchText(""); inputRef.current?.focus(); }}>
          <img className="size-4" src="/icons/movie-icons/close.svg" alt="" />
        </button>
      )}
      <button type="submit" className="shrink-0 cursor-pointer rounded-[6px] bg-[#18191c] px-4 py-2 text-xs font-semibold text-white hover:bg-gray-700">
        {hasQuery ? "다시 검색" : "검색"}
      </button>
    </form>
  );
}

export function SearchPage() {
  const { query = "" } = useSearch({ from: "/search" });
  const keyword = query.trim().toLowerCase();
  const hasQuery = keyword.length > 0;
  const results = hasQuery
    ? movies.filter((movie) => movie.title.toLowerCase().includes(keyword) || movie.originalTitle.toLowerCase().includes(keyword))
    : [];

  return (
    <main className="w-full flex-1 bg-[#f6f7f9]">
      <div className={cn("mx-auto w-full", hasQuery ? "max-w-[1280px] px-4 py-6 sm:px-6 lg:px-16" : "max-w-[680px] px-6 pt-24 pb-20 sm:pt-40")}>
        <h1 className={cn("font-bold tracking-tight", hasQuery ? "mb-4 text-3xl" : "mb-7 text-center text-2xl sm:text-4xl")}>
          {hasQuery ? "영화 검색" : "어떤 영화를 찾고 있나요?"}
        </h1>
        <SearchForm key={query} query={query} hasQuery={hasQuery} />

        {!hasQuery ? (
          <p className="mt-4 text-center text-sm text-gray-500">검색어를 입력해 주세요.</p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#e1e5eb] pb-3">
              <h2 className="min-w-0 break-words text-sm font-semibold">‘{query.trim()}’ 검색 결과</h2>
              <p role="status" className="text-xs text-gray-400">영화 {results.length}편</p>
            </div>
            {results.length === 0 ? (
              <p className="py-20 text-center text-sm text-gray-500">검색 결과가 없어요.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
                {results.map((movie) => (
                  <li key={movie.id} className="flex min-w-0 gap-4 border-b border-[#e1e5eb] py-4">
                    <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }} className="w-24 shrink-0 sm:w-28">
                      <img className="aspect-[2/3] w-full rounded-lg object-cover" src={movie.posterPath} alt={`${movie.title} 포스터`} />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col py-1">
                      <h3 className="text-sm font-bold">{movie.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-gray-400">
                        <p>{movie.originalTitle}</p>
                        <p>{movie.releaseDate}</p>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-gray-500">{movie.overview}</p>
                      <BookmarkButton movieId={movie.id} />
                      <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }} className="mt-auto w-fit pt-4 text-xs font-semibold text-[#2563eb] hover:underline">
                        상세 보기 →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </main>
  );
}
