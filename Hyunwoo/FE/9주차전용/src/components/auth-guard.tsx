"use client";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/auth-store";

function subscribe(onChange: () => void) {
  const stopStart = useAuthStore.persist.onHydrate(onChange);
  const stopFinish = useAuthStore.persist.onFinishHydration(onChange);
  return () => { stopStart(); stopFinish(); };
}
export function AuthGuard({ children, guestOnly = false }: { children: ReactNode; guestOnly?: boolean }) {
  const hydrated = useSyncExternalStore(subscribe, () => useAuthStore.persist.hasHydrated(), () => false);
  const token = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const allowed = guestOnly ? !token : Boolean(token);
  useEffect(() => {
    if (hydrated && !allowed) router.replace(guestOnly ? "/" : "/login");
  }, [hydrated, allowed, guestOnly, router]);
  if (!hydrated || !allowed) return <p role="status" className="p-10 text-center">로그인 정보를 확인하는 중이에요.</p>;
  return children;
}
