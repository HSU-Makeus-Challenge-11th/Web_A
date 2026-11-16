import { browserStorage } from "../utils/browser-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ProfileDetails {
  nickname: string;
  avatar: string | null;
}

interface ProfileStore extends ProfileDetails {
  saveProfile: (details: ProfileDetails) => void;
}

export const PROFILE_EMAIL = "gwangsoo@cinemalab.kr";

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      nickname: "gs0428",
      avatar: null,
      saveProfile: (details) => set(details),
    }),
    {
      storage: createJSONStorage(() => browserStorage),
      skipHydration: true,
      name: "umcine-profile-preview",
      partialize: ({ nickname, avatar }) => ({ nickname, avatar }),
    },
  ),
);
