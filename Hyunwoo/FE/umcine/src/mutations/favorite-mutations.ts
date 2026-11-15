import { mutationOptions } from "@tanstack/react-query";
import { addFavorite, deleteFavorite } from "../api/favorites";

export interface ChangeFavoriteInput {
  movieId: number;
  isFavorite: boolean;
}

export function favoriteMutationOptions(accessToken: string | null) {
  return mutationOptions({
    mutationKey: ["favorites", accessToken, "change"],
    mutationFn: async ({ movieId, isFavorite }: ChangeFavoriteInput) => {
      if (!accessToken) throw new Error("로그인이 필요해요.");
      if (isFavorite) await deleteFavorite(movieId);
      else await addFavorite(movieId);
    },
  });
}
