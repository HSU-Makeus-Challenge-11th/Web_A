"use client";

export function ProfileAvatar({ avatar }: { avatar: string | null }) {
  return (
    <span className="grid size-[82px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#e1e5e9]">
      {avatar ? (
        <img src={avatar} alt="프로필 이미지" className="size-full object-cover" />
      ) : (
        <img src="/icons/person.svg" alt="기본 프로필 이미지" className="size-12" />
      )}
    </span>
  );
}
