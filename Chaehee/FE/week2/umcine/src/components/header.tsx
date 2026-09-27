import './header.css';

function Header() {
  return (
    <header className="header">
      <div className="header_left">
        <div className="header_logo">
          <img src="/icons/movie-icons/movie.svg" alt="" className="header_logo-icon" />
          <span className="header_logo-text">UMCine</span>
        </div>

        <nav className="header_nav">
          <a href="#" className="header_nav-link header_nav-link-active">
            영화
          </a>
          <a href="#" className="header_nav-link">
            검색
          </a>
          <a href="#" className="header_nav-link">
            내 정보
          </a>
        </nav>
      </div>

      <div className="header_right">
        <button type="button" className="header_search-button" aria-label="검색">
          <img src="/icons/movie-icons/search.svg" alt="" className="header_search-icon" />
        </button>
        <button type="button" className="header_login-button">
          로그인
        </button>
      </div>
    </header>
  );
}

export default Header;
