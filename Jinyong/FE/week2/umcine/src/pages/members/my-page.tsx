import { checkEmail } from '../../api/members/check-email';
import { checkNickname } from '../../api/members/check-nickname';
import { AvailabilityCheckForm } from '../../components/members/availability-check-form';
import { MemberRatings } from '../../components/members/member-ratings';

export function MyPage() {
  return (
    <main className="mx-auto w-full max-w-[1328px] px-6 pb-16 pt-8">
      <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900">내 정보</h1>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900">회원 정보 확인</h2>
        <p className="mt-1 text-sm text-gray-400">
          가입 전에 닉네임과 이메일을 사용할 수 있는지 확인해 보세요.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <AvailabilityCheckForm
            label="닉네임"
            placeholder="예: 수현"
            check={checkNickname}
          />
          <AvailabilityCheckForm
            label="이메일"
            placeholder="예: noco@umc.com"
            inputType="email"
            check={checkEmail}
          />
        </div>
      </section>

      <MemberRatings />
    </main>
  );
}
