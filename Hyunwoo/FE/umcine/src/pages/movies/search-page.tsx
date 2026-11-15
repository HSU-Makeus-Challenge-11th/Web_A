import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type SubmitEvent } from "react";
import { BookmarkButton } from "../../components/bookmark-button";
import { movieSearchOptions } from "../../queries/movie-queries";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";

export function SearchPage() {
  const { query } = useSearch({ from: "/search" });
  const navigate = useNavigate({ from: "/search" });
  const [searchText, setSearchText] = useState(query ?? "");
  const [previousQuery, setPreviousQuery] = useState(query);
  if (previousQuery !== query) {
    setPreviousQuery(query);
    setSearchText(query ?? "");
  }

  const normalizedQuery = query?.trim() ?? "";
  const searchQuery = useQuery(movieSearchOptions(normalizedQuery));
  const movies = searchQuery.data?.results ?? [];

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = searchText.trim();
    navigate({
      search: nextQuery ? { query: nextQuery } : {},
    });
  }

  return (
    <main>
      <h1>영화 검색</h1>
      <form onSubmit={handleSubmit}>
        <input
          aria-label="검색어"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        <button type="submit">검색</button>
      </form>

      {!normalizedQuery ? (
        <p>검색어를 입력해 주세요.</p>
      ) : searchQuery.isLoading ? (
        <p>검색 결과를 불러오는 중이에요.</p>
      ) : searchQuery.isError ? (
        <div className="flex flex-col items-start gap-2">
          <p>검색 결과를 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={() => void searchQuery.refetch()}
            disabled={searchQuery.isFetching}
            className="rounded-lg bg-[#17191d] px-4 py-2 text-sm font-bold text-white"
          >
            다시 시도
          </button>
        </div>
      ) : searchQuery.isSuccess ? (
        <>
          <h2>‘{normalizedQuery}’ 검색 결과</h2>
          <p>영화 {movies.length}편</p>
          {movies.length === 0 ? (
            <p>조건에 맞는 영화가 없어요.</p>
          ) : (
            <ul>
              {movies.map((movie) => {
                const posterUrl = getTmdbPosterUrl(movie.poster_path);

                return (
                  <li key={movie.id}>
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={`${movie.title} 포스터`}
                        className="w-[200px] aspect-[2/3] object-cover"
                      />
                    ) : (
                      <div className="flex w-[200px] aspect-[2/3] items-center justify-center bg-[#e1e5ee] text-sm text-[#8b95a5]">
                        이미지 없음
                      </div>
                    )}
                    <h3>{movie.title}</h3>
                    <p>{movie.original_title}</p>
                    <p>{movie.release_date}</p>
                    <p>{movie.overview}</p>
                    <BookmarkButton movieId={movie.id} />
                    <Link
                      to="/movies/$movieId"
                      params={{ movieId: String(movie.id) }}
                    >
                      상세 보기
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : null}
    </main>
  );
}
