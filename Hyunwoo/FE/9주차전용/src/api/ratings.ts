import { authApi } from "./auth-api";
import { apiClient } from "./api-client";

export interface Rating {
  ratingId: number;
  movieId: number;
  score: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RatingInput {
  score: number;
  comment: string;
}

export async function getMemberRatings(memberId: number) {
  return apiClient.get(`members/${memberId}/ratings`).json<Rating[]>();
}

export async function createRating(body: RatingInput & { movieId: number }) {
  await authApi.post("ratings", { json: body, retry: 0 });
}

export async function updateRating(ratingId: number, body: RatingInput) {
  await authApi.patch(`ratings/${ratingId}`, { json: body, retry: 0 });
}

export async function deleteRating(ratingId: number) {
  await authApi.delete(`ratings/${ratingId}`, { retry: 0 });
}
