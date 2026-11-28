import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchPage } from '../../screens/movies/search-page';

export const metadata: Metadata = {
  title: '영화 검색',
};

export default function Search() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  );
}
