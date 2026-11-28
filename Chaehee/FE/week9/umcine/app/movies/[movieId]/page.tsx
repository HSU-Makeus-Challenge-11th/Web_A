import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MovieDetailPage } from '../../../screens/movies/movie-detail-page';

export const metadata: Metadata = {
  title: '영화 상세',
};

export default function MovieDetail({ params }: PageProps<'/movies/[movieId]'>) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-[1328px] px-6 py-16">
          <p className="text-lg font-semibold text-gray-900">영화 정보를 불러오는 중이에요.</p>
        </main>
      }
    >
      <MovieDetailScreen params={params} />
    </Suspense>
  );
}

async function MovieDetailScreen({ params }: Pick<PageProps<'/movies/[movieId]'>, 'params'>) {
  const { movieId } = await params;
  return <MovieDetailPage movieId={movieId} />;
}
