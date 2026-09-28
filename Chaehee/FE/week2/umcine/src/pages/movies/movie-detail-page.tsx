import { Link, useParams } from '@tanstack/react-router';
import { movies } from '../../data/movies';

export function MovieDetailPage() {
  const { movieId } = useParams({ from: '/movies/$movieId' });
  const movie = movies.find((item) => item.id === Number(movieId));

  if (!movie) {
    return (
      <main className="mx-auto w-full max-w-[1328px] px-6 py-16">
        <p className="text-lg font-semibold text-gray-900">영화를 찾을 수 없어요.</p>
      </main>
    );
  }

  return (
    <main>
      <section className="relative h-[360px] overflow-hidden bg-neutral-900 text-white">
        <img
          src={movie.backdropPath}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.7),rgba(0,0,0,0)_60%)]" />

        <div className="relative mx-auto flex h-full w-full max-w-[1328px] flex-col justify-between px-6 pb-6 pt-7">
          <Link to="/" className="flex w-fit items-center gap-1 text-sm font-semibold">
            <img
              src="/icons/movie-icons/chevron-left.svg"
              alt=""
              className="h-4 w-4 brightness-0 invert"
            />
            영화 목록
          </Link>

          <div>
            <h1 className="text-[40px] font-extrabold leading-tight tracking-tight">
              {movie.title}
            </h1>
            <p className="mt-2 text-sm">{movie.originalTitle}</p>
            <p className="mt-1.5 text-sm font-semibold">
              {movie.releaseDate}
              <span className="mx-2">{movie.genres.join(' · ')}</span>
              {movie.runtime}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1328px] grid-cols-1 gap-8 px-6 pb-16 pt-6 md:grid-cols-[200px_1fr] lg:grid-cols-[200px_1fr_360px]">
        <img
          src={movie.posterPath}
          alt={`${movie.title} 포스터`}
          className="aspect-[7/10] w-[200px] self-start rounded-xl object-cover shadow-lg"
        />

        <div className="flex flex-col items-start gap-3">
          <h2 className="text-xl font-extrabold leading-snug tracking-tight text-gray-900">
            {movie.tagline}
          </h2>
          <p className="text-[15px] leading-relaxed text-gray-500">{movie.overview}</p>
          <button
            type="button"
            className="mt-1 flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"
          >
            <img
              src="/icons/movie-icons/bookmark-outline.svg"
              alt=""
              className="h-4 w-4 brightness-0 invert"
            />
            즐겨찾기
          </button>
        </div>

        <aside className="flex flex-col gap-2 md:col-span-2 lg:col-span-1 lg:border-l lg:border-gray-200 lg:pl-8">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-gray-900">내 평점</h2>
            <p className="mt-1 text-xs text-gray-400">별점은 필수, 후기는 선택이에요.</p>
          </div>

          <div className="mt-1 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                aria-label={`${score}점`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white"
              >
                <img src="/icons/movie-icons/star.svg" alt="" className="h-4 w-4 opacity-70" />
              </button>
            ))}
          </div>

          <textarea
            aria-label="후기"
            placeholder="영화를 보고 느낀 점을 남겨보세요."
            className="h-[100px] w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm placeholder:text-gray-400"
          />
          <button
            type="button"
            className="h-10 w-full rounded-lg bg-gray-900 text-sm font-semibold text-white"
          >
            평점 저장
          </button>
        </aside>
      </section>
    </main>
  );
}
