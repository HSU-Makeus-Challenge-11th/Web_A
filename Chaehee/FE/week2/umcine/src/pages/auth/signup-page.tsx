import { useState, type SubmitEvent } from 'react';
import { checkEmail } from '../../api/members/check-email';
import { checkNickname } from '../../api/members/check-nickname';
import { signup } from '../../api/members/signup';
import { cn } from '../../utils/cn';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

const DEFAULT_FORM = {
  email: '',
  nickname: '',
  password: '',
  passwordConfirm: '',
};

type DefaultFormKey = keyof typeof DEFAULT_FORM;
type DefaultFormValue = (typeof DEFAULT_FORM)[DefaultFormKey];

const DEFAULT_DUPLICATE_CHECK = {
  isChecking: false,
  isAvailable: false,
};

type DuplicateCheckKey = 'email' | 'nickname';

const inputBoxClass = 'flex h-12 items-center rounded-lg border bg-white px-4';
const inputClass = 'min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400';
const duplicateCheckButtonClass =
  'shrink-0 pl-3 text-xs font-bold text-blue-600 disabled:text-gray-300';

export function SignupPage() {
  const [form, setForm] = useState(DEFAULT_FORM);

  const isEmailValid = EMAIL_REGEX.test(form.email.trim());
  const isNicknameValid =
    form.nickname.trim().length >= 2 && form.nickname.trim().length <= 12;
  const isPasswordValid = PASSWORD_REGEX.test(form.password);
  const isPasswordConfirmValid =
    form.passwordConfirm.length > 0 && form.password === form.passwordConfirm;

  const showEmailError = form.email.length > 0 && !isEmailValid;
  const showNicknameError = form.nickname.length > 0 && !isNicknameValid;
  const showPasswordError = form.password.length > 0 && !isPasswordValid;
  const showPasswordConfirmError =
    form.passwordConfirm.length > 0 && !isPasswordConfirmValid;

  const isFormValid =
    isEmailValid && isNicknameValid && isPasswordValid && isPasswordConfirmValid;

  const [duplicateCheck, setDuplicateCheck] = useState({
    email: DEFAULT_DUPLICATE_CHECK,
    nickname: DEFAULT_DUPLICATE_CHECK,
  });

  const canSubmit =
    isFormValid && duplicateCheck.email.isAvailable && duplicateCheck.nickname.isAvailable;

  const handleChangeField = (key: DefaultFormKey, value: DefaultFormValue) => {
    if (key === 'email' || key === 'nickname') {
      if (duplicateCheck[key].isChecking) return;
      setDuplicateCheck((prev) => ({ ...prev, [key]: DEFAULT_DUPLICATE_CHECK }));
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckDuplicate = async (key: DuplicateCheckKey) => {
    const isValid = key === 'email' ? isEmailValid : isNicknameValid;
    if (!isValid || duplicateCheck[key].isChecking) return;

    const label = key === 'email' ? '이메일' : '닉네임';
    setDuplicateCheck((prev) => ({
      ...prev,
      [key]: { isChecking: true, isAvailable: false },
    }));

    try {
      const response =
        key === 'email'
          ? await checkEmail(form.email.trim())
          : await checkNickname(form.nickname.trim());
      const isAvailable = response.available;
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isAvailable },
      }));
      alert(isAvailable ? `사용할 수 있는 ${label}이에요.` : `이미 사용 중인 ${label}이에요.`);
    } catch {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isAvailable: false },
      }));
      alert('중복 확인에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isChecking: false },
      }));
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
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
    } catch {
      alert('회원가입에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[430px] px-6 pb-24 pt-28">
      <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900">회원가입</h1>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-bold text-gray-900">
          이메일
          <div
            className={cn(inputBoxClass, showEmailError ? 'border-red-500' : 'border-gray-200')}
          >
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChangeField('email', e.target.value)}
              disabled={duplicateCheck.email.isChecking}
              placeholder="name@example.com"
              className={inputClass}
            />
            <button
              type="button"
              disabled={!isEmailValid || duplicateCheck.email.isChecking}
              onClick={() => handleCheckDuplicate('email')}
              className={duplicateCheckButtonClass}
            >
              {duplicateCheck.email.isChecking ? '확인 중' : '중복 확인'}
            </button>
          </div>
          {showEmailError && (
            <span className="text-xs font-normal text-red-500">
              올바른 이메일 형식으로 입력해 주세요.
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-sm font-bold text-gray-900">
          닉네임
          <div
            className={cn(inputBoxClass, showNicknameError ? 'border-red-500' : 'border-gray-200')}
          >
            <input
              type="text"
              value={form.nickname}
              onChange={(e) => handleChangeField('nickname', e.target.value)}
              disabled={duplicateCheck.nickname.isChecking}
              placeholder="2-12자"
              className={inputClass}
            />
            <button
              type="button"
              disabled={!isNicknameValid || duplicateCheck.nickname.isChecking}
              onClick={() => handleCheckDuplicate('nickname')}
              className={duplicateCheckButtonClass}
            >
              {duplicateCheck.nickname.isChecking ? '확인 중' : '중복 확인'}
            </button>
          </div>
          {showNicknameError && (
            <span className="text-xs font-normal text-red-500">
              닉네임은 2자 이상 12자 이하로 입력해 주세요.
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-sm font-bold text-gray-900">
          비밀번호
          <div
            className={cn(inputBoxClass, showPasswordError ? 'border-red-500' : 'border-gray-200')}
          >
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChangeField('password', e.target.value)}
              placeholder="8자 이상"
              className={inputClass}
            />
          </div>
          <span
            className={cn(
              'text-xs font-normal',
              showPasswordError ? 'text-red-500' : 'text-gray-400',
            )}
          >
            영문 대·소문자, 숫자, 특수문자를 모두 포함해 8자 이상 입력해 주세요
          </span>
        </label>

        <label className="flex flex-col gap-2 text-sm font-bold text-gray-900">
          비밀번호 확인
          <div
            className={cn(
              inputBoxClass,
              showPasswordConfirmError ? 'border-red-500' : 'border-gray-200',
            )}
          >
            <input
              type="password"
              value={form.passwordConfirm}
              onChange={(e) => handleChangeField('passwordConfirm', e.target.value)}
              placeholder="다시 입력"
              className={inputClass}
            />
          </div>
          {showPasswordConfirmError && (
            <span className="text-xs font-normal text-red-500">비밀번호가 일치하지 않아요.</span>
          )}
        </label>

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="mt-2 h-12 rounded-lg bg-blue-600 text-sm font-bold text-white disabled:bg-gray-300"
        >
          {isSubmitting ? '가입 중' : '가입하기'}
        </button>
      </form>
    </main>
  );
}
