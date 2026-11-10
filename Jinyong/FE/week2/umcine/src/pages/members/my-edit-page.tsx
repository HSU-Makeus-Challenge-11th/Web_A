import { useState, type SubmitEvent } from "react";
import { SAMPLE_MEMBER } from "./sample-member";

const LABEL_CLASS = "mb-1.5 block text-sm font-semibold text-gray-900";
const INPUT_CLASS =
  "h-12 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-900";

export function MyEditPage() {
  const [nickname, setNickname] = useState(SAMPLE_MEMBER.nickname);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    // 퍼블리싱 단계라 수정 API는 아직 연결하지 않음
    e.preventDefault();
  };

  return (
    <main className="mx-auto w-full max-w-332 px-6 pt-8 pb-16">
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
              내 정보 수정
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              닉네임과 프로필 이미지만 변경할 수 있어요.
            </p>
          </div>
          <button
            type="submit"
            className="h-10 shrink-0 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"
          >
            변경사항 저장
          </button>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-0">
          <div className="flex flex-col items-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
              <img
                src="/icons/movie-icons/person.svg"
                alt=""
                className="h-9 w-9"
              />
              <button
                type="button"
                aria-label="프로필 이미지 변경"
                className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-900"
              >
                <img
                  src="/icons/movie-icons/edit.svg"
                  alt=""
                  className="h-3.5 w-3.5 brightness-0 invert"
                />
              </button>
            </div>
            <p className="mt-3 text-sm font-bold text-gray-900">프로필 이미지</p>
            <p className="mt-1 text-xs text-gray-400">선택 사항 · 최대 5MB</p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="edit-nickname" className={LABEL_CLASS}>
                닉네임
              </label>
              <div className="relative">
                <input
                  id="edit-nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className={`${INPUT_CLASS} pr-16`}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-blue-600"
                >
                  중복 확인
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="edit-email" className={LABEL_CLASS}>
                이메일
              </label>
              <input
                id="edit-email"
                type="email"
                value={SAMPLE_MEMBER.email}
                readOnly
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>
      </form>

      <section className="mt-134 flex items-center justify-between gap-4 rounded-xl border border-red-300 bg-red-50 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-red-600">회원 탈퇴</h2>
          <p className="mt-1 text-xs text-red-500">
            탈퇴하면 작성한 평점, 즐겨찾기가 모두 삭제되며 복구할 수 없습니다.
          </p>
        </div>
        <button
          type="button"
          className="h-10 shrink-0 rounded-lg border border-red-500 bg-white px-4 text-sm font-semibold text-red-600"
        >
          회원 탈퇴
        </button>
      </section>
    </main>
  );
}
