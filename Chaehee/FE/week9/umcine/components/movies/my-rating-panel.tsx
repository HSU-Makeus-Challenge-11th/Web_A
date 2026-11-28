'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { MemberRating } from '../../api/members/models';
import {
  useDeleteRatingMutation,
  useMyMemberId,
  useMyRatingQuery,
  useSaveRatingMutation,
} from '../../hooks/use-my-rating';
import { cn } from '../../utils/cn';

interface MyRatingPanelProps {
  movieId: number;
}

export function MyRatingPanel({ movieId }: MyRatingPanelProps) {
  const memberId = useMyMemberId();
  const myRatingQuery = useMyRatingQuery(movieId);

  return (
    <aside className="flex flex-col gap-2 md:col-span-2 lg:col-span-1 lg:border-l lg:border-gray-200 lg:pl-8">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-gray-900">내 평점</h2>
        <p className="mt-1 text-xs text-gray-400">별점은 필수, 후기는 선택이에요.</p>
      </div>

      {memberId === null ? (
        <p className="mt-2 text-sm text-gray-500">
          <Link href="/login" className="font-bold text-blue-600">
            로그인
          </Link>
          하면 평점을 남길 수 있어요.
        </p>
      ) : myRatingQuery.isPending ? (
        <div className="mt-1 h-[180px] animate-pulse rounded-xl bg-gray-100" />
      ) : myRatingQuery.isError ? (
        <p className="mt-2 text-sm text-gray-500">내 평점을 불러오지 못했어요.</p>
      ) : (
        <MyRatingForm
          key={myRatingQuery.data?.ratingId ?? 'new'}
          movieId={movieId}
          rating={myRatingQuery.data}
        />
      )}
    </aside>
  );
}

interface MyRatingFormProps {
  movieId: number;
  rating: MemberRating | null;
}

function MyRatingForm({ movieId, rating }: MyRatingFormProps) {
  const [score, setScore] = useState(rating?.score ?? 0);
  const [comment, setComment] = useState(rating?.comment ?? '');
  const saveRatingMutation = useSaveRatingMutation();
  const deleteRatingMutation = useDeleteRatingMutation();

  const isPending = saveRatingMutation.isPending || deleteRatingMutation.isPending;
  const isChanged = score !== (rating?.score ?? 0) || comment.trim() !== (rating?.comment ?? '');
  const canSave = score >= 1 && isChanged && !isPending;

  const handleSave = () => {
    if (!canSave) return;
    saveRatingMutation.mutate({
      ratingId: rating?.ratingId ?? null,
      movieId,
      score,
      comment: comment.trim(),
    });
  };

  const handleDelete = () => {
    if (!rating || isPending) return;
    if (!confirm('평점을 삭제할까요?')) return;
    deleteRatingMutation.mutate(rating.ratingId);
  };

  return (
    <>
      <div className="mt-1 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value}점`}
            aria-pressed={score >= value}
            onClick={() => setScore(value)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg border',
              score >= value ? 'border-yellow-400 bg-yellow-100' : 'border-gray-200 bg-white',
            )}
          >
            <img src="/icons/movie-icons/star.svg" alt="" className="h-4 w-4 opacity-70" />
          </button>
        ))}
      </div>

      <textarea
        aria-label="후기"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="영화를 보고 느낀 점을 남겨보세요."
        className="h-[100px] w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm placeholder:text-gray-400"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="h-10 flex-1 rounded-lg bg-gray-900 text-sm font-semibold text-white disabled:bg-gray-300"
        >
          {saveRatingMutation.isPending ? '저장 중' : rating ? '평점 수정' : '평점 저장'}
        </button>
        {rating && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="h-10 rounded-lg border border-red-500 bg-white px-4 text-sm font-semibold text-red-600 disabled:opacity-50"
          >
            {deleteRatingMutation.isPending ? '삭제 중' : '삭제'}
          </button>
        )}
      </div>
    </>
  );
}
