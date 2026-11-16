import { MovieDetailPage } from "@/screens/movies/movie-detail-page";
export default async function Page({ params }: { params: Promise<{ movieId: string }> }) {
  const { movieId } = await params;
  return <MovieDetailPage movieId={movieId} />;
}
