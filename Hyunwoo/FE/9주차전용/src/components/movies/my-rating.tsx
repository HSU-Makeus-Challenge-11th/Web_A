import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState, type SubmitEvent } from "react";
import { createRating, deleteRating, getMemberRatings, updateRating, type Rating, type RatingInput } from "../../api/ratings";
import { useMeQuery } from "../../hooks/use-me-query";
import { useAuthStore } from "../../stores/auth-store";
import { getTokenMemberId } from "../../utils/auth-member-id";

export function MyRating({ movieId }: { movieId: number }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const meQuery = useMeQuery();
  const memberId = getTokenMemberId(accessToken);
  const query = useQuery({
    queryKey: ["ratings", accessToken, memberId],
    queryFn: () => {
      if (!memberId) throw new Error("회원 번호가 필요해요.");
      return getMemberRatings(memberId);
    },
    enabled: Boolean(accessToken && memberId),
    retry: false,
  });

  return (
    <aside className="border-t border-[#e1e5ee] pt-6 md:col-span-2 xl:col-span-1 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
      <h2 className="text-[20px] font-bold text-[#202329]">내 평점</h2>
      {!accessToken ? (
        <p className="mt-3 text-sm"><Link href="/login" className="text-blue-600 underline">로그인</Link> 후 평점을 남길 수 있어요.</p>
      ) : meQuery.isLoading || query.isLoading ? (
        <p role="status" className="mt-3 text-sm">내 평점을 불러오는 중이에요.</p>
      ) : !memberId ? (
        <p role="alert" className="mt-3 text-sm text-red-600">회원 번호를 확인할 수 없어 평점을 불러오지 못했어요.</p>
      ) : query.isError ? (
        <p role="alert" className="mt-3 text-sm text-red-600">
          내 평점을 불러오지 못했어요. <button type="button" onClick={() => void query.refetch()}>다시 시도</button>
        </p>
      ) : query.isSuccess ? (
        <RatingForm
          key={`${accessToken}:${movieId}:${query.data.find((rating) => rating.movieId === movieId)?.ratingId ?? "new"}`}
          movieId={movieId}
          memberId={memberId}
          accessToken={accessToken}
          rating={query.data.find((rating) => rating.movieId === movieId)}
          refreshing={query.isFetching}
        />
      ) : null}
    </aside>
  );
}

function RatingForm({ movieId, memberId, accessToken, rating, refreshing }: {
  movieId: number;
  memberId: number;
  accessToken: string;
  rating?: Rating;
  refreshing: boolean;
}) {
  const queryClient = useQueryClient();
  const [score, setScore] = useState(rating?.score ?? 0);
  const [review, setReview] = useState(rating?.comment ?? "");
  const mutation = useMutation({
    mutationFn: async (action: { type: "save"; body: RatingInput } | { type: "delete" }) => {
      if (action.type === "delete") {
        if (!rating) throw new Error("삭제할 평점이 없어요.");
        await deleteRating(rating.ratingId);
      } else if (rating) {
        await updateRating(rating.ratingId, action.body);
      } else {
        await createRating({ movieId, ...action.body });
      }
    },
    onSuccess: async (_, action) => {
      await queryClient.invalidateQueries({ queryKey: ["ratings", accessToken, memberId] });
      alert(action.type === "delete" ? "평점을 삭제했어요." : "평점을 저장했어요.");
    },
    onError: () => alert("평점 변경에 실패했어요. 다시 시도해 주세요."),
  });
  const busy = mutation.isPending || refreshing;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !Number.isInteger(score) || score < 1 || score > 5 || review.length > 500) return;
    mutation.mutate({ type: "save", body: { score, comment: review.trim() } });
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="mt-1 text-xs text-[#8b95a5]">별점은 필수, 후기는 선택이에요.</p>
      <fieldset disabled={busy}>
        <legend className="sr-only">별점 선택</legend>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value}점`}
              aria-pressed={score === value}
              onClick={() => setScore(value)}
              className="flex size-[38px] items-center justify-center rounded-lg border border-[#e1e5ee] bg-white disabled:opacity-50"
            >
              <img src={value <= score ? "/icons/star.svg" : "/icons/star-outline.svg"} alt="" className="size-6" />
            </button>
          ))}
        </div>
        <textarea
          aria-label="영화 후기"
          value={review}
          maxLength={500}
          onChange={(event) => setReview(event.target.value)}
          placeholder="영화를 보고 느낀 점을 남겨보세요."
          className="mt-2 block h-[102px] w-full resize-none rounded-lg border border-[#e1e5ee] bg-white p-3 text-sm"
        />
        <p className="mt-1 text-xs text-[#8b95a5]">{review.length}/500자</p>
        <button type="submit" disabled={score < 1 || score > 5 || review.length > 500 || busy} className="mt-2 w-full rounded-lg bg-[#17191d] py-3 text-sm font-bold text-white disabled:opacity-50">
          {mutation.isPending ? "처리 중" : rating ? "평점 수정" : "평점 저장"}
        </button>
        {rating && (
          <button type="button" disabled={busy} onClick={() => mutation.mutate({ type: "delete" })} className="mt-2 w-full rounded-lg border border-red-500 py-3 text-sm font-bold text-red-600 disabled:opacity-50">
            평점 삭제
          </button>
        )}
      </fieldset>
    </form>
  );
}
