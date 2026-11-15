import { useState, type SubmitEvent } from "react";
import { checkEmailDuplicate } from "../../api/members/check-email-duplicate";
import { checkNicknameDuplicate } from "../../api/members/check-nickname-duplicate";
import { useSignupMutation } from "../../hooks/use-signup-mutation";
import { cn } from "../../utils/cn";
import { AuthLayout } from "./auth-layout";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

const DEFAULT_FORM = {
  email: "",
  nickname: "",
  password: "",
  passwordConfirm: "",
};

type FormField = keyof typeof DEFAULT_FORM;
type DuplicateField = "email" | "nickname";
type DuplicateStatus = "idle" | "checking" | "available" | "unavailable";

const DUPLICATE_CHECKS = {
  email: { label: "이메일", request: checkEmailDuplicate },
  nickname: { label: "닉네임", request: checkNicknameDuplicate },
};

const FIELDS = [
  {
    key: "email",
    label: "이메일",
    type: "email",
    autoComplete: "email",
    placeholder: "name@example.com",
    hint: undefined,
    error: "올바른 이메일 주소를 입력해 주세요.",
  },
  {
    key: "nickname",
    label: "닉네임",
    type: "text",
    autoComplete: "nickname",
    placeholder: "2–12자",
    hint: undefined,
    error: "닉네임은 2자 이상 12자 이하로 입력해 주세요.",
  },
  {
    key: "password",
    label: "비밀번호",
    type: "password",
    autoComplete: "new-password",
    placeholder: "8자 이상",
    hint: "영문 대소문자, 숫자, 특수문자를 모두 포함해 8자 이상 입력해 주세요.",
    error: "영문 대소문자, 숫자, 특수문자(!@#$%^&*)를 포함해 8자 이상 입력해 주세요.",
  },
  {
    key: "passwordConfirm",
    label: "비밀번호 확인",
    type: "password",
    autoComplete: "new-password",
    placeholder: "다시 입력",
    hint: undefined,
    error: "비밀번호가 일치하지 않아요.",
  },
] as const;

export function SignupPage() {
  const signupMutation = useSignupMutation();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [duplicateStatus, setDuplicateStatus] = useState<
    Record<DuplicateField, DuplicateStatus>
  >({ email: "idle", nickname: "idle" });

  const email = form.email.trim();
  const nickname = form.nickname.trim();
  const valid = {
    email: EMAIL_REGEX.test(email),
    nickname: nickname.length >= 2 && nickname.length <= 12,
    password: PASSWORD_REGEX.test(form.password),
    passwordConfirm: form.passwordConfirm.length > 0 && form.password === form.passwordConfirm,
  };
  const canSubmit =
    Object.values(valid).every(Boolean) &&
    duplicateStatus.email === "available" &&
    duplicateStatus.nickname === "available";

  function changeField(key: FormField, value: string) {
    if (key === "email" || key === "nickname") {
      setDuplicateStatus((prev) => ({ ...prev, [key]: "idle" }));
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCheckDuplicate(key: DuplicateField) {
    if (!valid[key] || duplicateStatus[key] === "checking" || signupMutation.isPending) return;

    const { label, request } = DUPLICATE_CHECKS[key];
    setDuplicateStatus((prev) => ({ ...prev, [key]: "checking" }));

    try {
      const { available } = await request(form[key].trim());
      setDuplicateStatus((prev) => ({
        ...prev,
        [key]: available ? "available" : "unavailable",
      }));
      alert(available ? `사용할 수 있는 ${label}이에요.` : `이미 사용 중인 ${label}이에요.`);
    } catch {
      setDuplicateStatus((prev) => ({ ...prev, [key]: "idle" }));
      alert("중복 확인에 실패했어요. 다시 시도해 주세요.");
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || signupMutation.isPending) return;

    signupMutation.mutate({
      email: form.email.trim(),
      nickname: form.nickname.trim(),
      password: form.password,
    });
  }

  return (
    <AuthLayout title="회원가입" prompt="이미 계정이 있나요?" linkTo="/login" linkLabel="로그인">
      <form onSubmit={handleSubmit} noValidate>
        <fieldset disabled={signupMutation.isPending} className="space-y-4">
          {FIELDS.map(({ key, label, type, autoComplete, placeholder, hint, error }) => {
            const duplicateKey = key === "email" || key === "nickname" ? key : undefined;
            const status = duplicateKey && duplicateStatus[duplicateKey];
            const isChecking = status === "checking";
            const showError = form[key].length > 0 && !valid[key];
            const feedback = showError
              ? error
              : status === "available"
                ? "사용할 수 있어요."
                : status === "unavailable"
                  ? "이미 사용 중이에요."
                  : hint;

            return (
              <div key={key}>
                <label htmlFor={key} className="block text-xs font-bold">
                  {label}
                </label>
                <div
                  className={cn(
                    "mt-2 flex h-12 items-center rounded-lg border bg-white focus-within:border-[#2563eb]",
                    showError || status === "unavailable" ? "border-red-500" : "border-[#e1e5ee]",
                  )}
                >
                  <input
                    id={key}
                    name={key}
                    type={type}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(event) => changeField(key, event.target.value)}
                    disabled={isChecking}
                    aria-invalid={showError || status === "unavailable"}
                    aria-describedby={feedback ? `${key}-feedback` : undefined}
                    className="h-full min-w-0 flex-1 px-3.5 text-sm outline-none placeholder:text-[#8b95a5]"
                  />
                  {duplicateKey && (
                    <button
                      type="button"
                      aria-label={`${label} 중복 확인`}
                      disabled={!valid[key] || isChecking}
                      onClick={() => void handleCheckDuplicate(duplicateKey)}
                      className="h-full shrink-0 px-3.5 text-xs font-bold text-[#2563eb] enabled:hover:underline disabled:cursor-not-allowed"
                    >
                      {isChecking ? "확인 중" : "중복 확인"}
                    </button>
                  )}
                </div>
                {feedback && (
                  <p
                    id={`${key}-feedback`}
                    className={cn(
                      "mt-1 text-[11px]",
                      showError || status === "unavailable" ? "text-red-600" : "text-[#667085]",
                      status === "available" && "text-green-700",
                    )}
                  >
                    {feedback}
                  </p>
                )}
              </div>
            );
          })}
          <button
            type="submit"
            disabled={!canSubmit || signupMutation.isPending}
            className="h-[46px] w-full rounded-lg bg-[#2563eb] text-sm font-bold text-white disabled:cursor-not-allowed"
          >
            {signupMutation.isPending ? "가입 중" : "가입하기"}
          </button>
        </fieldset>
      </form>
    </AuthLayout>
  );
}
