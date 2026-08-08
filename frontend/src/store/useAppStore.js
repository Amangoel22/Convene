import { create } from "zustand";

export const useAppStore = create((set) => ({
  sidebarExpanded: true,
  theme: "light",
  role: "lead", // "lead" | "member"
  setRole: (role) => set({ role }),
  toggleRole: () => set((state) => ({ role: state.role === "lead" ? "member" : "lead" })),
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
  toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" }))
}));
