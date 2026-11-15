export interface Movie {
  id: number;
  title: string;
  originalTitle: string;
  releaseDate: string;
  posterPath: string | null;
  backdropPath: string | null;
  genres: string[];
  runtime: string;
  tagline: string;
  overview: string;
  isBookmarked: boolean;
}