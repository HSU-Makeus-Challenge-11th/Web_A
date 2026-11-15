import { useEffect, useState, type ChangeEvent } from 'react';
import { checkNickname } from '../../api/members/check-nickname';
import { MOCK_MEMBER } from '../../data/mock-member';
import { cn } from '../../utils/cn';

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

export function MyEditPage() {
  const [nickname, setNickname] = useState(MOCK_MEMBER.nickname);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const trimmedNickname = nickname.trim();
  const isNicknameValid = trimmedNickname.length >= 2 && trimmedNickname.length <= 12;
  const isNicknameChanged = trimmedNickname !== MOCK_MEMBER.nickname;
  const showNicknameError = !isNicknameValid;

  const hasChanges = isNicknameChanged || profileImageUrl !== null;
  const canSave =
    hasChanges && isNicknameValid && (!isNicknameChanged || isNicknameAvailable);

  useEffect(() => {
    return () => {
      if (profileImageUrl) URL.revokeObjectURL(profileImageUrl);
    };
  }, [profileImageUrl]);

  const handleChangeNickname = (value: string) => {
    if (isCheckingNickname) return;
    setNickname(value);
    setIsNicknameAvailable(false);
  };

  const handleCheckNickname = async () => {
    if (!isNicknameValid || !isNicknameChanged || isCheckingNickname) return;

    setIsCheckingNickname(true);
    try {
      const response = await checkNickname(trimmedNickname);
      setIsNicknameAvailable(response.available);
      alert(response.available ? '사용할 수 있는 닉네임이에요.' : '이미 사용 중인 닉네임이에요.');
    } catch {
      setIsNicknameAvailable(false);
      alert('중복 확인에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setIsCheckingNickname(false);
    }
  };

  const handleChangeProfileImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      alert('프로필 이미지는 5MB 이하만 올릴 수 있어요.');
      return;
    }

    setProfileImageUrl(URL.createObjectURL(file));
  };

  const handleSave = () => {
    if (!canSave) return;
    alert('변경사항 저장 기능은 준비 중이에요.');
  };

  const handleWithdraw = () => {
    if (!confirm('정말 탈퇴하시겠어요? 작성한 평점, 후기와 즐겨찾기가 모두 삭제돼요.')) return;
    alert('회원 탈퇴 기능은 준비 중이에요.');
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-90px-56px)] w-full max-w-[1328px] flex-col px-6 pb-8 pt-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">내 정보 수정</h1>
          <p className="mt-2 text-sm text-gray-500">닉네임과 프로필 이미지만 변경할 수 있어요.</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="h-10 shrink-0 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white disabled:bg-gray-300"
        >
          변경사항 저장
        </button>
      </div>

      <div className="mt-10 grid flex-1 grid-cols-1 gap-10 md:grid-cols-2">
        <div className="flex flex-col items-center pt-4">
          <label className="relative cursor-pointer" aria-label="프로필 이미지 변경">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="프로필 이미지 미리보기"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
                <img src="/icons/movie-icons/person.svg" alt="" className="h-8 w-8" />
              </span>
            )}
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-900 bg-white">
              <img src="/icons/movie-icons/edit.svg" alt="" className="h-3.5 w-3.5" />
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleChangeProfileImage}
              className="hidden"
            />
          </label>
          <p className="mt-2 text-sm font-bold text-gray-900">프로필 이미지</p>
          <p className="mt-1 text-xs text-gray-400">선택 사항 · 최대 5MB</p>
        </div>

        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-2 text-sm font-bold text-gray-900">
            닉네임
            <div
              className={cn(
                'flex h-12 items-center rounded-lg border bg-white px-4',
                showNicknameError ? 'border-red-500' : 'border-gray-200',
              )}
            >
              <input
                type="text"
                value={nickname}
                onChange={(e) => handleChangeNickname(e.target.value)}
                disabled={isCheckingNickname}
                className="min-w-0 flex-1 bg-transparent text-sm font-normal outline-none"
              />
              <button
                type="button"
                onClick={handleCheckNickname}
                disabled={!isNicknameValid || !isNicknameChanged || isCheckingNickname}
                className="shrink-0 pl-3 text-xs font-bold text-blue-600 disabled:text-gray-300"
              >
                {isCheckingNickname ? '확인 중' : '중복 확인'}
              </button>
            </div>
            {showNicknameError && (
              <span className="text-xs font-normal text-red-500">
                닉네임은 2자 이상 12자 이하로 입력해 주세요.
              </span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm font-bold text-gray-900">
            이메일
            <input
              type="email"
              value={MOCK_MEMBER.email}
              disabled
              className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-sm font-normal text-gray-900"
            />
          </label>
        </div>
      </div>

      <section className="mt-10 flex items-center justify-between gap-4 rounded-xl border border-red-500 bg-red-50 px-5 py-5">
        <div>
          <h2 className="text-sm font-bold text-red-600">회원 탈퇴</h2>
          <p className="mt-1 text-xs text-red-500">
            탈퇴하면 작성한 평점, 후기와 즐겨찾기가 모두 삭제되며 복구할 수 없습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleWithdraw}
          className="h-10 shrink-0 rounded-lg border border-red-500 bg-white px-4 text-sm font-bold text-red-600"
        >
          회원 탈퇴
        </button>
      </section>
    </main>
  );
}
