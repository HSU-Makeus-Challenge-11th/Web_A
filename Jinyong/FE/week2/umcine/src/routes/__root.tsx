import { Outlet, createRootRoute } from '@tanstack/react-router';
import { Footer } from '../components/layout/footer';
import { Header } from '../components/layout/header';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
