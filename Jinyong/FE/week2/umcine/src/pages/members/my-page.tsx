import { useState } from "react";
import { Link } from "@tanstack/react-router";
import Pagination from "../../components/movies/pagination";
import { SAMPLE_FAVORITE_MOVIES, SAMPLE_MEMBER } from "./sample-member";

export function MyPage() {
  const [page, setPage] = useState(1);

  return (
    <main className="mx-auto w-full max-w-332 px-6 pt-8 pb-16">
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          내 정보
        </h1>
        <Link
          to="/my/edit"
          className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"
        >
          정보 수정
        </Link>
      </div>

      <section className="border-b border-gray-200 py-6">
        <h2 className="text-lg font-bold text-gray-900">기본 정보</h2>
        <div className="mt-4 flex items-center gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gray-200">
            <img
              src="/icons/movie-icons/person.svg"
              alt=""
              className="h-9 w-9"
            />
          </div>
          <dl className="flex flex-wrap gap-x-4 gap-y-3">
            <div className="w-98">
              <dt className="text-xs text-gray-400">닉네임</dt>
              <dd className="mt-1 text-sm font-bold text-gray-900">
                {SAMPLE_MEMBER.nickname}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">이메일</dt>
              <dd className="mt-1 text-sm font-bold text-gray-900">
                {SAMPLE_MEMBER.email}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="pt-6">
        <h2 className="text-lg font-bold text-gray-900">내 즐겨찾기</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {SAMPLE_FAVORITE_MOVIES.map((movie) => (
            <article key={movie.id} className="flex flex-col gap-2">
              <img
                src={movie.posterUrl}
                alt={`${movie.title} 포스터`}
                className="block aspect-7/8 w-full rounded-xl object-cover"
              />
              <div className="flex flex-col gap-1">
                <span className="truncate text-base leading-tight font-bold tracking-tight text-gray-900">
                  {movie.title}
                </span>
                <span className="text-sm leading-none text-gray-400">
                  {movie.releaseDate}
                </span>
              </div>
            </article>
          ))}
        </div>
        <Pagination currentPage={page} totalPages={1} onPageChange={setPage} />
      </section>
    </main>
  );
}
