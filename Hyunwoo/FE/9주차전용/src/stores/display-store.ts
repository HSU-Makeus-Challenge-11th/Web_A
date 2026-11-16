import { browserStorage } from "../utils/browser-storage";
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
      skipHydration: true,
      name: "umcine-display-store",
      storage: createJSONStorage(() => browserStorage),
    },
  ),
);