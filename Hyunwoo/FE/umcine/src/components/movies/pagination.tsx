import { cn } from "../../utils/cn";

const VISIBLE_PAGE_COUNT = 5;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const count = Math.min(VISIBLE_PAGE_COUNT, totalPages);
  const start = Math.min(
    Math.max(currentPage - Math.floor(count / 2), 1),
    totalPages - count + 1,
  );

  return Array.from({ length: count }, (_, index) => start + index);
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = getVisiblePages(currentPage, totalPages);

  const buttonClass =
    "h-9 w-9 rounded-[6px] border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-2"
      aria-label="페이지 이동"
    >
      <button
        type="button"
        aria-label="이전 페이지"
        className={cn(buttonClass, "bg-transparent text-[#202329]")}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹
      </button>

      {pages.map((page) => (
        <button
          type="button"
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            buttonClass,
            currentPage === page
              ? "bg-[#202329] text-white"
              : "bg-transparent text-[#202329]",
          )}
          aria-current={currentPage === page ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        aria-label="다음 페이지"
        className={cn(buttonClass, "bg-transparent text-[#202329]")}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ›
      </button>
    </nav>
  );
}
