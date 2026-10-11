import { useState } from "react";
import MovieGrid from "../../components/movies/movie-grid";
import Pagination from "../../components/movies/pagination";
import { movies } from "../../data/movies";
import { useDisplayStore } from "../../stores/display-store";

export function MovieListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const cardSize = useDisplayStore((state) => state.cardSize);
  const setCardSize = useDisplayStore((state) => state.setCardSize);

  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">영화 목록</h1>
        <div role="group" aria-label="영화 카드 크기" className="flex items-center gap-2">
          <span className="text-sm text-gray-500">카드 크기</span>
          {(["small", "large"] as const).map((size) => (
            <button
              key={size}
              type="button"
              aria-pressed={cardSize === size}
              onClick={() => setCardSize(size)}
              className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${cardSize === size ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 bg-white text-gray-700"}`}
            >
              {size === "small" ? "작게" : "크게"}
            </button>
          ))}
        </div>
      </div>

      <MovieGrid movies={movies} cardSize={cardSize} />

      <Pagination currentPage={currentPage} onPageChange={setCurrentPage} />

    </main>
  );
}
