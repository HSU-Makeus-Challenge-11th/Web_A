export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <a href="#" className="logo">
          <span className="logo-icon"><img src="/icons/movie-icons/movie.svg" alt="UMCine 로고" /></span>
          <span>UMCine</span>
        </a>

        <nav className="nav">
          <a href="#" className="nav-link active">
            영화
          </a>

          <a href="#" className="nav-link">
            검색
          </a>

          <a href="#" className="nav-link">
            내 정보
          </a>
        </nav>
      </div>

      <div className="header-right">
        <button className="header-search-button" aria-label="검색">
          <img src="/icons/movie-icons/search.svg" alt="" />
        </button>

        <button className="login-button">로그인</button>
      </div>
    </header>
  );
}