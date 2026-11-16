import { browserStorage } from "../utils/browser-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthStore {
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      setAccessToken: (accessToken) => set({ accessToken }),
    }),
    {
      skipHydration: true,
      name: "umcine-auth-store",
      storage: createJSONStorage(() => browserStorage),
      partialize: (state) => ({ accessToken: state.accessToken }),
    },
  ),
);
