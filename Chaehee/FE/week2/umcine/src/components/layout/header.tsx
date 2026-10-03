import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '../../utils/cn';

const navLinkBase = 'text-base font-semibold text-gray-600';
const navLinkActive = 'font-bold text-gray-900 underline underline-offset-4';

export function Header() {
  const { pathname } = useLocation();
  const isMovieActive = pathname === '/' || pathname.startsWith('/movies');
  const isSearchActive = pathname.startsWith('/search');

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-[90px] w-full max-w-[1328px] items-center justify-between px-6">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-3">
            <img src="/icons/movie-icons/movie.svg" alt="" className="h-9 w-9" />
            <span className="text-xl font-extrabold tracking-tight text-gray-900">UMCine</span>
          </Link>

          <nav className="flex items-center gap-8">
            <Link to="/" className={cn(navLinkBase, isMovieActive && navLinkActive)}>
              영화
            </Link>
            <Link to="/search" className={cn(navLinkBase, isSearchActive && navLinkActive)}>
              검색
            </Link>
            <a href="#" className={navLinkBase}>
              내 정보
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/search"
            aria-label="검색"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white"
          >
            <img src="/icons/movie-icons/search.svg" alt="" className="h-5 w-5 opacity-70" />
          </Link>
          <button
            type="button"
            className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"
          >
            로그인
          </button>
        </div>
      </div>
    </header>
  );
}
