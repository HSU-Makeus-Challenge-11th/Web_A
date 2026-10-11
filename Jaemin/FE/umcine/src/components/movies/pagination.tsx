import { cn } from "../../utils/cn";

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, onPageChange }: PaginationProps) {
  const pages = [1, 2, 3, 4, 5];
  const buttonClass = "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[6px] border border-[#dddddd] bg-white disabled:cursor-default disabled:opacity-40";

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="영화 목록 페이지">
      <button
        type="button"
        disabled={currentPage === 1}
        className={buttonClass}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        <img className="size-4" src="/icons/movie-icons/chevron-left.svg" alt="이전 페이지" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={cn(buttonClass, currentPage === page && "bg-[#111111] text-white")}
          aria-label={`${page}페이지`}
          aria-current={currentPage === page ? "page" : undefined}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage === 5}
        className={buttonClass}
        onClick={() => onPageChange(Math.min(5, currentPage + 1))}
      >
        <img className="size-4" src="/icons/movie-icons/chevron-right.svg" alt="다음 페이지" />
      </button>
    </nav>
  );
}
