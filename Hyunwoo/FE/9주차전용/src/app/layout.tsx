import type { Metadata } from "next";
import { Suspense } from "react";
import { Providers } from "./providers";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";
import { PageFooter } from "../components/layout/page-footer";
import "../index.css";
export const metadata: Metadata = {
  title: "UMCine", description: "영화를 검색하고 나만의 즐겨찾기와 평점을 기록하세요.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body>
    <Providers>
      <div className="flex min-h-screen flex-col bg-[#f5f6f8] font-[Arial,sans-serif] text-[#202329]">
        <Suspense fallback={<div className="h-[90px]" />}><Header /></Suspense>
        <div className="flex-1">{children}</div>
        <Suspense fallback={null}><PageFooter><Footer /></PageFooter></Suspense>
      </div>
    </Providers>
  </body></html>;
}
