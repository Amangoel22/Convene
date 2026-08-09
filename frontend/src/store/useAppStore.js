import { create } from "zustand";

export const initialEvents = [];

export const useAppStore = create((set) => ({
  currentUser: null,
  token: null,
  sidebarExpanded: true,
  theme: "light",
  role: "lead", // "lead" | "member"
  events: [],
  activeEvent: null,
  hasOnboarded: false,

  setUserSession: (user, token) => set({ currentUser: user, token }),
  clearSession: () => {
    localStorage.removeItem("convene_token");
    set({ currentUser: null, token: null, events: [], activeEvent: null });
  },
  setRole: (role) => set({ role }),
  toggleRole: () => set((state) => ({ role: state.role === "lead" ? "member" : "lead" })),
  setActiveEvent: (event) => set({ activeEvent: event }),
  addEvent: (newEvent) =>
    set((state) => ({
      events: [newEvent, ...state.events],
      activeEvent: newEvent,
      hasOnboarded: true
    })),
  updateActiveEventStages: (stageId, newStatus) =>
    set((state) => {
      if (!state.activeEvent) return state;
      const updatedStages = state.activeEvent.stages.map((s) =>
        s.id === stageId ? { ...s, status: newStatus } : s
      );
      const updatedActiveEvent = { ...state.activeEvent, stages: updatedStages };
      const updatedEvents = state.events.map((e) =>
        e.id === state.activeEvent.id ? updatedActiveEvent : e
      );
      return { activeEvent: updatedActiveEvent, events: updatedEvents };
    }),
  updateStageDetails: (stageId, updatedData) =>
    set((state) => {
      if (!state.activeEvent) return state;
      const updatedStages = state.activeEvent.stages.map((s) =>
        s.id === stageId ? { ...s, ...updatedData } : s
      );
      const updatedActiveEvent = { ...state.activeEvent, stages: updatedStages };
      const updatedEvents = state.events.map((e) =>
        e.id === state.activeEvent.id ? updatedActiveEvent : e
      );
      return { activeEvent: updatedActiveEvent, events: updatedEvents };
    }),
  addStageToActiveEvent: (newStage) =>
    set((state) => {
      if (!state.activeEvent) return state;
      const updatedStages = [...state.activeEvent.stages, newStage];
      const updatedActiveEvent = { ...state.activeEvent, stages: updatedStages };
      const updatedEvents = state.events.map((e) =>
        e.id === state.activeEvent.id ? updatedActiveEvent : e
      );
      return { activeEvent: updatedActiveEvent, events: updatedEvents };
    }),
  deleteStageFromActiveEvent: (stageId) =>
    set((state) => {
      if (!state.activeEvent) return state;
      const updatedStages = state.activeEvent.stages.filter((s) => s.id !== stageId);
      const updatedActiveEvent = { ...state.activeEvent, stages: updatedStages };
      const updatedEvents = state.events.map((e) =>
        e.id === state.activeEvent.id ? updatedActiveEvent : e
      );
      return { activeEvent: updatedActiveEvent, events: updatedEvents };
    }),
  completeOnboarding: () => set({ hasOnboarded: true }),
  resetOnboarding: () => set({ hasOnboarded: false }),
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
  toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" }))
}));
