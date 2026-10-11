import { useBookmarkStore } from "../stores/bookmark-store";

interface BookmarkButtonProps {
  movieId: number;
  variant?: "icon" | "text";
}

export function BookmarkButton({ movieId, variant = "text" }: BookmarkButtonProps) {
  const isBookmarked = useBookmarkStore((state) =>
    state.bookmarkedMovieIds.includes(movieId),
  );
  const toggleBookmark = useBookmarkStore(
    (state) => state.toggleBookmark,
  );

  return (
    <button type="button" aria-pressed={isBookmarked} aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"} onClick={() => toggleBookmark(movieId)}
      className={variant === "icon" ? `absolute top-[10px] right-[10px] size-8 cursor-pointer rounded-[6px] border p-[5px] ${isBookmarked ? "border-blue-600 bg-blue-700" : "border-white bg-black"}` : `mt-3 inline-flex w-fit cursor-pointer items-center gap-2 rounded-[6px] px-4 py-[10px] text-xs font-semibold text-white ${isBookmarked ? "bg-blue-700" : "bg-blue-600"}`}
    >
      <img className={variant === "icon" ? "size-full" : "size-4"} src={isBookmarked ? "/icons/movie-icons/bookmark.svg" : "/icons/movie-icons/bookmark-outline.svg"} alt="" />
      {variant === "text" && (isBookmarked ? "북마크 해제" : "북마크 추가")}
    </button>
  );
}
