import { useState, type SubmitEvent } from "react";
import { useLoginMutation } from "../../hooks/use-login-mutation";
import { AuthLayout } from "./auth-layout";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const loginMutation = useLoginMutation();
  const canSubmit = EMAIL_REGEX.test(form.email.trim()) && form.password.length > 0;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || loginMutation.isPending) return;

    loginMutation.mutate({
      email: form.email.trim(),
      password: form.password,
    });
  }

  return (
    <AuthLayout title="로그인" prompt="처음이신가요?" linkTo="/signup" linkLabel="회원가입">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-xs font-bold">이메일</label>
          <div className="mt-2 flex h-12 items-center gap-2 rounded-lg border border-[#e1e5ee] bg-white px-3.5 focus-within:border-[#2563eb]">
            <img src="/icons/mail.svg" alt="" className="size-4" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="name@example.com"
              required
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              disabled={loginMutation.isPending}
              className="min-w-0 flex-1 text-sm outline-none placeholder:text-[#8b95a5]"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-bold">비밀번호</label>
          <div className="mt-2 flex h-12 items-center gap-2 rounded-lg border border-[#e1e5ee] bg-white px-3.5 focus-within:border-[#2563eb]">
            <img src="/icons/lock.svg" alt="" className="size-4" />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호"
              required
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              disabled={loginMutation.isPending}
              className="min-w-0 flex-1 text-sm outline-none placeholder:text-[#8b95a5]"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!canSubmit || loginMutation.isPending}
          className="h-[46px] w-full rounded-lg bg-[#2563eb] text-sm font-bold text-white disabled:cursor-not-allowed"
        >
          {loginMutation.isPending ? "로그인 중" : "로그인"}
        </button>
      </form>
    </AuthLayout>
  );
}
