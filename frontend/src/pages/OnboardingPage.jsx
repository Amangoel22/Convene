// Purpose: OnboardingPage implements the split-screen, theme-aware event onboarding journey.
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Globe,
  MapPin,
  Plus,
  Radio,
  Sparkles,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConveneMark } from "@/components/brand/ConveneMark";
import { useAppStore } from "@/store/useAppStore";
import { addHoursToTimeString, cn, formatTimeString } from "@/lib/utils";
import "@/styles/login.css";

const eventTypes = [
  "Hackathon",
  "Debate",
  "Conference / Symposium",
  "Cultural Fest",
  "Sports Tournament",
  "Workshop / Seminar",
];

const defaultStagesForType = {
  Hackathon: [
    {
      title: "Registration & Check-In",
      startTime: "08:00 AM",
      endTime: "09:30 AM",
      location: "Main Lobby",
      owner: "Registration Team",
      status: "Completed",
    },
    {
      title: "Opening Ceremony",
      startTime: "09:30 AM",
      endTime: "10:15 AM",
      location: "Main Auditorium",
      owner: "Operations Team",
      status: "Completed",
    },
    {
      title: "Hacking Round Launch",
      startTime: "10:15 AM",
      endTime: "03:00 PM",
      location: "Labs A–D",
      owner: "Technical Team",
      status: "Completed",
    },
    {
      title: "Mentoring & Project Review",
      startTime: "03:00 PM",
      endTime: "05:30 PM",
      location: "Labs A–D",
      owner: "Technical Team",
      status: "LIVE",
    },
    {
      title: "Judging & Final Demos",
      startTime: "05:30 PM",
      endTime: "07:30 PM",
      location: "Seminar Hall",
      owner: "Judging Team",
      status: "Upcoming",
    },
    {
      title: "Closing Ceremony & Awards",
      startTime: "07:30 PM",
      endTime: "08:30 PM",
      location: "Main Auditorium",
      owner: "Stage Team",
      status: "Upcoming",
    },
  ],
  Debate: [
    {
      title: "Debater Orientation & Motion Release",
      startTime: "09:00 AM",
      endTime: "10:00 AM",
      location: "Seminar Hall B",
      owner: "Debate Society Lead",
      status: "Completed",
    },
    {
      title: "Preliminary Rounds",
      startTime: "10:15 AM",
      endTime: "01:00 PM",
      location: "Rooms 101–108",
      owner: "Logistics Lead",
      status: "LIVE",
    },
    {
      title: "Quarter & Semi-Finals",
      startTime: "02:00 PM",
      endTime: "04:30 PM",
      location: "Rooms 101–104",
      owner: "Adjudication Panel",
      status: "Upcoming",
    },
    {
      title: "Grand Finals & Valedictory",
      startTime: "05:00 PM",
      endTime: "06:30 PM",
      location: "Main Auditorium",
      owner: "Stage Team",
      status: "Upcoming",
    },
  ],
  "Conference / Symposium": [
    {
      title: "Delegate Arrival & Kit Distribution",
      startTime: "08:30 AM",
      endTime: "09:30 AM",
      location: "Reception Foyer",
      owner: "Hospitality Lead",
      status: "Completed",
    },
    {
      title: "Inaugural Keynote Address",
      startTime: "09:45 AM",
      endTime: "11:00 AM",
      location: "Plenary Hall",
      owner: "Stage Lead",
      status: "LIVE",
    },
    {
      title: "Panel Sessions & Paper Tracks",
      startTime: "11:30 AM",
      endTime: "01:30 PM",
      location: "Halls A, B & C",
      owner: "Academic Coordination",
      status: "Upcoming",
    },
    {
      title: "Fireside Chat & Networking Luncheon",
      startTime: "01:30 PM",
      endTime: "03:00 PM",
      location: "Dining Pavilion",
      owner: "Logistics Team",
      status: "Upcoming",
    },
  ],
  "Cultural Fest": [
    {
      title: "Campus Gates Open & Crowd Screening",
      startTime: "10:00 AM",
      endTime: "11:30 AM",
      location: "Entry Gate 1 & 2",
      owner: "Security & Discipline Lead",
      status: "Completed",
    },
    {
      title: "Acoustic & Battle of the Bands",
      startTime: "12:00 PM",
      endTime: "03:30 PM",
      location: "Open Air Theatre",
      owner: "Music Society",
      status: "LIVE",
    },
    {
      title: "Street Play & Theatrics Circuit",
      startTime: "03:30 PM",
      endTime: "05:30 PM",
      location: "Central Courtyard",
      owner: "Drama Society",
      status: "Upcoming",
    },
    {
      title: "Celebrity Pro-Night & DJ Finale",
      startTime: "06:30 PM",
      endTime: "10:00 PM",
      location: "Main Stadium",
      owner: "Festival Conveners",
      status: "Upcoming",
    },
  ],
  "Sports Tournament": [
    {
      title: "Team Roll Call & Referee Briefing",
      startTime: "07:30 AM",
      endTime: "08:15 AM",
      location: "Sports Complex Office",
      owner: "Sports Secretary",
      status: "Completed",
    },
    {
      title: "League Stage Fixtures",
      startTime: "08:30 AM",
      endTime: "01:00 PM",
      location: "Courts 1–4",
      owner: "Ground In-Charge",
      status: "LIVE",
    },
    {
      title: "Semi-Final Clashes",
      startTime: "02:30 PM",
      endTime: "04:30 PM",
      location: "Main Arena",
      owner: "Match Officials",
      status: "Upcoming",
    },
    {
      title: "Championship Finals & Trophy Presentation",
      startTime: "05:00 PM",
      endTime: "06:30 PM",
      location: "Main Arena",
      owner: "Dignitaries Desk",
      status: "Upcoming",
    },
  ],
  "Workshop / Seminar": [
    {
      title: "Attendee Check-in & Environment Setup",
      startTime: "09:30 AM",
      endTime: "10:00 AM",
      location: "Computer Centre 2",
      owner: "Lab Coordinator",
      status: "Completed",
    },
    {
      title: "Module 1: Foundations & Architecture",
      startTime: "10:00 AM",
      endTime: "12:30 PM",
      location: "Computer Centre 2",
      owner: "Speaker / Trainer",
      status: "LIVE",
    },
    {
      title: "Hands-on Lab & Guided Coding",
      startTime: "01:30 PM",
      endTime: "04:00 PM",
      location: "Computer Centre 2",
      owner: "Teaching Assistants",
      status: "Upcoming",
    },
    {
      title: "Q&A, Capstone Review & Certificate Dispatch",
      startTime: "04:00 PM",
      endTime: "05:00 PM",
      location: "Computer Centre 2",
      owner: "Program Manager",
      status: "Upcoming",
    },
  ],
};

