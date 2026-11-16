"use client";

import { useQueries } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import MovieGrid from "../../components/movies/movie-grid";
import Pagination from "../../components/movies/pagination";
import { useMeQuery } from "../../hooks/use-me-query";
import { movieDetailOptions } from "../../queries/movie-queries";
import { useFavoriteList } from "../../hooks/use-favorites";
import { useProfileStore } from "../../stores/profile-store";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";
import { ProfileAvatar } from "./profile-avatar";

const BOOKMARKS_PER_PAGE = 10;

export function ProfilePage() {
  const meQuery = useMeQuery();
  const avatar = useProfileStore((state) => state.avatar);
  const { bookmarkIds, toggleBookmark, query: favoritesQuery, mutation: favoriteMutation } = useFavoriteList();
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(bookmarkIds.length / BOOKMARKS_PER_PAGE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const start = (currentPage - 1) * BOOKMARKS_PER_PAGE;
  const bookmarkQueries = useQueries({
    queries: bookmarkIds.slice(start, start + BOOKMARKS_PER_PAGE).map(movieDetailOptions),
  });
  const cards = bookmarkQueries.flatMap(({ data }) => data ? [{
    id: data.id,
    title: data.title,
    releaseDate: data.release_date.replaceAll("-", "."),
    posterPath: getTmdbPosterUrl(data.poster_path),
    isBookmarked: true,
  }] : []);
  const failedQueries = bookmarkQueries.filter((query) => query.isError);

  return (
    <main className="mx-auto w-full max-w-[1320px] px-5 pt-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-7">
        <h1 className="text-[32px] leading-tight font-bold tracking-tight">내 정보</h1>
        <Link href="/profile/edit" className="rounded-lg bg-[#2563eb] px-4 py-3 text-sm font-bold text-white">
          정보 수정
        </Link>
      </div>

      <section className="border-y border-[#e1e5ee] py-3" aria-labelledby="profile-details-title">
        <h2 id="profile-details-title" className="text-base font-bold">기본 정보</h2>
        {meQuery.isLoading && <p role="status" className="mt-4 text-sm text-[#667085]">내 정보를 불러오는 중이에요.</p>}
        {meQuery.isError && <p role="alert" className="mt-4 text-sm text-red-600">내 정보를 불러오지 못했어요.</p>}
        <div className="mt-4 flex flex-wrap items-center gap-7">
          <ProfileAvatar avatar={avatar} />
          <dl className="grid w-full min-w-0 gap-4 sm:w-auto sm:flex-1 sm:grid-cols-[minmax(0,376px)_minmax(0,1fr)]">
            <div>
              <dt className="text-xs text-[#667085]">닉네임</dt>
              <dd className="mt-1 text-sm font-bold break-all">{meQuery.data?.nickname ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[#667085]">이메일</dt>
              <dd className="mt-1 text-sm font-bold break-all">{meQuery.data?.email ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mt-6" aria-labelledby="profile-bookmarks-title">
        <h2 id="profile-bookmarks-title" className="mb-3 text-base font-bold">내 즐겨찾기</h2>
        {favoritesQuery.isLoading && <p role="status">즐겨찾기를 불러오는 중이에요.</p>}
        {favoritesQuery.isError && (
          <p role="alert">즐겨찾기를 불러오지 못했어요. <button type="button" onClick={() => void favoritesQuery.refetch()}>다시 시도</button></p>
        )}
        {favoritesQuery.isSuccess && bookmarkIds.length === 0 && (
          <p className="py-8 text-sm text-[#667085]">즐겨찾기한 영화가 없어요.</p>
        )}
        {cards.length > 0 && (
          <MovieGrid movies={cards} onToggleBookmark={toggleBookmark} bookmarkDisabled={favoritesQuery.isFetching || favoriteMutation.isPending} cardSize="small" />
        )}
        {bookmarkQueries.some((query) => query.isPending) && (
          <p role="status" className="py-4 text-sm text-[#667085]">즐겨찾기를 불러오는 중이에요.</p>
        )}
        {failedQueries.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 py-4 text-sm">
            <p>일부 영화 정보를 불러오지 못했어요.</p>
            <button type="button" className="font-bold text-[#2563eb]" onClick={() => {
              void Promise.all(failedQueries.map((query) => query.refetch()));
            }}>
              다시 시도
            </button>
          </div>
        )}
        {totalPages > 0 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        )}
      </section>
    </main>
  );
}
