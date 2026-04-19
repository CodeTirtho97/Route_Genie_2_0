import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarOpen:  boolean;
  activeModal:  string | null;
  themeMode:    "dark" | "light";

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar:  () => void;
  openModal:      (id: string) => void;
  closeModal:     () => void;
  toggleTheme:    () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      activeModal: null,
      themeMode:   "dark",

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar:  () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      openModal:      (id) => set({ activeModal: id }),
      closeModal:     () => set({ activeModal: null }),
      toggleTheme:    () => set((s) => ({ themeMode: s.themeMode === "dark" ? "light" : "dark" })),
    }),
    {
      name:        "routegenie-ui",
      partialize:  (s) => ({ themeMode: s.themeMode }),
    },
  ),
);