function getApiBase() {
  const configuredUrl =
    import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000/api";
  const normalizedUrl = configuredUrl.replace(/\/+$/, "");
  return normalizedUrl.endsWith("/api")
    ? normalizedUrl
    : `${normalizedUrl}/api`;
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const events = useAppStore((state) => state.events);
  const addEvent = useAppStore((state) => state.addEvent);
  const setActiveEvent = useAppStore((state) => state.setActiveEvent);
  const setRole = useAppStore((state) => state.setRole);
  const themePalette = useAppStore((state) => state.themePalette);

  // Synchronize theme palette dynamically
  useEffect(() => {
    document.documentElement.dataset.theme = "convene";
    document.documentElement.dataset.convenePalette = themePalette;
  }, [themePalette]);

  // Steps: 1 = Path Selection, 2 = Event Details / Existing Selection, 3 = Schedule & Timeline
  const [step, setStep] = useState(1);
  const [setupMode, setSetupMode] = useState("new"); // "new" | "existing"

  // Step 2 Form States
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState(eventTypes[0]);
  const [eventDate, setEventDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [location, setLocation] = useState("");

  // Step 3 Timing & Timeline Matrix
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endTime, setEndTime] = useState("05:00 PM");
  const [duration, setDuration] = useState("8 Hours");

  // Stages Timeline List
  const [stagesList, setStagesList] = useState([]);
  const [stageTitle, setStageTitle] = useState("");
  const [stageStart, setStageStart] = useState("09:00 AM");
  const [stageEnd, setStageEnd] = useState("10:00 AM");
  const [stageVenue, setStageVenue] = useState("Main Hall");

  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState(null);

  const API_BASE = getApiBase();

  // Dynamically calculate duration from timings
  useEffect(() => {
    if (!startDate || !endDate || !startTime || !endTime) return;
    const startObj = new Date(`${startDate} ${startTime}`);
    const endObj = new Date(`${endDate} ${endTime}`);
    if (Number.isNaN(startObj.getTime()) || Number.isNaN(endObj.getTime()))
      return;

    const diffMs = endObj - startObj;
    if (diffMs <= 0) {
      setDuration("Invalid Time Range");
      return;
    }

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const totalHours = (diffMs / (1000 * 60 * 60)).toFixed(1);
    const days = Math.floor(totalMinutes / (60 * 24));
    const remHours = Math.floor((totalMinutes % (60 * 24)) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days} Day${days > 1 ? "s" : ""}`);
    if (remHours > 0) parts.push(`${remHours} Hr${remHours > 1 ? "s" : ""}`);
    const formattedDuration =
      parts.length > 0
        ? `${parts.join(" ")} (${totalHours} Hours Total)`
        : `${totalHours} Hours`;
    setDuration(formattedDuration);
  }, [startDate, startTime, endDate, endTime]);

  const handleSelectPath = (mode) => {
    setSetupMode(mode);
    setStep(2);
  };

  const handleSelectExistingEvent = (event) => {
    setActiveEvent(event);
    setRole(event.accessLevel === "lead" ? "lead" : "member");
    navigate("/dashboard");
  };

  const handleProceedToSchedule = (e) => {
    e.preventDefault();
    if (!eventName.trim()) return;

    if (eventDate) {
      setStartDate(eventDate);
      setEndDate(eventDate);
    }

    // Populate default stages template if empty
    if (stagesList.length === 0 && defaultStagesForType[eventType]) {
      const template = defaultStagesForType[eventType].map((stg, i) => ({
        id: `stg-${Date.now()}-${i}`,
        order: i + 1,
        title: stg.title,
        timeWindow: `${stg.startTime} – ${stg.endTime}`,
        timeDisplay: stg.startTime,
        location: stg.location || location.trim() || "Main Venue",
        owner: stg.owner || "Organizing Team",
        status: stg.status || "Upcoming",
        description: `${stg.title} at ${stg.location}.`,
      }));
      setStagesList(template);
    }

    setStep(3);
  };

  const handleAddStage = () => {
    if (!stageTitle.trim()) return;

    const formattedStart = formatTimeString(stageStart) || "09:00 AM";
    const formattedEnd = formatTimeString(stageEnd) || "10:00 AM";

    const newStageObj = {
      id: `stg-${Date.now()}`,
      order: stagesList.length + 1,
      title: stageTitle.trim(),
      timeWindow: `${formattedStart} – ${formattedEnd}`,
      timeDisplay: formattedStart,
      location: stageVenue.trim() || location || "Main Venue",
      owner: "Organizing Team",
      status: stagesList.length === 0 ? "LIVE" : "Upcoming",
      description: `${stageTitle.trim()} at ${stageVenue.trim() || location}.`,
    };
    setStagesList([...stagesList, newStageObj]);
    setStageTitle("");
    setStageVenue("");
    setStageStart(formattedEnd);
    setStageEnd(addHoursToTimeString(formattedEnd, 1));
  };

  const handleRemoveStage = (id) => {
    setStagesList(
      stagesList
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order: i + 1 })),
    );
  };

  const handleFinalLaunch = async (e) => {
    e.preventDefault();
    setLaunchError(null);
    setIsLaunching(true);

    const token = localStorage.getItem("convene_token");
    if (!token) {
      setLaunchError(
        "You are not logged in. Please refresh and sign in again.",
      );
      setIsLaunching(false);
      return;
    }

    const payload = {
      name: eventName.trim(),
      type: eventType,
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || startDate || new Date().toISOString().split("T")[0],
      startTime,
      endTime,
      durationDisplay: duration || "24 Hours",
      primaryLocation: location.trim() || undefined,
      stages: stagesList,
    };

    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg =
          errData.error ||
          errData.message ||
          `Server error (${res.status}). Please try again.`;
        setLaunchError(msg);
        setIsLaunching(false);
        return;
      }

      const data = await res.json();
      const createdDbEvent = {
        ...data.event,
        role: "Organizing Team Lead",
        duration: data.event.durationDisplay || duration || "24 Hours",
        location: data.event.primaryLocation || location.trim(),
        stages: data.event.stages || stagesList,
      };
      addEvent(createdDbEvent);
      setActiveEvent(createdDbEvent);
      setRole("lead");
      navigate("/dashboard");
    } catch {
      setLaunchError(
        "Could not reach the server. Please check your connection and try again.",
      );
      setIsLaunching(false);
    }
  };

  return (
    <main className="login-layout min-h-screen w-full bg-token-page">
      {/* Left Column: Brand Story & Live Step Telemetry */}
      <section className="login-story" aria-label="About Convene Onboarding">
        <div className="w-full relative z-10">
          <a className="login-story-brand" href="/" aria-label="Convene home">
            <span>
              <ConveneMark size={20} />
            </span>{" "}
            convene
          </a>
        </div>

        <div className="login-story-copy">
          <p className="login-story-eyebrow">WORKSPACE ONBOARDING</p>
          <h1>
            Set up your
            <br />
            <span>command center.</span>
          </h1>
          <p>
            Configure your event timeline, establish venues, and align your crew
            before live event day begins.
          </p>

          <div className="login-story-preview" aria-hidden="true">
            <div className="login-preview-heading">
              <span className="login-preview-mark">
                <Sparkles size={14} />
              </span>
              <span>
                <b>Setup progression</b>
                <small>
                  {step === 1 && "Mode & Role Selection"}
                  {step === 2 && setupMode === "new" && "Event Identity & Venue"}
                  {step === 2 && setupMode === "existing" && "Event Association"}
                  {step === 3 && "Run of Show & Stages"}
                </small>
              </span>
              <i>STEP {step} OF 3</i>
            </div>

            <div className="login-preview-track">
              <span className={step >= 1 ? "is-done" : "is-current"}>
                {step > 1 ? "✓" : "1"}
              </span>
              <i style={{ background: step >= 2 ? "var(--color-success)" : undefined }} />
              <span className={step >= 2 ? (step > 2 ? "is-done" : "is-current") : ""}>
                {step > 2 ? "✓" : step === 2 ? <b /> : "2"}
              </span>
              <i style={{ background: step >= 3 ? "var(--color-success)" : undefined }} />
              <span className={step === 3 ? "is-current" : ""}>
                {step === 3 ? <b /> : "3"}
              </span>
            </div>

            <div className="login-preview-labels">
              <span>Path</span>
              <span>Details</span>
              <span>Schedule</span>
            </div>

            <div className="login-preview-update">
              <span>✓</span>
              <b>
                {step === 1 && "Ready to initialize"}
                {step === 2 && (eventName ? eventName : "Entering event specs")}
                {step === 3 && `${stagesList.length} Stages configured`}
              </b>
              <small>Live event synchronization</small>
            </div>
          </div>
        </div>

        <p className="login-story-foot">
          One workspace for the people behind a great event.
        </p>
      </section>

      {/* Right Column: Interactive Form & Guided Step Wizard */}
      <section className="login-form-side" aria-label="Event Onboarding Wizard">
        <div className="w-full max-w-xl rounded-3xl surface-card-token border border-token p-7 sm:p-9 shadow-token-elevated relative overflow-hidden">
          {/* Step Progress Indicators */}
          <div className="mb-7 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    step === s
                      ? "w-8 bg-token-accent"
                      : s < step
                        ? "w-2.5 bg-token-success"
                        : "w-2 hover-token",
                  )}
                />
              ))}
            </div>
            <span className="type-xs weight-bold text-token-muted">
              Step {step} of 3
            </span>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Choose Setup Path (New vs Existing) */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="type-2xl weight-bold tracking-tight text-token-primary">
                    Welcome to Convene
                  </h2>
                  <p className="mt-1.5 type-sm weight-medium text-token-secondary">
                    Choose how you would like to set up your event workspace.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <div
                    onClick={() => handleSelectPath("new")}
                    className="group cursor-pointer rounded-2xl border border-token surface-token p-6 transition-all hover:border-token-accent hover:surface-card-token hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl accent-surface-token text-token-accent group-hover:bg-token-accent group-hover:text-token-inverse transition-colors">
                      <Plus size={24} strokeWidth={2.5} />
                    </div>
                    <h3 className="mt-4 type-base weight-bold text-token-primary">
                      Create New Event
                    </h3>
                    <p className="mt-1.5 type-xs weight-medium text-token-secondary leading-relaxed">
                      Set up an event from scratch, configure stages, and manage crew.
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 type-xs weight-bold text-token-accent">
                      <span>Start New Setup</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>

                  <div
                    onClick={() => handleSelectPath("existing")}
                    className="group cursor-pointer rounded-2xl border border-token surface-token p-6 transition-all hover:border-token-accent hover:surface-card-token hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl accent-surface-token text-token-accent group-hover:bg-token-accent group-hover:text-token-inverse transition-colors">
                      <Globe size={24} strokeWidth={2.5} />
                    </div>
                    <h3 className="mt-4 type-base weight-bold text-token-primary">
                      Join Existing Event
                    </h3>
                    <p className="mt-1.5 type-xs weight-medium text-token-secondary leading-relaxed">
                      Access an event you have been assigned to or invited to join.
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 type-xs weight-bold text-token-accent">
                      <span>Select Assigned Event</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Basic Event Info OR Existing Event Selection */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full field-token text-token-secondary hover:hover-token hover:text-token-primary transition-colors"
                    aria-label="Back"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div>
                    <h2 className="type-2xl weight-bold tracking-tight text-token-primary">
                      {setupMode === "existing"
                        ? "Select Your Event"
                        : "Basic Event Details"}
                    </h2>
                    <p className="type-xs weight-medium text-token-secondary">
                      {setupMode === "existing"
                        ? "Choose an event below to open your crew dashboard."
                        : "Enter primary event identification details."}
                    </p>
                  </div>
                </div>

                {setupMode === "existing" ? (
                  <div className="space-y-3 pt-2">
                    {events.length > 0 ? (
                      events.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => handleSelectExistingEvent(evt)}
                          className="group flex items-center justify-between rounded-2xl border border-token surface-token p-4 transition-all hover:border-token-accent hover:surface-card-token hover:shadow-sm cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-surface-token text-token-accent">
                              <Sparkles size={18} />
                            </div>
                            <div>
                              <h4 className="type-sm weight-bold text-token-primary">
                                {evt.name}
                              </h4>
                              <p className="type-xs weight-medium text-token-secondary">
                                {evt.type} • {evt.duration || "Live"} •{" "}
                                <span className="text-token-accent weight-semibold">
                                  {evt.role || "Organizer"}
                                </span>
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            size={18}
                            className="text-token-muted group-hover:text-token-accent transition-colors"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-token surface-token p-6 text-center space-y-3">
                        <p className="type-sm text-token-secondary">
                          No existing events linked to your account yet.
                        </p>
                        <button
                          type="button"
                          onClick={() => setSetupMode("new")}
                          className="inline-flex items-center gap-2 rounded-full bg-token-accent px-4 py-2 type-xs weight-bold text-token-inverse hover:bg-token-accent-dark transition-colors"
                        >
                          <Plus size={14} />
                          <span>Create a New Event Instead</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleProceedToSchedule} className="space-y-4 pt-2">
                    <div>
                      <label className="type-xs weight-bold text-token-primary">
                        Event Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Annual Tech Symposium 2026"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        className="mt-1 h-11 w-full rounded-xl field-token border border-token px-3.5 type-sm weight-medium text-token-primary outline-none focus:border-token-accent transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="type-xs weight-bold text-token-primary">
                          Event Category
                        </label>
                        <select
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value)}
                          className="mt-1 h-11 w-full rounded-xl field-token border border-token px-3 type-sm weight-medium text-token-primary outline-none focus:border-token-accent transition-colors"
                        >
                          {eventTypes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="type-xs weight-bold text-token-primary">
                          Event Date
                        </label>
                        <div className="relative mt-1">
                          <input
                            type="date"
                            required
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="h-11 w-full rounded-xl field-token border border-token px-3.5 type-sm weight-medium text-token-primary outline-none focus:border-token-accent transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="type-xs weight-bold text-token-primary">
                        Primary Venue / Campus Location
                      </label>
                      <div className="relative mt-1">
                        <MapPin
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-token-muted pointer-events-none"
                        />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Main Auditorium & Innovation Hub"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="h-11 w-full rounded-xl field-token border border-token pl-10 pr-3.5 type-sm weight-medium text-token-primary outline-none focus:border-token-accent transition-colors"
                        />
                      </div>
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        className="w-full flex h-11 items-center justify-center gap-2 rounded-full bg-token-accent type-xs weight-bold text-token-inverse hover:bg-token-accent-dark shadow-md transition-colors"
                      >
                        <span>Continue to Schedule & Timeline</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {/* STEP 3: Timings, Duration, Location & Event Timeline Stages Configuration */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex h-9 w-9 items-center justify-center rounded-full field-token text-token-secondary hover:hover-token hover:text-token-primary transition-colors"
                    aria-label="Back"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div>
                    <h2 className="type-2xl weight-bold tracking-tight text-token-primary">
                      Timeline & Run of Show
                    </h2>
                    <p className="type-xs weight-medium text-token-secondary">
                      Configure operating hours and schedule stages for {eventName}.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleFinalLaunch} className="space-y-5 pt-1">
                  {/* Date & Time Picker Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Start Date & Time */}
                    <div className="space-y-2 rounded-2xl surface-token border border-subtle-token p-3.5">
                      <span className="type-11 weight-bold uppercase tracking-wider text-token-accent">
                        Start Date & Time
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="type-10 weight-bold text-token-muted">
                            Date
                          </label>
                          <input
                            type="date"
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="mt-0.5 h-9 w-full rounded-xl surface-card-token border border-token px-2 type-xs weight-semibold text-token-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="type-10 weight-bold text-token-muted">
                            Time
                          </label>
                          <input
                            type="text"
                            required
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            placeholder="09:00 AM"
                            className="mt-0.5 h-9 w-full rounded-xl surface-card-token border border-token px-2 type-xs weight-semibold text-token-primary outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* End Date & Time */}
                    <div className="space-y-2 rounded-2xl surface-token border border-subtle-token p-3.5">
                      <span className="type-11 weight-bold uppercase tracking-wider text-token-warning">
                        End Date & Time
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="type-10 weight-bold text-token-muted">
                            Date
                          </label>
                          <input
                            type="date"
                            required
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="mt-0.5 h-9 w-full rounded-xl surface-card-token border border-token px-2 type-xs weight-semibold text-token-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="type-10 weight-bold text-token-muted">
                            Time
                          </label>
                          <input
                            type="text"
                            required
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            placeholder="05:00 PM"
                            className="mt-0.5 h-9 w-full rounded-xl surface-card-token border border-token px-2 type-xs weight-semibold text-token-primary outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calculated Duration Banner */}
                  <div className="flex items-center justify-between rounded-2xl accent-surface-token border border-token-accent/20 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-token-accent" />
                      <span className="type-xs weight-bold text-token-primary">
                        Calculated Duration:
                      </span>
                    </div>
                    <span className="type-xs weight-extrabold text-token-accent font-mono surface-card-token px-3 py-1 rounded-full shadow-sm">
                      {duration}
                    </span>
                  </div>

                  {/* Event Timeline Stages Builder */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="type-xs weight-bold text-token-primary">
                        Run of Show Stages ({stagesList.length})
                      </label>
                      <span className="type-11 weight-medium text-token-muted">
                        Live stages for dashboard & run of show
                      </span>
                    </div>

                    {/* Configured Stages List */}
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {stagesList.map((stg) => (
                        <div
                          key={stg.id}
                          className="flex items-center justify-between rounded-2xl surface-token border border-subtle-token px-3 py-2 type-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full accent-surface-token font-mono type-10 weight-bold text-token-accent">
                              {stg.order}
                            </span>
                            <div className="min-w-0">
                              <p className="weight-bold text-token-primary truncate">
                                {stg.title}
                              </p>
                              <p className="type-10 weight-medium text-token-secondary truncate">
                                {stg.timeWindow} •{" "}
                                <span className="text-token-accent weight-semibold">
                                  {stg.location}
                                </span>
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveStage(stg.id)}
                            className="text-token-muted hover:text-token-error transition-colors p-1 shrink-0"
                            aria-label="Remove stage"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Stage Inline Inputs */}
                    <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Stage Title (e.g. Keynote)"
                        value={stageTitle}
                        onChange={(e) => setStageTitle(e.target.value)}
                        className="h-9 sm:col-span-4 rounded-xl field-token border border-token px-3 type-xs weight-medium text-token-primary outline-none focus:border-token-accent"
                      />
                      <input
                        type="text"
                        placeholder="Venue (e.g. Hall A)"
                        value={stageVenue}
                        onChange={(e) => setStageVenue(e.target.value)}
                        className="h-9 sm:col-span-3 rounded-xl field-token border border-token px-3 type-xs weight-medium text-token-primary outline-none focus:border-token-accent"
                      />
                      <input
                        type="text"
                        placeholder="09:00 AM"
                        value={stageStart}
                        onChange={(e) => setStageStart(e.target.value)}
                        className="h-9 sm:col-span-2 rounded-xl field-token border border-token px-2.5 type-xs weight-medium text-token-primary outline-none focus:border-token-accent"
                      />
                      <input
                        type="text"
                        placeholder="10:00 AM"
                        value={stageEnd}
                        onChange={(e) => setStageEnd(e.target.value)}
                        className="h-9 sm:col-span-2 rounded-xl field-token border border-token px-2.5 type-xs weight-medium text-token-primary outline-none focus:border-token-accent"
                      />
                      <button
                        type="button"
                        onClick={handleAddStage}
                        className="h-9 sm:col-span-1 flex items-center justify-center rounded-xl accent-surface-token text-token-accent type-xs weight-bold hover:bg-token-accent hover:text-token-inverse transition-colors"
                        title="Add Stage"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 space-y-3">
                    {launchError && (
                      <div className="flex items-start gap-3 rounded-2xl error-surface-token border border-token-error-light px-4 py-3">
                        <Zap size={16} className="text-token-error mt-0.5 shrink-0" />
                        <p className="type-xs weight-semibold text-token-error leading-relaxed">
                          {launchError}
                        </p>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={isLaunching}
                      className="w-full flex h-11 items-center justify-center gap-2 rounded-full bg-token-accent type-xs weight-bold text-token-inverse hover:bg-token-accent-dark shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLaunching ? (
                        <>
                          <Radio size={16} className="animate-pulse" />
                          <span>Creating Event Command Center…</span>
                        </>
                      ) : (
                        <>
                          <span>Build Working Dashboard</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
