import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getFavorite, getFavorites, type Favorite } from "../api/favorites";
import { favoriteMutationOptions } from "../mutations/favorite-mutations";
import { useAuthStore } from "../stores/auth-store";

export function useFavoritesQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["favorites", accessToken, "list"],
    queryFn: getFavorites,
    enabled: Boolean(accessToken),
    retry: false,
  });
}

export function useFavoriteQuery(movieId: number) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["favorites", accessToken, "movie", movieId],
    queryFn: () => getFavorite(movieId),
    enabled: Boolean(accessToken),
    retry: false,
  });
}

export function useFavoriteMutation() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    ...favoriteMutationOptions(accessToken),
    onSuccess: async (_, { movieId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ["favorites", accessToken] });
      queryClient.setQueryData(["favorites", accessToken, "movie", movieId], !isFavorite);
      queryClient.setQueryData<Favorite[]>(["favorites", accessToken, "list"], (previous) => {
        if (!previous) return previous;
        return isFavorite
          ? previous.filter((favorite) => favorite.movieId !== movieId)
          : [...previous.filter((favorite) => favorite.movieId !== movieId), { movieId }];
      });
    },
    onError: () => alert("즐겨찾기 변경에 실패했어요. 다시 시도해 주세요."),
  });
}

export function useFavoriteList() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const query = useFavoritesQuery();
  const mutation = useFavoriteMutation();
  const router = useRouter();
  const bookmarkIds = accessToken ? (query.data ?? []).map((favorite) => favorite.movieId) : [];

  function toggleBookmark(movieId: number) {
    if (!accessToken) {
      router.push("/login");
      return;
    }
    if (!query.isSuccess || query.isFetching || mutation.isPending) return;
    mutation.mutate({ movieId, isFavorite: bookmarkIds.includes(movieId) });
  }

  return { query, mutation, bookmarkIds, toggleBookmark };
}
