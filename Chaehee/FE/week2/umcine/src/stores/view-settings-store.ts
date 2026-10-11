import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type MovieSortOrder = 'latest' | 'title';

interface ViewSettingsStore {
  sortOrder: MovieSortOrder;
  setSortOrder: (sortOrder: MovieSortOrder) => void;
}

export const useViewSettingsStore = create<ViewSettingsStore>()(
  persist(
    (set) => ({
      sortOrder: 'latest',
      setSortOrder: (sortOrder) => set({ sortOrder }),
    }),
    {
      name: 'umcine-view-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sortOrder: state.sortOrder,
      }),
    },
  ),
);
