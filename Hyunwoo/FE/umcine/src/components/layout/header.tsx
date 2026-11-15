import { Link } from "@tanstack/react-router";
import { useMeQuery } from "../../hooks/use-me-query";
import { useAuthStore } from "../../stores/auth-store";

export function Header() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const meQuery = useMeQuery();

  return (
    <header className="h-[90px] border-b border-[#e1e5ee] bg-white">
      <div className="mx-auto flex h-full max-w-[1320px] items-center gap-3 px-4 sm:gap-10 sm:px-5">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img
            src="/icons/movie.svg"
            alt=""
            className="size-6 sm:size-8"
          />
          <span className="text-lg font-extrabold tracking-tight text-[#202329] sm:text-xl">
            UMCine
          </span>
        </Link>
        <nav className="flex items-center gap-3 whitespace-nowrap sm:gap-8">
          <Link
            to="/"
            className="text-sm font-bold"
            activeOptions={{ exact: true }}
            activeProps={{
              className: "text-[#202329] underline underline-offset-4",
            }}
            inactiveProps={{
              className: "text-[#667085]",
            }}
          >
            영화
          </Link>
          <Link
            to="/search"
            className="text-sm font-bold"
            activeOptions={{ exact: true, includeSearch: false }}
            activeProps={{
              className: "text-[#202329] underline underline-offset-4",
            }}
            inactiveProps={{
              className: "text-[#667085]",
            }}
          >
            검색
          </Link>
          <Link
            to="/profile"
            className="shrink-0 text-sm font-bold"
            activeProps={{ className: "text-[#202329] underline underline-offset-4" }}
            inactiveProps={{ className: "text-[#667085]" }}
          >
            내 정보
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            to="/search"
            aria-label="영화 검색"
            className="hidden h-[42px] w-[42px] items-center justify-center rounded-lg border border-[#e1e5ee] sm:flex"
          >
            <img
              src="/icons/search.svg"
              alt=""
              className="h-6 w-6"
            />
          </Link>

          {!accessToken ? (
            <Link
              to="/login"
              className="rounded-lg bg-[#2563eb] px-3 py-3 text-sm font-bold whitespace-nowrap text-white sm:px-4"
            >
              로그인
            </Link>
          ) : meQuery.isLoading ? (
            <span
              role="status"
              aria-label="내 정보 불러오는 중"
              className="h-10 w-24 animate-pulse rounded-lg bg-gray-200"
            />
          ) : (
            <Link
              to="/profile"
              className="rounded-lg bg-[#2563eb] px-3 py-3 text-sm font-bold whitespace-nowrap text-white sm:px-4"
            >
              마이페이지
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
