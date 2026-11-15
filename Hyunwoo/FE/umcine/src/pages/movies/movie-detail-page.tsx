import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookmarkButton } from "../../components/bookmark-button";
import { MyRating } from "../../components/movies/my-rating";
import { movieDetailOptions } from "../../queries/movie-queries";
import { getMovieDetailErrorMessage } from "../../utils/movies/get-movie-detail-error-message";
import {
    getTmdbBackdropUrl,
    getTmdbPosterUrl,
} from "../../utils/movies/tmdb-image";

function formatRuntime(runtime: number | null) {
    if (runtime === null) {
        return "상영 시간 정보가 없어요.";
    }

    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;

    if (hours === 0) return `${minutes}분`;
    if (minutes === 0) return `${hours}시간`;
    return `${hours}시간 ${minutes}분`;
}

export function MovieDetailPage() {
    const { movieId } = useParams({ from: "/movies/$movieId" });
    const parsedMovieId = Number(movieId);
    const isValidMovieId =
        Number.isInteger(parsedMovieId) && parsedMovieId > 0;

    const movieDetailQuery = useQuery({
        ...movieDetailOptions(parsedMovieId),
        enabled: isValidMovieId,
    });

    if (!isValidMovieId) {
        return <main className="p-10 text-center">올바르지 않은 영화 번호예요.</main>;
    }

    if (movieDetailQuery.isPending) {
        return <main className="p-10 text-center">영화 정보를 불러오는 중이에요.</main>;
    }

    if (movieDetailQuery.isError) {
        return (
            <main className="flex flex-col items-center gap-3 p-10">
                <p>{getMovieDetailErrorMessage(movieDetailQuery.error)}</p>
                <button
                    type="button"
                    onClick={() => void movieDetailQuery.refetch()}
                    disabled={movieDetailQuery.isFetching}
                    className="rounded-lg bg-[#17191d] px-4 py-2 text-sm font-bold text-white"
                >
                    다시 시도
                </button>
            </main>
        );
    }

    const movie = movieDetailQuery.data;
    if (!movie) {
        return <main className="p-10 text-center">영화를 찾을 수 없어요.</main>;
    }

    const backdropUrl = getTmdbBackdropUrl(movie.backdrop_path);
    const posterUrl = getTmdbPosterUrl(movie.poster_path);

    return (
        <main>
            <section className="relative h-[360px] overflow-hidden">
                {backdropUrl ? (
                    <img
                        src={backdropUrl}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#c4cad4] text-sm text-[#667085]">
                        이미지 없음
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />

                <div className="relative mx-auto flex h-full max-w-[1280px] flex-col justify-between px-5 py-6 xl:px-0">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm font-bold text-white"
                    >
                        <img
                            src="/icons/chevron-left.svg"
                            alt=""
                            className="h-5 w-5 brightness-0 invert"
                        />
                        영화 목록
                    </Link>
                    <div className="text-white">
                        <h1 className="text-[28px] font-bold leading-tight tracking-tight md:text-[40px]">
                            {movie.title}
                        </h1>

                        <p className="mt-2 text-sm">
                            {movie.original_title}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs font-bold">
                            <span>{movie.release_date}</span>
                            <span>{movie.genres.map((genre) => genre.name).join(", ")}</span>
                            <span>{formatRuntime(movie.runtime)}</span>
                        </div>
                    </div>
                </div>
            </section>
            <section className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-5 py-6 md:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)_360px] xl:px-0">
                {posterUrl ? (
                    <img
                        src={posterUrl}
                        alt={`${movie.title} 포스터`}
                        className="w-[200px] rounded-[10px] shadow-xl"
                    />
                ) : (
                    <div className="flex w-[200px] aspect-[2/3] items-center justify-center rounded-[10px] bg-[#e1e5ee] text-sm text-[#8b95a5] shadow-xl">
                        이미지 없음
                    </div>
                )}

                <div>
                    <h2 className="text-[20px] font-bold leading-7 text-[#202329]">
                        {movie.tagline}
                    </h2>

                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#667085]">
                        {movie.overview}
                    </p>
                    <BookmarkButton movieId={movie.id} />
                </div>
                <MyRating movieId={movie.id} />
            </section>
        </main>
    );
}
