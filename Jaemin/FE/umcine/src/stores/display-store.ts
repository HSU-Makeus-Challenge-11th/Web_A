import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CardSize = "small" | "large";

interface DisplayStore {
  cardSize: CardSize;
  setCardSize: (cardSize: CardSize) => void;
}

export const useDisplayStore = create<DisplayStore>()(
  persist(
    (set) => ({
      cardSize: "small",
      setCardSize: (cardSize) => set({ cardSize }),
    }),
    {
      name: "umcine-display-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cardSize: state.cardSize }),
    },
  ),
);
