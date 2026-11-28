'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type SubmitEvent } from 'react';
import { useLoginMutation } from '../../hooks/use-login-mutation';
import { useAuthStore } from '../../stores/auth-store';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_FORM = {
  email: '',
  password: '',
};

type LoginFormKey = keyof typeof DEFAULT_FORM;

const inputBoxClass =
  'flex h-12 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4';
const inputClass = 'min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400';

export function LoginPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (accessToken) router.replace('/');
  }, [accessToken, router]);

  const loginMutation = useLoginMutation();
  const canSubmit = EMAIL_REGEX.test(form.email.trim()) && form.password.length > 0;

  const handleChangeField = (key: LoginFormKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || loginMutation.isPending) return;

    loginMutation.mutate({
      email: form.email.trim(),
      password: form.password,
    });
  };

  return (
    <main className="mx-auto w-full max-w-[430px] px-6 pb-24 pt-40">
      <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900">로그인</h1>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-bold text-gray-900">
          이메일
          <div className={inputBoxClass}>
            <img src="/icons/movie-icons/mail.svg" alt="" className="h-4 w-4 opacity-60" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChangeField('email', e.target.value)}
              placeholder="name@example.com"
              className={inputClass}
            />
          </div>
        </label>

        <label className="flex flex-col gap-2 text-sm font-bold text-gray-900">
          비밀번호
          <div className={inputBoxClass}>
            <img src="/icons/movie-icons/lock.svg" alt="" className="h-4 w-4 opacity-60" />
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChangeField('password', e.target.value)}
              placeholder="비밀번호"
              className={inputClass}
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={!canSubmit || loginMutation.isPending}
          className="mt-2 h-12 rounded-lg bg-blue-600 text-sm font-bold text-white disabled:bg-gray-300"
        >
          {loginMutation.isPending ? '로그인 중' : '로그인'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        처음이신가요?{' '}
        <Link href="/signup" className="font-bold text-blue-600">
          회원가입
        </Link>
      </p>
    </main>
  );
}
