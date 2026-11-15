import { useNavigate } from "@tanstack/react-router";
import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { checkNicknameDuplicate } from "../../api/members/check-nickname-duplicate";
import { useMeQuery } from "../../hooks/use-me-query";
import { useUpdateMeMutation } from "../../hooks/use-update-me-mutation";
import { useProfileStore } from "../../stores/profile-store";
import { ProfileAvatar } from "./profile-avatar";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const AVATAR_SIZE = 256;

const DUPLICATE_MESSAGES = {
  checking: "닉네임을 확인하는 중이에요.",
  available: "사용할 수 있는 닉네임이에요.",
  unavailable: "이미 사용 중인 닉네임이에요.",
  error: "중복 확인에 실패했어요. 다시 시도해 주세요.",
};

async function makeAvatar(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();

    const { naturalWidth: width, naturalHeight: height } = image;
    const crop = Math.min(width, height);
    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;
    const context = canvas.getContext("2d");
    if (!context || crop === 0) throw new Error("Cannot draw profile image");
    context.drawImage(image, (width - crop) / 2, (height - crop) / 2, crop, crop, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
    return canvas.toDataURL("image/webp", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ProfileEditPage() {
  const navigate = useNavigate();
  const meQuery = useMeQuery();
  const updateMeMutation = useUpdateMeMutation();
  const savedNickname = meQuery.data?.nickname ?? "";
  const savedAvatar = useProfileStore((state) => state.avatar);
  const saveProfile = useProfileStore((state) => state.saveProfile);
  const [nicknameInput, setNickname] = useState<string | null>(null);
  const nickname = nicknameInput ?? savedNickname;
  const [avatar, setAvatar] = useState(savedAvatar);
  const [isReadingImage, setIsReadingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const [duplicateStatus, setDuplicateStatus] = useState<keyof typeof DUPLICATE_MESSAGES | null>(null);
  const trimmedNickname = nickname.trim();
  const isNicknameValid = trimmedNickname.length >= 2 && trimmedNickname.length <= 12;
  const isChecking = duplicateStatus === "checking";
  const nicknameMessage = !isNicknameValid
    ? "닉네임은 2자 이상 12자 이하로 입력해 주세요."
    : duplicateStatus && DUPLICATE_MESSAGES[duplicateStatus];
  const canSave = Boolean(meQuery.data) && isNicknameValid && !isChecking && !isReadingImage && duplicateStatus !== "unavailable";

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > MAX_IMAGE_SIZE) {
      setImageError("5MB 이하의 이미지 파일을 선택해 주세요.");
      return;
    }

    setImageError("");
    setIsReadingImage(true);
    try {
      setAvatar(await makeAvatar(file));
    } catch {
      setImageError("이미지를 열 수 없어요. 다른 파일을 선택해 주세요.");
    } finally {
      setIsReadingImage(false);
    }
  }

  async function handleDuplicateCheck() {
    if (!isNicknameValid || isChecking || updateMeMutation.isPending || trimmedNickname === savedNickname) return;

    setDuplicateStatus("checking");
    try {
      const { available } = await checkNicknameDuplicate(trimmedNickname);
      setDuplicateStatus(available ? "available" : "unavailable");
    } catch {
      setDuplicateStatus("error");
    }
  }

  function handleSave(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave || updateMeMutation.isPending) return;

    updateMeMutation.mutate({ nickname: trimmedNickname }, {
      onSuccess: (response) => {
        saveProfile({ nickname: response.result.nickname, avatar });
        void navigate({ to: "/profile" });
      },
    });
  }

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-90px)] w-full max-w-[1320px] flex-col px-5 pt-6 pb-7">
      <form onSubmit={handleSave} noValidate>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[32px] leading-tight font-bold tracking-tight">내 정보 수정</h1>
            <p className="mt-2 text-sm text-[#667085]">닉네임과 프로필 이미지만 변경할 수 있어요.</p>
          </div>
          <button type="submit" disabled={!canSave || updateMeMutation.isPending} className="rounded-lg bg-[#2563eb] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
            {updateMeMutation.isPending ? "저장 중" : "저장"}
          </button>
        </div>

        {meQuery.isLoading && <p role="status" className="mt-4 text-sm text-[#667085]">내 정보를 불러오는 중이에요.</p>}
        {meQuery.isError && <p role="alert" className="mt-4 text-sm text-red-600">내 정보를 불러오지 못했어요.</p>}

        <div className="mt-8 grid items-center gap-6 md:grid-cols-2 md:gap-0">
          <div className="flex flex-col items-center">
            <label className="relative flex cursor-pointer flex-col items-center gap-1 rounded-lg focus-within:outline-2 focus-within:outline-[#2563eb]">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={isReadingImage || updateMeMutation.isPending}
                aria-label="프로필 이미지 선택"
                aria-describedby="avatar-hint"
                onChange={(event) => void handleImageChange(event)}
              />
              <span className="relative block">
                <ProfileAvatar avatar={avatar} />
                <img src="/icons/edit.svg" alt="" className="absolute right-0 bottom-0 size-6 rounded-full bg-[#f5f6f8]" />
              </span>
              <span className="text-sm font-bold">프로필 이미지</span>
            </label>
            <p id="avatar-hint" className="mt-1 text-xs text-[#667085]">선택 사항 · 최대 5MB</p>
            {imageError && <p role="alert" className="mt-1 text-xs text-red-600">{imageError}</p>}
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="profile-nickname" className="block text-xs font-bold">닉네임</label>
              <div className="mt-2 flex h-12 items-center rounded-lg border border-[#e1e5ee] bg-white focus-within:border-[#2563eb]">
                <input
                  id="profile-nickname"
                  name="nickname"
                  value={nickname}
                  disabled={isChecking || updateMeMutation.isPending || !meQuery.data}
                  autoComplete="nickname"
                  aria-invalid={!isNicknameValid || duplicateStatus === "unavailable"}
                  aria-describedby={nicknameMessage ? "nickname-message" : undefined}
                  onChange={(event) => {
                    setNickname(event.target.value);
                    setDuplicateStatus(null);
                  }}
                  className="h-full min-w-0 flex-1 px-3.5 text-sm outline-none"
                />
                <button
                  type="button"
                  disabled={!isNicknameValid || isChecking || updateMeMutation.isPending || trimmedNickname === savedNickname}
                  onClick={() => void handleDuplicateCheck()}
                  className="h-full shrink-0 px-3.5 text-xs font-bold text-[#2563eb] enabled:hover:underline disabled:cursor-not-allowed"
                >
                  {isChecking ? "확인 중" : "중복 확인"}
                </button>
              </div>
              {nicknameMessage && <p id="nickname-message" role="status" className="mt-1 text-xs text-[#667085]">{nicknameMessage}</p>}
            </div>
            <div>
              <label htmlFor="profile-email" className="block text-xs font-bold">이메일</label>
              <input id="profile-email" type="email" value={meQuery.data?.email ?? ""} readOnly className="mt-2 block h-12 w-full rounded-lg border border-[#e1e5ee] bg-white px-3.5 text-sm" />
            </div>
          </div>
        </div>
      </form>

      <section className="mt-auto pt-10" aria-labelledby="withdraw-title">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-red-500 bg-red-500/10 p-5 text-red-700">
          <div>
            <h2 id="withdraw-title" className="text-sm font-bold">회원 탈퇴</h2>
            <p className="mt-1 text-xs">탈퇴하면 작성한 평점, 후기와 즐겨찾기가 모두 삭제되며 복구할 수 없어요.</p>
          </div>
          <button type="button" disabled title="회원 탈퇴는 서버 연동 후 이용할 수 있어요." className="cursor-not-allowed rounded-lg border border-red-500 bg-white px-4 py-3 text-sm font-bold">
            회원 탈퇴
          </button>
        </div>
      </section>
    </main>
  );
}
