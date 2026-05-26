import { create } from "zustand";

interface AppState {
  isAuthenticated: boolean;
  currentBucket: string | null;
  currentPrefix: string;
  setAuthenticated: (val: boolean) => void;
  setCurrentBucket: (bucket: string | null) => void;
  setCurrentPrefix: (prefix: string) => void;
  navigateUp: () => void;
  navigateInto: (folder: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  currentBucket: null,
  currentPrefix: "",
  setAuthenticated: (val) => set({ isAuthenticated: val }),
  setCurrentBucket: (bucket) => set({ currentBucket: bucket, currentPrefix: "" }),
  setCurrentPrefix: (prefix) => set({ currentPrefix: prefix }),
  navigateUp: () => set((state) => {
    const parts = state.currentPrefix.split("/").filter(Boolean);
    parts.pop();
    const newPrefix = parts.length > 0 ? parts.join("/") + "/" : "";
    return { currentPrefix: newPrefix };
  }),
  navigateInto: (folder) => set((state) => ({
    currentPrefix: state.currentPrefix + folder
  })),
}));
