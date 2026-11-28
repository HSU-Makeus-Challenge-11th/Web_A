'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { useAuthHydrated } from '../../hooks/use-auth-hydrated';
import { useAuthStore } from '../../stores/auth-store';

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthHydrated = useAuthHydrated();
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasRedirectedRef = useRef(false);

  const isBlocked = isAuthHydrated && !accessToken;

  useEffect(() => {
    if (!isBlocked || hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;
    alert('로그인이 필요한 페이지예요.');
    router.replace('/login');
  }, [isBlocked, router]);

  if (!isAuthHydrated || !accessToken) {
    return (
      <main className="mx-auto w-full max-w-[1328px] px-6 pt-8">
        <div className="h-40 animate-pulse rounded-lg bg-gray-100" />
      </main>
    );
  }

  return children;
}
