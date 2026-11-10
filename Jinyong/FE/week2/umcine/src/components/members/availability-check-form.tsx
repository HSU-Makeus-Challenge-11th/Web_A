import { useState, type SubmitEvent } from 'react';
import type { AvailabilityCheckResponse } from '../../api/members/models';
import { cn } from '../../utils/cn';

interface AvailabilityCheckFormProps {
  label: string;
  placeholder: string;
  inputType?: 'text' | 'email';
  check: (value: string) => Promise<AvailabilityCheckResponse>;
}

interface CheckResult {
  value: string;
  available: boolean;
}

export function AvailabilityCheckForm({
  label,
  placeholder,
  inputType = 'text',
  check,
}: AvailabilityCheckFormProps) {
  const [inputValue, setInputValue] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = inputValue.trim();
    if (!value) return;

    setIsChecking(true);
    setResult(null);
    setErrorMessage(null);

    try {
      const response = await check(value);
      setResult({ value, available: response.available });
    } catch {
      setErrorMessage(`${label}을 확인하지 못했어요. 서버가 켜져 있는지 확인해 주세요.`);
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-900">
        {label} 중복 확인
        <div className="mt-2 flex gap-2">
          <input
            type={inputType}
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              setResult(null);
              setErrorMessage(null);
            }}
            placeholder={placeholder}
            className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm font-normal outline-none placeholder:text-gray-400 focus:border-gray-900"
          />
          <button
            type="submit"
            disabled={isChecking || !inputValue.trim()}
            className="h-11 shrink-0 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white disabled:bg-gray-300"
          >
            {isChecking ? '확인 중' : '중복 확인'}
          </button>
        </div>
      </label>

      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      {result && (
        <p className={cn('text-sm', result.available ? 'text-blue-600' : 'text-red-500')}>
          ‘{result.value}’은(는) {result.available ? '사용할 수 있어요.' : '이미 사용 중이에요.'}
        </p>
      )}
    </form>
  );
}
