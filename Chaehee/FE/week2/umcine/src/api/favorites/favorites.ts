import { authApi } from '../auth-api';
import type { ApiResponse, Favorite, FavoriteStatus } from './models';

export async function getFavorites(): Promise<Favorite[]> {
  const response = await authApi.get('favorites').json<ApiResponse<Favorite[]>>();
  return response.result;
}

export async function getFavoriteStatus(movieId: number): Promise<FavoriteStatus> {
  const response = await authApi.get(`favorites/${movieId}`).json<ApiResponse<FavoriteStatus>>();
  return response.result;
}

export function addFavorite(movieId: number) {
  return authApi.post('favorites', { json: { movieId } }).json<ApiResponse<Favorite>>();
}

export function removeFavorite(movieId: number) {
  return authApi.delete(`favorites/${movieId}`).json<ApiResponse<null>>();
}
