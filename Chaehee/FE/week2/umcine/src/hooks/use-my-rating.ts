import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMemberRatings } from '../api/members/get-member-ratings';
import { createRating, deleteRating, updateRating } from '../api/ratings/ratings';
import { useAuthStore } from '../stores/auth-store';
import { getMemberIdFromToken } from '../utils/auth/get-member-id-from-token';

export function useMyMemberId() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return getMemberIdFromToken(accessToken);
}

function getMyRatingsKey(memberId: number | null) {
  return ['members', memberId, 'ratings'];
}

export function useMyRatingQuery(movieId: number) {
  const memberId = useMyMemberId();

  return useQuery({
    queryKey: getMyRatingsKey(memberId),
    queryFn: () => getMemberRatings(memberId!),
    enabled: memberId !== null,
    select: (ratings) => ratings.find((rating) => rating.movieId === movieId) ?? null,
  });
}

interface SaveRatingVariables {
  ratingId: number | null;
  movieId: number;
  score: number;
  comment: string;
}

export function useSaveRatingMutation() {
  const queryClient = useQueryClient();
  const memberId = useMyMemberId();

  return useMutation({
    mutationFn: ({ ratingId, movieId, score, comment }: SaveRatingVariables) => {
      const body = { score, comment: comment || undefined };
      return ratingId === null
        ? createRating({ movieId, ...body })
        : updateRating(ratingId, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getMyRatingsKey(memberId) });
      alert('평점을 저장했어요.');
    },
    onError: () => {
      alert('평점 저장에 실패했어요. 다시 시도해 주세요.');
    },
  });
}

export function useDeleteRatingMutation() {
  const queryClient = useQueryClient();
  const memberId = useMyMemberId();

  return useMutation({
    mutationFn: deleteRating,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getMyRatingsKey(memberId) });
      alert('평점을 삭제했어요.');
    },
    onError: () => {
      alert('평점 삭제에 실패했어요. 다시 시도해 주세요.');
    },
  });
}
