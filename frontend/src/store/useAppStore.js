import { create } from "zustand";
import { initialStages } from "@/data/runOfShow";

export const initialEvents = [
  {
    id: "evt-1",
    name: "HackFest 2026",
    type: "Hackathon",
    date: "2026-08-15",
    startTime: "08:00 AM",
    endTime: "08:00 PM",
    duration: "12 Hours",
    location: "Main Campus Auditorium & Labs A–D",
    role: "Organizing Team Lead",
    stages: initialStages
  },
  {
    id: "evt-2",
    name: "Inter-College Debate Championship",
    type: "Debate",
    date: "2026-09-02",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    duration: "8 Hours",
    location: "Seminar Hall B & Open Amphitheatre",
    role: "Organizing Team Lead",
    stages: [
      { id: "stg-d1", order: 1, title: "Debater Orientation & Motion Release", timeWindow: "09:00 AM – 10:00 AM", timeDisplay: "09:00 AM", location: "Seminar Hall B", owner: "Debate Society Lead", status: "Completed", description: "Motion announcements & rulebook distribution.", milestones: [{ label: "Distribute motion papers", completed: true }] },
      { id: "stg-d2", order: 2, title: "Preliminary Rounds", timeWindow: "10:15 AM – 01:00 PM", timeDisplay: "10:15 AM", location: "Rooms 101–108", owner: "Logistics Lead", status: "LIVE", description: "3 concurrent debating streams.", milestones: [{ label: "Confirm judge scoring sheets", completed: false }] },
      { id: "stg-d3", order: 3, title: "Finals & Award Ceremony", timeWindow: "02:00 PM – 05:00 PM", timeDisplay: "02:00 PM", location: "Amphitheatre", owner: "Stage Lead", status: "Upcoming", description: "Grand finale debate and trophy distribution.", milestones: [{ label: "Setup stage audio", completed: false }] }
    ]
  }
];

export const useAppStore = create((set) => ({
  sidebarExpanded: true,
  theme: "light",
  role: "lead", // "lead" | "member"
  events: initialEvents,
  activeEvent: initialEvents[0],
  hasOnboarded: true,

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
