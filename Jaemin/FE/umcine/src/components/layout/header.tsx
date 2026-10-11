import { Link } from "@tanstack/react-router";
import { cn } from "../../utils/cn";

export function Header() {
  return (
    <header className="flex min-h-[72px] flex-wrap items-center justify-between gap-4 border-b border-[#e5e5e5] bg-white px-4 py-4 sm:px-6 lg:px-16">
      <div className="flex items-center gap-6 sm:gap-12">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <img className="size-6" src="/icons/movie-icons/movie.svg" alt="" />
          <span>UMCine</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm sm:gap-8" aria-label="주 메뉴">
          <Link
            to="/"
            activeOptions={{ exact: true }}
          >
            {({ isActive }) => (
              <span className={cn("text-[#777777]", isActive && "font-semibold text-[#111111]")}>영화</span>
            )}
          </Link>

          <Link to="/search" activeOptions={{ exact: true, includeSearch: false }}>
            {({ isActive }) => (
              <span className={cn("text-[#777777]", isActive && "font-semibold text-[#111111] underline underline-offset-4")}>검색</span>
            )}
          </Link>

          <button type="button" disabled className="hidden text-[#777777] sm:block">
            내 정보
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <Link to="/search" className="flex size-9 items-center justify-center rounded-[6px] border border-[#dddddd]" aria-label="검색">
          <img className="size-5" src="/icons/movie-icons/search.svg" alt="" />
        </Link>

        <button type="button" disabled className="rounded-[6px] bg-[#2563eb] px-[18px] py-[9px] text-sm text-white">로그인</button>
      </div>
    </header>
  );
}
