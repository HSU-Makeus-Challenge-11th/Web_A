"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { useAuthStore } from "../stores/auth-store";
import { useBookmarkStore } from "../stores/bookmark-store";
import { useDisplayStore } from "../stores/display-store";
import { useProfileStore } from "../stores/profile-store";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  }));
  useEffect(() => {
    void useAuthStore.persist.rehydrate();
    void useBookmarkStore.persist.rehydrate();
    void useDisplayStore.persist.rehydrate();
    void useProfileStore.persist.rehydrate();
  }, []);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
