import { create } from "zustand";

export const useAppStore = create((set) => ({
  sidebarExpanded: true,
  theme: "light",
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
  toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" }))
}));
