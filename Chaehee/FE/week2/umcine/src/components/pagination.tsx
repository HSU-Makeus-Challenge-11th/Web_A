import './pagination.css';

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, onPageChange }: PaginationProps) {
  const pages = [1, 2, 3, 4, 5];

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
