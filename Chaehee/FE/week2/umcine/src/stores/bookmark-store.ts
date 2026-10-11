import { create } from 'zustand';

interface BookmarkStore {
  bookmarkedMovieIds: number[];
  toggleBookmark: (movieId: number) => void;
}

export const useBookmarkStore = create<BookmarkStore>((set) => ({
  bookmarkedMovieIds: [],
  toggleBookmark: (movieId) =>
    set((state) => ({
      bookmarkedMovieIds: state.bookmarkedMovieIds.includes(movieId)
        ? state.bookmarkedMovieIds.filter((id) => id !== movieId)
        : [...state.bookmarkedMovieIds, movieId],
    })),
}));
