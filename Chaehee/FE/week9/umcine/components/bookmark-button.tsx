'use client';

import { useRouter } from 'next/navigation';
import { useToggleFavoriteMutation } from '../hooks/use-toggle-favorite-mutation';
import { useAuthStore } from '../stores/auth-store';

interface BookmarkButtonProps {
  movieId: number;
  isFavorite: boolean;
}

export function BookmarkButton({ movieId, isFavorite }: BookmarkButtonProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const toggleFavoriteMutation = useToggleFavoriteMutation();

  const handleClick = () => {
    if (!accessToken) {
      alert('로그인이 필요해요.');
      router.push('/login');
      return;
    }
    toggleFavoriteMutation.mutate({ movieId, isFavorite });
  };

  return (
    <button type="button" onClick={handleClick} disabled={toggleFavoriteMutation.isPending}>
      {isFavorite ? '북마크 해제' : '북마크 추가'}
    </button>
  );
}
