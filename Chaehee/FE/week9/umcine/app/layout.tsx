import type { Metadata } from 'next';
import { Footer } from '../components/layout/footer';
import { Header } from '../components/layout/header';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'UMCine',
  description: 'TMDB 인기 영화를 둘러보고 즐겨찾기와 평점을 남기는 영화 서비스예요.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col bg-gray-100">
        <Providers>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
