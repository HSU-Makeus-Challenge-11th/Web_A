import './pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MAX_VISIBLE_PAGES = 5;

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from(
    { length: Math.min(totalPages, MAX_VISIBLE_PAGES) },
    (_, index) => index + 1,
  );

  return (
    <nav className="pagination" aria-label="페이지네이션">
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={
            page === currentPage
              ? 'pagination_button pagination_button-active'
              : 'pagination_button'
          }
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
    </nav>
  );
}

export default Pagination;
