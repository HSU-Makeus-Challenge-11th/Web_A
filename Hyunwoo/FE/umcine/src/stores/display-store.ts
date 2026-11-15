import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface DisplayStore {
  cardSize: "small" | "large";
  setCardSize: (size: "small" | "large") => void;
}

export const useDisplayStore = create<DisplayStore>()(
  persist(
    (set) => ({
      cardSize: "small",
      setCardSize: (size) => set({ cardSize: size }),
    }),
    {
      name: "umcine-display-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);