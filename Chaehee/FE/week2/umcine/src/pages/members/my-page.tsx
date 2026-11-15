import { FavoriteMovies } from '../../components/members/favorite-movies';
import { MOCK_MEMBER } from '../../data/mock-member';

export function MyPage() {
  return (
    <main className="mx-auto w-full max-w-[1328px] px-6 pb-16 pt-8">
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">내 정보</h1>
      </div>

      <section className="border-b border-gray-200 py-5">
        <h2 className="text-lg font-bold text-gray-900">기본 정보</h2>
        <div className="mt-4 grid grid-cols-[auto_1fr_1fr] items-center gap-x-7">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
            <img src="/icons/movie-icons/person.svg" alt="" className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs text-gray-400">닉네임</p>
            <p className="mt-1 font-bold text-gray-900">{MOCK_MEMBER.nickname}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">이메일</p>
            <p className="mt-1 font-bold text-gray-900">{MOCK_MEMBER.email}</p>
          </div>
        </div>
      </section>

      <section className="py-8">
        <h2 className="mb-5 text-lg font-bold text-gray-900">내 즐겨찾기</h2>
        <FavoriteMovies />
      </section>
    </main>
  );
}
