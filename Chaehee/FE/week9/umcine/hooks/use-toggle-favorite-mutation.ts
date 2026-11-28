import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addFavorite, removeFavorite } from '../api/favorites/favorites';

interface ToggleFavoriteVariables {
  movieId: number;
  isFavorite: boolean;
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ movieId, isFavorite }: ToggleFavoriteVariables) => {
      if (isFavorite) {
        await removeFavorite(movieId);
      } else {
        await addFavorite(movieId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: () => {
      alert('즐겨찾기 변경에 실패했어요. 다시 시도해 주세요.');
    },
  });
}
