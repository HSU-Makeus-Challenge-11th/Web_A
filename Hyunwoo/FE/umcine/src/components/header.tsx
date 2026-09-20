export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <div className="logo">
            <img src="/icons/movie.svg" alt="" />
            <strong>UMCine</strong>
          </div>

          <nav aria-label="주 메뉴">
            <a href="#movie-list">영화</a>
            <span>검색</span>
            <span>내 정보</span>
          </nav>
        </div>

        <div className="header-right">
          <img src="/icons/search.svg" alt="" />
          <span className="login-button">로그인</span>
        </div>
      </div>
    </header>
  );
}