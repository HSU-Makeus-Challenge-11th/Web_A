import { authApi } from "./auth-api";

export interface Favorite {
  movieId: number;
}

export async function getFavorites() {
  const response = await authApi.get("favorites").json<{ result: Favorite[] }>();
  return response.result;
}

export async function getFavorite(movieId: number) {
  const response = await authApi.get(`favorites/${movieId}`).json<{
    result: { isFavorite: boolean };
  }>();
  return response.result.isFavorite;
}

export async function addFavorite(movieId: number) {
  await authApi.post("favorites", { json: { movieId }, retry: 0 });
}

export async function deleteFavorite(movieId: number) {
  await authApi.delete(`favorites/${movieId}`, { retry: 0 });
}
