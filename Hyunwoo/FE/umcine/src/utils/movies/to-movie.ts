import type { TmdbMovieListItem } from "../../api/movies/models";
import type { Movie } from "../../types/movie";
import { getTmdbBackdropUrl, getTmdbPosterUrl } from "./tmdb-image";

// 목록 응답에는 장르 이름 없이 ID만 와서 TMDB 영화 장르 목록으로 이름을 찾아요.
const TMDB_GENRE_NAMES: Record<number, string> = {
  28: "액션",
  12: "모험",
  16: "애니메이션",
  35: "코미디",
  80: "범죄",
  99: "다큐멘터리",
  18: "드라마",
  10751: "가족",
  14: "판타지",
  36: "역사",
  27: "공포",
  10402: "음악",
  9648: "미스터리",
  10749: "로맨스",
  878: "SF",
  10770: "TV 영화",
  53: "스릴러",
  10752: "전쟁",
  37: "서부",
};

function formatReleaseDate(releaseDate: string) {
  return releaseDate.replaceAll("-", ".");
}

export function toMovie(
  movie: TmdbMovieListItem,
  isBookmarked: boolean,
): Movie {
  return {
    id: movie.id,
    title: movie.title,
    originalTitle: movie.original_title,
    releaseDate: formatReleaseDate(movie.release_date),
    posterPath: getTmdbPosterUrl(movie.poster_path),
    backdropPath: getTmdbBackdropUrl(movie.backdrop_path),
    genres: movie.genre_ids
      .map((genreId) => TMDB_GENRE_NAMES[genreId])
      .filter((genreName) => genreName !== undefined),
    runtime: "",
    tagline: "",
    overview: movie.overview,
    isBookmarked,
  };
}
