import { useQuery } from '@tanstack/react-query';
import { getFavoriteStatus, getFavorites } from '../api/favorites/favorites';
import { useAuthStore } from '../stores/auth-store';

export function useFavoritesQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['favorites', 'list'],
    queryFn: getFavorites,
    enabled: Boolean(accessToken),
  });
}

export function useFavoriteStatusQuery(movieId: number) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['favorites', 'status', movieId],
    queryFn: () => getFavoriteStatus(movieId),
    enabled: Boolean(accessToken) && movieId > 0,
  });
}
