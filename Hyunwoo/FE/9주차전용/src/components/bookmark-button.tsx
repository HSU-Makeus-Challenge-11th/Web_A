import { useRouter } from "next/navigation";
import { useIsMutating } from "@tanstack/react-query";
import { useFavoriteMutation, useFavoriteQuery } from "../hooks/use-favorites";
import { useAuthStore } from "../stores/auth-store";

interface BookmarkButtonProps {
  movieId: number;
}

export function BookmarkButton({ movieId }: BookmarkButtonProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const query = useFavoriteQuery(movieId);
  const mutation = useFavoriteMutation();
  const pending = useIsMutating({ mutationKey: ["favorites", accessToken, "change"] }) > 0;
  const router = useRouter();
  const isBookmarked = Boolean(accessToken && query.data);

  return (
    <div className="mt-4">
      <button
        type="button"
        aria-pressed={isBookmarked}
        disabled={Boolean(accessToken) && (!query.isSuccess || query.isFetching || pending)}
        onClick={() => {
          if (!accessToken) router.push("/login");
          else mutation.mutate({ movieId, isFavorite: isBookmarked });
        }}
        className="rounded-lg border px-4 py-2 text-sm font-bold disabled:opacity-50"
      >
        {pending ? "변경 중" : accessToken && query.isLoading ? "즐겨찾기 확인 중" : isBookmarked ? "북마크 해제" : "북마크 추가"}
      </button>
      {accessToken && query.isError && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          즐겨찾기를 확인하지 못했어요. <button type="button" onClick={() => void query.refetch()}>다시 시도</button>
        </p>
      )}
    </div>
  );
}
