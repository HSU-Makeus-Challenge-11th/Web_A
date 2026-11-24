import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '../../stores/auth-store';

export const Route = createFileRoute('/(protected)/_protected')({
  beforeLoad: () => {
    if (!useAuthStore.getState().accessToken) {
      alert('로그인이 필요한 페이지예요.');
      throw redirect({ to: '/login' });
    }
  },
  component: Outlet,
});
