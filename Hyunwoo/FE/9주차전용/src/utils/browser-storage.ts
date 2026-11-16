import type { StateStorage } from "zustand/middleware";

// Client Components도 서버에서 미리 렌더링되므로 실제 저장소 접근을 지연해요.
export const browserStorage: StateStorage = {
  getItem: (name) => typeof window === "undefined" ? null : window.localStorage.getItem(name),
  setItem: (name, value) => { if (typeof window !== "undefined") window.localStorage.setItem(name, value); },
  removeItem: (name) => { if (typeof window !== "undefined") window.localStorage.removeItem(name); },
};
