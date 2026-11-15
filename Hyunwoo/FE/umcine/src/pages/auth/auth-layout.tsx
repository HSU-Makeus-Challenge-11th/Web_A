import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
  prompt: string;
  linkTo: "/login" | "/signup";
  linkLabel: string;
}

export function AuthLayout({ title, children, prompt, linkTo, linkLabel }: AuthLayoutProps) {
  return (
    <main className="grid min-h-[calc(100dvh-90px)] place-items-center px-5 py-10">
      <section className="w-full max-w-[432px]" aria-labelledby="auth-title">
        <h1 id="auth-title" className="mb-4 text-[32px] leading-tight font-extrabold">
          {title}
        </h1>
        {children}
        <p className="mt-4 text-center text-xs text-[#667085]">
          {prompt}{" "}
          <Link to={linkTo} className="font-bold text-[#2563eb] hover:underline">
            {linkLabel}
          </Link>
        </p>
      </section>
    </main>
  );
}
