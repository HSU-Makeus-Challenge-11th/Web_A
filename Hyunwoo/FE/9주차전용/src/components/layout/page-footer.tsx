"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
export function PageFooter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return ["/login", "/signup", "/profile/edit"].includes(pathname) ? null : children;
}
