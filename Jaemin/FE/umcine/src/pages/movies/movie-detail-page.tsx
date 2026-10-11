import { BookmarkButton } from "../../components/bookmark-button";
import { Link, useParams } from "@tanstack/react-router";
import { useState, type SubmitEvent } from "react";
import { movies } from "../../data/movies";
import type { Movie } from "../../types/movie";
import { cn } from "../../utils/cn";

export function MovieDetailPage() {
  const { movieId } = useParams({ from: "/movies/$movieId" });
  const movie = movies.find((item) => item.id === Number(movieId));

  if (!movie) {
    return (
      <main className="mx-auto w-full max-w-[1120px] px-6 py-16">
        <h1 className="mb-6 text-2xl font-bold">영화를 찾을 수 없어요.</h1>
        <Link to="/" className="text-blue-600 underline">영화 목록으로 돌아가기</Link>
      </main>
    );
  }

  return <MovieDetail key={movie.id} movie={movie} />;
}

function MovieDetail({ movie }: { movie: Movie }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [savedReview, setSavedReview] = useState<{ rating: number; review: string } | null>(null);

  function handleSave(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating === 0) return;
    setSavedReview({ rating, review: review.trim() });
  }

  return (
    <main className="flex w-full flex-1 flex-col bg-[#f6f7f9]">
      <section className="relative isolate bg-gray-900 text-white">
        <img className="absolute inset-0 -z-20 h-full w-full object-cover object-center" src={movie.backdropPath} alt="" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/65 via-black/20 to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/45 to-transparent" aria-hidden="true" />
        <div className="mx-auto flex min-h-[300px] max-w-[1280px] flex-col justify-between gap-16 px-4 py-6 sm:min-h-[320px] sm:px-6 lg:px-16">
          <Link to="/" className="flex w-fit items-center gap-2 text-xs hover:underline">
            <span aria-hidden="true" className="text-2xl leading-none">‹</span> 영화 목록
          </Link>
          <div>
            <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">{movie.title}</h1>
            <p className="mt-2 text-xs">{movie.originalTitle}</p>
            <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs font-semibold">
              <p>{movie.releaseDate}</p>
              <p>{movie.genres.join(" · ")}</p>
              <p>{movie.runtime}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-[1280px] flex-1 content-start gap-7 px-4 py-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:px-6 lg:min-h-[460px] lg:grid-cols-[180px_minmax(0,1fr)_320px] lg:px-16">
        <img className="aspect-[2/3] w-[180px] rounded-lg object-cover shadow-xl" src={movie.posterPath} alt={`${movie.title} 포스터`} />
        <section className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight">{movie.tagline}</h2>
          <p className="mt-3 text-xs leading-6 whitespace-pre-line text-[#6b7280]">{movie.overview}</p>
          <BookmarkButton movieId={movie.id} />
        </section>

        <form onSubmit={handleSave} className="border-t border-[#e5e7eb] pt-6 sm:col-span-2 lg:col-span-1 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-7">
          <h2 className="text-lg font-bold">내 평점</h2>
          <p className="mt-1 text-[11px] text-gray-400">별점을 골라, 후기는 선택이에요.</p>
          <div role="group" aria-label="별점 선택" className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((score) => (
              <button key={score} type="button" aria-label={`${score}점`} aria-pressed={rating === score} onClick={() => setRating(score)}
                className={cn("flex size-9 cursor-pointer items-center justify-center rounded-[6px] border border-[#e1e5eb] bg-white text-2xl", score <= rating ? "text-[#2563eb]" : "text-[#6b7280]")}
              >
                <span aria-hidden="true">★</span>
              </button>
            ))}
          </div>
          <textarea aria-label="영화 후기" placeholder="영화를 보고 느낀 점을 남겨보세요." value={review} onChange={(event) => setReview(event.target.value)}
            className="mt-2 block min-h-[90px] w-full resize-y rounded-[6px] border border-[#e1e5eb] bg-white p-3 text-xs leading-5 placeholder:text-gray-400 focus:outline-blue-600" />
          <button type="submit" disabled={rating === 0} className="mt-2 w-full cursor-pointer rounded-[6px] bg-[#18191c] py-[10px] text-xs font-semibold text-white disabled:cursor-not-allowed">평점 저장</button>
          {savedReview && <p role="status" className="mt-3 text-xs leading-5 text-gray-600">이 화면에 {savedReview.rating}점을 저장했어요.{savedReview.review && ` 후기: ${savedReview.review}`}</p>}
        </form>
      </div>
    </main>
  );
}
