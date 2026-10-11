import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-dvh flex-col bg-white font-[Arial,sans-serif] text-[#111111]">
      <Header />
      <Outlet />
      <Footer />
    </div>
  ),
  notFoundComponent: () => (
    <main className="mx-auto w-full max-w-[1120px] px-6 py-16">
      <h1 className="mb-6 text-2xl font-bold">페이지를 찾을 수 없어요.</h1>
      <Link to="/" className="text-blue-600 underline">영화 목록으로 돌아가기</Link>
    </main>
  ),
});
