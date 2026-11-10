import { useState, type SubmitEvent } from "react";
import { Link } from "@tanstack/react-router";

const DEFAULT_FORM = {
  email: "",
  password: "",
};

type LoginFormKey = keyof typeof DEFAULT_FORM;

const LABEL_CLASS = "mb-1.5 block text-sm font-semibold text-gray-900";
const INPUT_CLASS =
  "h-12 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-10 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-900";
const ICON_CLASS =
  "pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 opacity-60";

export function LoginPage() {
  const [form, setForm] = useState(DEFAULT_FORM);

  const handleChangeField = (key: LoginFormKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    // 퍼블리싱 단계라 로그인 API는 아직 연결하지 않음
    e.preventDefault();
  };

  return (
    <main className="flex justify-center px-4 pt-78 pb-20">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full max-w-107 flex-col gap-4"
      >
        <h1 className="mb-1 text-[28px] font-bold text-gray-900">로그인</h1>

        <div>
          <label htmlFor="login-email" className={LABEL_CLASS}>
            이메일
          </label>
          <div className="relative">
            <img
              src="/icons/movie-icons/mail.svg"
              alt=""
              className={ICON_CLASS}
            />
            <input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={(e) => handleChangeField("email", e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className={LABEL_CLASS}>
            비밀번호
          </label>
          <div className="relative">
            <img
              src="/icons/movie-icons/lock.svg"
              alt=""
              className={ICON_CLASS}
            />
            <input
              id="login-password"
              type="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={(e) => handleChangeField("password", e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-1 h-12 rounded-lg bg-blue-600 text-sm font-semibold text-white"
        >
          로그인
        </button>

        <p className="text-center text-sm text-gray-500">
          처음이신가요?{" "}
          <Link to="/signup" className="font-semibold text-blue-600">
            회원가입
          </Link>
        </p>
      </form>
    </main>
  );
}
