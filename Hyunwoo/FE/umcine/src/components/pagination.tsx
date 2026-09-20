import { useState } from "react";

export default function Pagination() {
  const [currentPage, setCurrentPage] = useState(1);

  const pages = [1, 2, 3, 4, 5];

  return (
    <nav className="pagination" aria-label="페이지 이동">
      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={
            currentPage === page ? "active" : ""
          }
          aria-current={
            currentPage === page ? "page" : undefined
          }
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === 5}
      >
        ›
      </button>
    </nav>
  );
}