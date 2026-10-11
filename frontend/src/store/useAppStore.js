// Purpose: useAppStore implements this source module.
import { create } from "zustand";

export const initialEvents = [];

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem("convene_theme") === "dark" ? "dark" : "light";
};

export const useAppStore = create((set) => ({
  currentUser: null,
  token: null,
  sidebarExpanded: true,
  theme: getInitialTheme(),
  role: "lead", // "lead" | "member"
  events: [],
  eventsHydrated: false,
  activeEvent: null,
  hasOnboarded: false,

  setUserSession: (user, token) => set({ currentUser: user, token }),
  clearSession: () => {
    localStorage.removeItem("convene_token");
    set({ currentUser: null, token: null, events: [], eventsHydrated: false, activeEvent: null });
  },
  setRole: (role) => set({ role }),
  setActiveEvent: (event) => set({ activeEvent: event, role: event?.accessLevel === "lead" ? "lead" : "member" }),
  addEvent: (newEvent) =>
    set((state) => {
      const event = { ...newEvent, userRole: newEvent.userRole || "organizer", accessLevel: newEvent.accessLevel || "lead" };
      return {
      events: [event, ...state.events],
      eventsHydrated: true,
      activeEvent: event,
      role: event.accessLevel === "lead" ? "lead" : "member",
      hasOnboarded: true
      };
    }),
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
  toggleTheme: () => set((state) => {
    const theme = state.theme === "light" ? "dark" : "light";
    window.localStorage.setItem("convene_theme", theme);
    return { theme };
  })
}));
