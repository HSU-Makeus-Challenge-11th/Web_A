import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Footer } from '../components/layout/footer';
import { Header } from '../components/layout/header';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'UMCine', template: '%s | UMCine' },
  description: 'TMDB 인기 영화를 둘러보고 즐겨찾기와 평점을 남기는 영화 서비스예요.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col bg-gray-100">
        <Providers>
          <Suspense fallback={<div className="h-[91px] border-b border-gray-200 bg-white" />}>
            <Header />
          </Suspense>
          <div className="flex-1">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
