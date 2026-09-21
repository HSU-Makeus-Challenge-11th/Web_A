export default function Pagination() {
  return (
    <div className="pagination">
      <button disabled>
        <img src="/icons/movie-icons/chevron-left.svg" alt="이전 페이지" />
      </button>

      <button className="page-button active">1</button>
      <button className="page-button">2</button>
      <button className="page-button">3</button>

      <button>
        <img src="/icons/movie-icons/chevron-right.svg" alt="다음 페이지" />
      </button>
    </div>
  );
}