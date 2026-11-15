import { createRootRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";

export const Route = createRootRoute({
    component: RootLayout,
    notFoundComponent: () => <main>페이지를 찾을 수 없어요.</main>,
});

function RootLayout() {
    const matchRoute = useMatchRoute();
    const hideFooter =
        matchRoute({ to: "/login" }) ||
        matchRoute({ to: "/signup" }) ||
        matchRoute({ to: "/profile/edit" });

    return (
        <div className="flex min-h-screen flex-col bg-[#f5f6f8] font-[Arial,sans-serif] text-[#202329]">
            <Header />

            <div className="flex-1">
                <Outlet />
            </div>

            {!hideFooter && <Footer />}
        </div>
    );
}
