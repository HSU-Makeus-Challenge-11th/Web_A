import { useState } from "react";
import { cn } from "../../utils/cn";
import { checkEmailDuplicate } from "../../api/members/check-email-duplicate";
import { checkNicknameDuplicate } from "../../api/members/check-nickname-duplicate";
import { signup } from "../../api/members/signup";
import { Link, useNavigate } from "@tanstack/react-router";

const DEFAULT_DUPLICATE_CHECK = {
  isChecking: false,
  isAvailable: false,
};

type DuplicateCheckKey = "email" | "nickname";

// 이메일 형식 검사
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 영문 대소문자, 숫자, 특수문자(!@#$%^&*)를 모두 포함해 8자 이상
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

const DEFAULT_FORM = {
  email: "",
  nickname: "",
  password: "",
  passwordConfirm: "",
};

type DefaultFormKey = keyof typeof DEFAULT_FORM;
type DefaultFormValue = (typeof DEFAULT_FORM)[DefaultFormKey];

const LABEL_CLASS = "mb-1.5 block text-sm font-semibold text-gray-900";
const INPUT_CLASS =
  "h-12 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-900";
const CHECK_BUTTON_CLASS =
  "absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-blue-600";
const ERROR_INPUT_CLASS = "border-red-500 focus:border-red-500";
const ERROR_TEXT_CLASS = "mt-1 text-xs text-red-500";

export function SignupPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [duplicateCheck, setDuplicateCheck] = useState({
    email: DEFAULT_DUPLICATE_CHECK,
    nickname: DEFAULT_DUPLICATE_CHECK,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // 입력값의 유효성 검사
  const isEmailValid = EMAIL_REGEX.test(form.email.trim());
  const isNicknameValid =
    form.nickname.trim().length >= 2 && form.nickname.trim().length <= 12;
  const isPasswordValid = PASSWORD_REGEX.test(form.password);
  const isPasswordConfirmValid =
    form.passwordConfirm.length > 0 && form.password === form.passwordConfirm;

  // 입력을 시작한 필드에만 오류 표시
  const showEmailError = form.email.length > 0 && !isEmailValid;
  const showNicknameError = form.nickname.length > 0 && !isNicknameValid;
  const showPasswordError = form.password.length > 0 && !isPasswordValid;
  const showPasswordConfirmError =
    form.passwordConfirm.length > 0 && !isPasswordConfirmValid;

  // 모든 입력값이 유효하면 제출 버튼 활성화
  const isFormValid =
    isEmailValid &&
    isNicknameValid &&
    isPasswordValid &&
    isPasswordConfirmValid;

  // 입력 조건과 두 중복 확인을 모두 통과해야 제출 가능
  const canSubmit =
    isFormValid &&
    duplicateCheck.email.isAvailable &&
    duplicateCheck.nickname.isAvailable;

  const handleChangeField = (key: DefaultFormKey, value: DefaultFormValue) => {
    if (key === "email" || key === "nickname") {
      if (duplicateCheck[key].isChecking) return;
      // 확인한 값을 바꾸면 다시 중복 확인해야 함
      setDuplicateCheck((prev) => ({ ...prev, [key]: DEFAULT_DUPLICATE_CHECK }));
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckDuplicate = async (key: DuplicateCheckKey) => {
    const isValid = key === "email" ? isEmailValid : isNicknameValid;
    if (!isValid || duplicateCheck[key].isChecking) return;

    const label = key === "email" ? "이메일" : "닉네임";
    setDuplicateCheck((prev) => ({
      ...prev,
      [key]: { isChecking: true, isAvailable: false },
    }));

    try {
      const response =
        key === "email"
          ? await checkEmailDuplicate(form.email.trim())
          : await checkNicknameDuplicate(form.nickname.trim());
      const isAvailable = response.available;
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isAvailable },
      }));
      alert(
        isAvailable
          ? `사용할 수 있는 ${label}이에요.`
          : `이미 사용 중인 ${label}이에요.`,
      );
    } catch {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isAvailable: false },
      }));
      alert("중복 확인에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isChecking: false },
      }));
    }
  };
  
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await signup({
        email: form.email.trim(),
        nickname: form.nickname.trim(),
        password: form.password,
      });
      alert(response.message);
      navigate({ to: "/login" });
    } catch {
      alert("회원가입에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // noValidate는 폼 제출 시 브라우저의 기본 유효성 검사를 끔
  return (
    <main className="flex justify-center px-4 pt-53 pb-20">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full max-w-107 flex-col gap-3.5"
      >
        <h1 className="mb-1 text-[28px] font-bold text-gray-900">회원가입</h1>

        <div>
          <label htmlFor="signup-email" className={LABEL_CLASS}>
            이메일
          </label>
          <div className="relative">
            <input
              id="signup-email"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={(e) => handleChangeField("email", e.target.value)}
              disabled={duplicateCheck.email.isChecking}
              className={cn(
                INPUT_CLASS,
                "pr-16",
                showEmailError && ERROR_INPUT_CLASS,
              )}
            />
            <button
              type="button"
              disabled={!isEmailValid || duplicateCheck.email.isChecking}
              onClick={() => handleCheckDuplicate("email")}
              className={CHECK_BUTTON_CLASS}
            >
              {duplicateCheck.email.isChecking ? "확인 중" : "중복 확인"}
            </button>
          </div>
          {showEmailError && (
            <p className={ERROR_TEXT_CLASS}>
              올바른 이메일 형식을 입력해 주세요.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="signup-nickname" className={LABEL_CLASS}>
            닉네임
          </label>
          <div className="relative">
            <input
              id="signup-nickname"
              type="text"
              placeholder="2~12자"
              value={form.nickname}
              onChange={(e) => handleChangeField("nickname", e.target.value)}
              disabled={duplicateCheck.nickname.isChecking}
              className={cn(
                INPUT_CLASS,
                "pr-16",
                showNicknameError && ERROR_INPUT_CLASS,
              )}
            />
            <button
              type="button"
              disabled={!isNicknameValid || duplicateCheck.nickname.isChecking}
              onClick={() => handleCheckDuplicate("nickname")}
              className={CHECK_BUTTON_CLASS}
            >
              {duplicateCheck.nickname.isChecking ? "확인 중" : "중복 확인"}
            </button>
          </div>
          {showNicknameError && (
            <p className={ERROR_TEXT_CLASS}>닉네임은 2~12자로 입력해 주세요.</p>
          )}
        </div>

        <div>
          <label htmlFor="signup-password" className={LABEL_CLASS}>
            비밀번호
          </label>
          <input
            id="signup-password"
            type="password"
            placeholder="8자 이상"
            value={form.password}
            onChange={(e) => handleChangeField("password", e.target.value)}
            className={cn(INPUT_CLASS, showPasswordError && ERROR_INPUT_CLASS)}
          />
          {/* 안내 문구는 항상 보이고, 조건을 어기면 빨간색으로 바뀜 */}
          <p
            className={cn(
              "mt-1 text-xs text-gray-400",
              showPasswordError && "text-red-500",
            )}
          >
            영문 대소문자, 숫자, 특수문자를 모두 포함해 8자 이상 입력해 주세요.
          </p>
        </div>

        <div>
          <label htmlFor="signup-password-confirm" className={LABEL_CLASS}>
            비밀번호 확인
          </label>
          <input
            id="signup-password-confirm"
            type="password"
            placeholder="다시 입력"
            value={form.passwordConfirm}
            onChange={(e) =>
              handleChangeField("passwordConfirm", e.target.value)
            }
            className={cn(
              INPUT_CLASS,
              showPasswordConfirmError && ERROR_INPUT_CLASS,
            )}
          />
          {showPasswordConfirmError && (
            <p className={ERROR_TEXT_CLASS}>비밀번호가 일치하지 않습니다.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="mt-1 h-12 rounded-lg bg-blue-600 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? "가입 중" : "가입하기"}
        </button>

        <p className="text-center text-sm text-gray-500">
          이미 계정이 있나요?{" "}
          <Link to="/login" className="font-semibold text-blue-600">
            로그인
          </Link>
        </p>
      </form>
    </main>
)
}