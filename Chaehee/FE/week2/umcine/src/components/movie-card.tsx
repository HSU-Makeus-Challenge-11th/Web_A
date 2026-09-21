import './movie-card.css';
import type { Movie } from '../types/movie';

interface MovieCardProps {
  movie: Movie;
  onToggleBookmark: (id: number) => void;
}

function MovieCard({ movie, onToggleBookmark }: MovieCardProps) {
  return (
    <div className="movie-card">
      <div className="movie-card_poster-wrapper">
        <img className="movie-card_poster" src={movie.posterPath} alt={movie.title} />

        <button
          type="button"
          className={
            movie.isBookmarked
              ? 'movie-card_bookmark movie-card_bookmark--active'
              : 'movie-card_bookmark'
          }
          onClick={() => onToggleBookmark(movie.id)}
          aria-pressed={movie.isBookmarked}
          aria-label={movie.isBookmarked ? '북마크 해제' : '북마크 추가'}
        >
          <img
            src={
              movie.isBookmarked
                ? '/icons/movie-icons/bookmark.svg'
                : '/icons/movie-icons/bookmark-outline.svg'
            }
            alt=""
            className="movie-card_bookmark-icon"
          />
        </button>
      </div>

      <div className="movie-card_info">
        <span className="movie-card_title">{movie.title}</span>
        <span className="movie-card_release-date">{movie.releaseDate}</span>
      </div>
    </div>
  );
}

export default MovieCard;
