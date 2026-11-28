import { authApi } from '../auth-api';
import type { MemberRating } from '../members/models';

interface RatingApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

export interface CreateRatingRequest {
  movieId: number;
  score: number;
  comment?: string;
}

export interface UpdateRatingRequest {
  score: number;
  comment?: string;
}

export function createRating(body: CreateRatingRequest) {
  return authApi.post('ratings', { json: body }).json<RatingApiResponse<MemberRating>>();
}

export function updateRating(ratingId: number, body: UpdateRatingRequest) {
  return authApi
    .patch(`ratings/${ratingId}`, { json: body })
    .json<RatingApiResponse<MemberRating>>();
}

export function deleteRating(ratingId: number) {
  return authApi.delete(`ratings/${ratingId}`).json<RatingApiResponse<null>>();
}
