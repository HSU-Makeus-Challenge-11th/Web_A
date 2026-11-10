import { Link } from '@tanstack/react-router';
import { isHTTPError } from 'ky';
import { useRef, useState, type SubmitEvent } from 'react';
import { getMemberRatings } from '../../api/members/get-member-ratings';
import type { MemberRating } from '../../api/members/models';
import { getMovieDetail } from '../../api/movies/get-movie-detail';
import type { TmdbMovieDetail } from '../../api/movies/models';
import { getTmdbPosterUrl } from '../../utils/movies/tmdb-image';

interface RatingWithMovie {
  rating: MemberRating;
  movie: TmdbMovieDetail | null;
}

export function MemberRatings() {
  const [memberIdInput, setMemberIdInput] = useState('1');
  const [ratings, setRatings] = useState<RatingWithMovie[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestRequestId = useRef(0);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const memberId = Number(memberIdInput);
    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;

    setRatings(null);
    setErrorMessage(null);

    if (!Number.isInteger(memberId) || memberId <= 0) {
      setErrorMessage('회원 ID는 1 이상의 숫자로 입력해 주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const memberRatings = await getMemberRatings(memberId);
      const movieResults = await Promise.allSettled(
        memberRatings.map((rating) => getMovieDetail(rating.movieId)),
      );

      if (requestId !== latestRequestId.current) return;

      setRatings(
        memberRatings.map((rating, index) => {
          const movieResult = movieResults[index];
          return {
            rating,
            movie: movieResult.status === 'fulfilled' ? movieResult.value : null,
          };
        }),
      );
    } catch (error) {
      if (requestId !== latestRequestId.current) return;

      setErrorMessage(
        isHTTPError(error) && error.response.status === 404
          ? '존재하지 않는 회원이에요.'
          : '평점 목록을 불러오지 못했어요. 서버가 켜져 있는지 확인해 주세요.',
      );
    } finally {
      if (requestId === latestRequestId.current) setIsLoading(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">내 평점</h2>
          <p className="mt-1 text-sm text-gray-400">
            로그인 기능이 생기기 전까지는 회원 ID로 조회해요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            aria-label="회원 ID"
            inputMode="numeric"
            value={memberIdInput}
            onChange={(event) => setMemberIdInput(event.target.value)}
            placeholder="회원 ID"
            className="h-11 w-28 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none placeholder:text-gray-400 focus:border-gray-900"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="h-11 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white disabled:bg-gray-300"
          >
            {isLoading ? '조회 중' : '조회'}
          </button>
        </form>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="py-12 text-center text-gray-500">평점 목록을 불러오는 중이에요.</p>
        ) : errorMessage ? (
          <p className="py-12 text-center text-red-500">{errorMessage}</p>
        ) : ratings === null ? (
          <p className="py-12 text-center text-gray-500">회원 ID를 입력하고 조회를 눌러 주세요.</p>
        ) : ratings.length === 0 ? (
          <p className="py-12 text-center text-gray-500">아직 남긴 평점이 없어요.</p>
        ) : (
          <ul className="flex flex-col">
            {ratings.map(({ rating, movie }) => {
              const posterUrl = movie ? getTmdbPosterUrl(movie.poster_path) : null;

              return (
                <li
                  key={rating.ratingId}
                  className="flex gap-5 border-b border-gray-200 py-5 last:border-b-0"
                >
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={`${movie?.title} 포스터`}
                      className="aspect-[2/3] w-20 shrink-0 self-start rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[2/3] w-20 shrink-0 items-center justify-center self-start rounded-lg bg-gray-200 text-xs text-gray-500">
                      이미지 없음
                    </div>
                  )}

                  <div className="flex min-w-0 flex-col gap-1.5">
                    <Link
                      to="/movies/$movieId"
                      params={{ movieId: String(rating.movieId) }}
                      className="text-lg font-bold text-gray-900 hover:underline"
                    >
                      {movie?.title ?? `영화 #${rating.movieId}`}
                    </Link>
                    <p className="text-sm font-semibold text-blue-600">
                      {'★'.repeat(rating.score)}
                      <span className="text-gray-300">{'★'.repeat(5 - rating.score)}</span>
                      <span className="ml-2 text-gray-500">{rating.score}점</span>
                    </p>
                    <p className="text-sm leading-relaxed text-gray-600">
                      {rating.comment ?? '남긴 코멘트가 없어요.'}
                    </p>
                    <p className="text-xs text-gray-400">{rating.createdAt.slice(0, 10)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
