// Purpose: useAppStore implements this source module.
import { create } from "zustand";
import {
  getInitialConveneTheme,
  isConveneTheme,
} from "@/constants/conveneTheme";

export const initialEvents = [];

// Keeps the legacy store field stable while the product uses one unified visual system.
const getInitialTheme = () => "convene";

export const useAppStore = create((set) => ({
  currentUser: null,
  token: null,
  sidebarExpanded: true,
  theme: getInitialTheme(),
  themePalette: getInitialConveneTheme(),
  role: "lead", // "lead" | "member"
  events: [],
  eventsHydrated: false,
  activeEvent: null,
  hasOnboarded: false,

  setUserSession: (user, token) => set({ currentUser: user, token }),
  clearSession: () => {
    localStorage.removeItem("convene_token");
    set({
      currentUser: null,
      token: null,
      events: [],
      eventsHydrated: false,
      activeEvent: null,
    });
  },
  setRole: (role) => set({ role }),
  setThemePalette: (themePalette) => {
    if (!isConveneTheme(themePalette)) return;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("convene_palette", themePalette);
      document.documentElement.dataset.convenePalette = themePalette;
    }
    set({ themePalette });
  },
  setActiveEvent: (event) =>
    set({
      activeEvent: event,
      role: event?.accessLevel === "lead" ? "lead" : "member",
    }),
  addEvent: (newEvent) =>
    set((state) => {
      const event = {
        ...newEvent,
        userRole: newEvent.userRole || "organizer",
        accessLevel: newEvent.accessLevel || "lead",
      };
      return {
        events: [event, ...state.events],
        eventsHydrated: true,
        activeEvent: event,
        role: event.accessLevel === "lead" ? "lead" : "member",
        hasOnboarded: true,
      };
    }),
  updateActiveEventStages: (stageId, newStatus) =>
    set((state) => {
      if (!state.activeEvent) return state;
      const updatedStages = state.activeEvent.stages.map((s) =>
        s.id === stageId ? { ...s, status: newStatus } : s,
      );
      const updatedActiveEvent = {
        ...state.activeEvent,
        stages: updatedStages,
      };
      const updatedEvents = state.events.map((e) =>
        e.id === state.activeEvent.id ? updatedActiveEvent : e,
      );
      return { activeEvent: updatedActiveEvent, events: updatedEvents };
    }),
  updateStageDetails: (stageId, updatedData) =>
    set((state) => {
      if (!state.activeEvent) return state;
      const updatedStages = state.activeEvent.stages.map((s) =>
        s.id === stageId ? { ...s, ...updatedData } : s,
      );
      const updatedActiveEvent = {
        ...state.activeEvent,
        stages: updatedStages,
      };
      const updatedEvents = state.events.map((e) =>
        e.id === state.activeEvent.id ? updatedActiveEvent : e,
      );
      return { activeEvent: updatedActiveEvent, events: updatedEvents };
    }),
  addStageToActiveEvent: (newStage) =>
    set((state) => {
      if (!state.activeEvent) return state;
      const updatedStages = [...state.activeEvent.stages, newStage];
      const updatedActiveEvent = {
        ...state.activeEvent,
        stages: updatedStages,
      };
      const updatedEvents = state.events.map((e) =>
        e.id === state.activeEvent.id ? updatedActiveEvent : e,
      );
      return { activeEvent: updatedActiveEvent, events: updatedEvents };
    }),
  deleteStageFromActiveEvent: (stageId) =>
    set((state) => {
      if (!state.activeEvent) return state;
      const updatedStages = state.activeEvent.stages.filter(
        (s) => s.id !== stageId,
      );
      const updatedActiveEvent = {
        ...state.activeEvent,
        stages: updatedStages,
      };
      const updatedEvents = state.events.map((e) =>
        e.id === state.activeEvent.id ? updatedActiveEvent : e,
      );
      return { activeEvent: updatedActiveEvent, events: updatedEvents };
    }),
  completeOnboarding: () => set({ hasOnboarded: true }),
  resetOnboarding: () => set({ hasOnboarded: false }),
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
  // Keeps old callers safe without allowing a second visual mode to return.
  toggleTheme: () => set({ theme: "convene" }),
}));
