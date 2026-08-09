import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flag,
  Globe,
  MapPin,
  Plus,
  Radio,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

const eventTypes = [
  "Hackathon",
  "Debate",
  "Conference / Symposium",
  "Cultural Fest",
  "Sports Tournament",
  "Workshop / Seminar"
];

const defaultStagesForType = {
  Hackathon: [
    { title: "Registration & Check-In", startTime: "08:00 AM", endTime: "09:30 AM", location: "Main Lobby", owner: "Registration Team", status: "Completed" },
    { title: "Opening Ceremony", startTime: "09:30 AM", endTime: "10:15 AM", location: "Main Auditorium", owner: "Operations Team", status: "Completed" },
    { title: "Hacking Round Launch", startTime: "10:15 AM", endTime: "03:00 PM", location: "Labs A–D", owner: "Technical Team", status: "Completed" },
    { title: "Mentoring & Project Review", startTime: "03:00 PM", endTime: "05:30 PM", location: "Labs A–D", owner: "Technical Team", status: "LIVE" },
    { title: "Judging & Final Demos", startTime: "05:30 PM", endTime: "07:30 PM", location: "Seminar Hall", owner: "Judging Team", status: "Upcoming" },
    { title: "Closing Ceremony & Awards", startTime: "07:30 PM", endTime: "08:30 PM", location: "Main Auditorium", owner: "Stage Team", status: "Upcoming" }
  ],
  Debate: [
    { title: "Debater Orientation & Motion Release", startTime: "09:00 AM", endTime: "10:00 AM", location: "Seminar Hall B", owner: "Debate Society Lead", status: "Completed" },
    { title: "Preliminary Rounds", startTime: "10:15 AM", endTime: "01:00 PM", location: "Rooms 101–108", owner: "Logistics Lead", status: "LIVE" },
    { title: "Lunch Break & Tabulation", startTime: "01:00 PM", endTime: "02:00 PM", location: "Cafeteria", owner: "Hospitality Lead", status: "Upcoming" },
    { title: "Grand Final Debate & Awards", startTime: "02:00 PM", endTime: "05:00 PM", location: "Open Amphitheatre", owner: "Stage Lead", status: "Upcoming" }
  ],
  Default: [
    { title: "Registration & Welcome", startTime: "09:00 AM", endTime: "10:00 AM", location: "Lobby", owner: "Host Team", status: "Completed" },
    { title: "Keynote & Main Session", startTime: "10:00 AM", endTime: "01:00 PM", location: "Main Hall", owner: "Stage Team", status: "LIVE" },
    { title: "Networking & Valedictory", startTime: "02:00 PM", endTime: "04:30 PM", location: "Auditorium", owner: "Host Team", status: "Upcoming" }
  ]
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const { events, setActiveEvent, addEvent, setRole } = useAppStore();

  // Step state: 1 = Role, 2 = Action, 3 = Basic Details / Select, 4 = Advanced Setup (Timeline, Timings, Duration, Location)
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("organizer");
  const [eventTypeChoice, setEventTypeChoice] = useState("existing");

  // Event Basic State
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("Hackathon");
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);

  // Advanced Setup State (Step 4) - Supports Multi-day (e.g. 24h, 36h, 48h hackathons)
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [endTime, setEndTime] = useState("21:00");
  const [duration, setDuration] = useState("12 Hours");
  const [location, setLocation] = useState("Main Auditorium & Labs A–D");

  // Auto-calculate event duration dynamically from Start & End Date/Time
  useEffect(() => {
    if (!startDate || !startTime || !endDate || !endTime) return;

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0 || isNaN(diffMs)) {
      setDuration("Invalid Date/Time");
      return;
    }

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(totalHours / 24);
    const remHours = totalHours % 24;

    let parts = [];
    if (days > 0) parts.push(`${days} Day${days > 1 ? "s" : ""}`);
    if (remHours > 0) parts.push(`${remHours} Hr${remHours > 1 ? "s" : ""}`);
    if (totalMinutes > 0) parts.push(`${totalMinutes} Min${totalMinutes > 1 ? "s" : ""}`);

    const formattedDuration = parts.length > 0 ? `${parts.join(" ")} (${totalHours} Hours Total)` : `${totalHours} Hours`;
    setDuration(formattedDuration);
  }, [startDate, startTime, endDate, endTime]);

  // Stages Timeline List
  const [stagesList, setStagesList] = useState([]);

  // New Stage Inline Entry State
  const [stageTitle, setStageTitle] = useState("");
  const [stageStart, setStageStart] = useState("09:00 AM");
  const [stageEnd, setStageEnd] = useState("10:00 AM");
  const [stageVenue, setStageVenue] = useState("Main Hall");

  const handleSelectUserType = (type) => {
    setUserType(type);
    if (type === "organizer") {
      setStep(2);
    } else {
      // Participant route -> redirect directly to dashboard as member
      setRole("member");
      navigate("/dashboard");
    }
  };

  const handleSelectEventChoice = (choice) => {
    setEventTypeChoice(choice);
    setStep(3);
  };

  const handleSelectExistingEvent = (event) => {
    setActiveEvent(event);
    setRole("member");
    navigate("/dashboard");
  };

  const handleProceedToAdvancedSetup = (e) => {
    e.preventDefault();
    if (!eventName.trim()) return;

    // Load default template timeline stages based on selected event type
    const template = defaultStagesForType[eventType] || defaultStagesForType.Default;
    const initialFormattedStages = template.map((stg, idx) => ({
      id: `stg-${Date.now()}-${idx}`,
      order: idx + 1,
      title: stg.title,
      timeWindow: `${stg.startTime} – ${stg.endTime}`,
      timeDisplay: stg.startTime,
      location: stg.location,
      owner: stg.owner,
      status: stg.status,
      description: `${stg.title} scheduled at ${stg.location}.`,
      milestones: [{ label: `Initialize ${stg.title}`, completed: stg.status === "Completed" }]
    }));

    setStagesList(initialFormattedStages);
    setStep(4);
  };

  const handleAddStage = () => {
    if (!stageTitle.trim()) return;
    const newStageObj = {
      id: `stg-${Date.now()}`,
      order: stagesList.length + 1,
      title: stageTitle.trim(),
      timeWindow: `${stageStart} – ${stageEnd}`,
      timeDisplay: stageStart,
      location: stageVenue.trim() || location,
      owner: "Organizing Team",
      status: stagesList.length === 0 ? "LIVE" : "Upcoming",
      description: `${stageTitle.trim()} at ${stageVenue.trim() || location}.`,
      milestones: [{ label: `Start ${stageTitle.trim()}`, completed: false }]
    };
    setStagesList([...stagesList, newStageObj]);
    setStageTitle("");
  };

  const handleRemoveStage = (id) => {
    setStagesList(stagesList.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })));
  };

  const handleFinalLaunch = (e) => {
    e.preventDefault();

    const newEvent = {
      id: `evt-${Date.now()}`,
      name: eventName.trim(),
      type: eventType,
      date: startDate || new Date().toISOString().split("T")[0],
      startDate,
      endDate,
      startTime,
      endTime,
      duration: duration || "24 Hours",
      location: location || "Main Auditorium & Labs A–D",
      role: "Organizing Team Lead",
      stages: stagesList
    };

    addEvent(newEvent);
    setRole("lead");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-4 sm:p-6 text-[#1A1D23]">
      {/* Brand Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3B6FD4] text-white shadow-md">
          <Flag size={20} strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1D23]">Convene</h1>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-7 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] relative overflow-hidden">
        {/* Progress Bar */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  step === s ? "w-8 bg-[#3B6FD4]" : s < step ? "w-2 bg-[#22A65E]" : "w-2 bg-[#E8ECF1]"
                )}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-[#8E99A8]">Step {step} of 4</span>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Select User Role */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#1A1D23]">Welcome! How are you joining Convene?</h2>
                <p className="mt-1.5 text-sm font-medium text-[#5A6577]">Select your role to customize your workspace experience.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div onClick={() => handleSelectUserType("organizer")} className="group cursor-pointer rounded-2xl border border-[rgba(0,0,0,0.08)] bg-[#F7F8FA] p-6 transition-all hover:border-[#3B6FD4] hover:bg-white hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF0FA] text-[#3B6FD4] group-hover:bg-[#3B6FD4] group-hover:text-white">
                    <Users size={24} strokeWidth={2} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#1A1D23]">Organizing Team</h3>
                  <p className="mt-1 text-xs font-medium text-[#5A6577] leading-relaxed">Manage event tasks, team shifts, run of show, and hardware assets.</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#3B6FD4]">
                    <span>Continue as Organizer</span>
                    <ArrowRight size={14} />
                  </div>
                </div>

                <div onClick={() => handleSelectUserType("participant")} className="group cursor-pointer rounded-2xl border border-[rgba(0,0,0,0.08)] bg-[#F7F8FA] p-6 transition-all hover:border-[#3B6FD4] hover:bg-white hover:shadow-md opacity-80">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F2F5] text-[#5A6577] group-hover:bg-[#3B6FD4] group-hover:text-white">
                    <UserCheck size={24} strokeWidth={2} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#1A1D23]">Participant</h3>
                  <p className="mt-1 text-xs font-medium text-[#5A6577] leading-relaxed">View team schedules, submission deadlines, and event announcements.</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#8E99A8]">
                    <span>Participant Portal</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Select Existing vs New Event */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-center gap-2">
                <button onClick={() => setStep(1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23]">
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#1A1D23]">Organizing Team Setup</h2>
                  <p className="text-xs font-medium text-[#5A6577]">Are you setting up a new event or joining an existing team?</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div onClick={() => handleSelectEventChoice("existing")} className="group cursor-pointer rounded-2xl border border-[rgba(0,0,0,0.08)] bg-[#F7F8FA] p-6 transition-all hover:border-[#3B6FD4] hover:bg-white hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF0FA] text-[#3B6FD4] group-hover:bg-[#3B6FD4] group-hover:text-white">
                    <Globe size={24} strokeWidth={2} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#1A1D23]">Join Existing Event</h3>
                  <p className="mt-1 text-xs font-medium text-[#5A6577] leading-relaxed">View events you have been added to by your lead organizer.</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#3B6FD4]">
                    <span>Select Event</span>
                    <ArrowRight size={14} />
                  </div>
                </div>

                <div onClick={() => handleSelectEventChoice("new")} className="group cursor-pointer rounded-2xl border border-[rgba(0,0,0,0.08)] bg-[#F7F8FA] p-6 transition-all hover:border-[#3B6FD4] hover:bg-white hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF0FA] text-[#3B6FD4] group-hover:bg-[#3B6FD4] group-hover:text-white">
                    <Plus size={24} strokeWidth={2} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#1A1D23]">Create New Event</h3>
                  <p className="mt-1 text-xs font-medium text-[#5A6577] leading-relaxed">Set up a brand new event, configure timeline, timings, and location.</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#3B6FD4]">
                    <span>Start Event Setup</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Basic Event Info (Name, Type, Date) OR Existing Event Selection */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-center gap-2">
                <button onClick={() => setStep(2)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23]">
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#1A1D23]">
                    {eventTypeChoice === "existing" ? "Select Your Assigned Event" : "Basic Event Details"}
                  </h2>
                  <p className="text-xs font-medium text-[#5A6577]">
                    {eventTypeChoice === "existing"
                      ? "Choose an event below to open your team workspace dashboard."
                      : "Enter primary event identification details."}
                  </p>
                </div>
              </div>

              {eventTypeChoice === "existing" ? (
                <div className="space-y-3 pt-2">
                  {events.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => handleSelectExistingEvent(evt)}
                      className="group flex items-center justify-between rounded-2xl border border-[rgba(0,0,0,0.08)] bg-[#F7F8FA] p-4 transition-all hover:border-[#3B6FD4] hover:bg-white hover:shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF0FA] text-[#3B6FD4]">
                          <Sparkles size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#1A1D23]">{evt.name}</h4>
                          <p className="text-xs font-medium text-[#5A6577]">
                            {evt.type} • {evt.date} • <span className="text-[#3B6FD4] font-semibold">{evt.role}</span>
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#8E99A8] group-hover:text-[#3B6FD4] transition-colors" />
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleProceedToAdvancedSetup} className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-[#1A1D23]">Event Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Annual Tech Hackathon 2026"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-4 text-xs font-semibold text-[#1A1D23] outline-none focus:border-[#3B6FD4] placeholder:text-[#8E99A8]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#1A1D23]">Event Type</label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="mt-1.5 h-11 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none cursor-pointer"
                      >
                        {eventTypes.map((type) => (
                          <option key={type} value={type} className="bg-white text-[#1A1D23]">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#1A1D23]">Date of Event</label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="mt-1.5 h-11 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-4 text-xs font-semibold text-[#1A1D23] outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full flex h-11 items-center justify-center gap-2 rounded-full bg-[#3B6FD4] text-xs font-bold text-white hover:bg-[#2F5BB8] shadow-md transition-colors"
                    >
                      <span>Continue to Timeline & Location Setup</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {/* STEP 4: Timings, Duration, Location & Event Timeline Stages Configuration */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-center gap-2">
                <button onClick={() => setStep(3)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23]">
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#1A1D23]">Dashboard & Timeline Setup</h2>
                  <p className="text-xs font-medium text-[#5A6577]">Configure start/end timings, location, and run of show stages for {eventName}.</p>
                </div>
              </div>

              <form onSubmit={handleFinalLaunch} className="space-y-6 pt-1">
                {/* Date & Time Picker Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Start Date & Time */}
                  <div className="space-y-2 rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B6FD4]">Start Date & Time</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-[#8E99A8]">Start Date</label>
                        <input
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="mt-0.5 h-9 w-full rounded-xl bg-white border border-[rgba(0,0,0,0.08)] px-2.5 text-xs font-semibold text-[#1A1D23] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#8E99A8]">Start Time</label>
                        <input
                          type="time"
                          required
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="mt-0.5 h-9 w-full rounded-xl bg-white border border-[rgba(0,0,0,0.08)] px-2 text-xs font-semibold text-[#1A1D23] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* End Date & Time */}
                  <div className="space-y-2 rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4930E]">End Date & Time</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-[#8E99A8]">End Date</label>
                        <input
                          type="date"
                          required
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="mt-0.5 h-9 w-full rounded-xl bg-white border border-[rgba(0,0,0,0.08)] px-2.5 text-xs font-semibold text-[#1A1D23] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#8E99A8]">End Time</label>
                        <input
                          type="time"
                          required
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="mt-0.5 h-9 w-full rounded-xl bg-white border border-[rgba(0,0,0,0.08)] px-2 text-xs font-semibold text-[#1A1D23] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Auto-Calculated Duration Banner */}
                <div className="flex items-center justify-between rounded-2xl bg-[#EBF0FA] border border-[#3B6FD4]/20 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#3B6FD4]" />
                    <span className="text-xs font-bold text-[#1A1D23]">Total Calculated Event Duration:</span>
                  </div>
                  <span className="text-xs font-extrabold text-[#3B6FD4] font-mono bg-white px-3 py-1 rounded-full shadow-sm">
                    {duration}
                  </span>
                </div>

                {/* Event Timeline Stages Builder */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[#1A1D23]">Run of Show Stages & Locations ({stagesList.length})</label>
                    <span className="text-[11px] font-medium text-[#8E99A8]">Appears on Dashboard & Run of Show</span>
                  </div>

                  {/* Configured Stages List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {stagesList.map((stg) => (
                      <div key={stg.id} className="flex items-center justify-between rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] px-3.5 py-2.5 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EBF0FA] font-mono text-[11px] font-bold text-[#3B6FD4]">
                            {stg.order}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-[#1A1D23] truncate">{stg.title}</p>
                            <p className="text-[11px] font-medium text-[#5A6577] truncate">
                              {stg.timeWindow} • <span className="text-[#3B6FD4] font-semibold">{stg.location}</span>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStage(stg.id)}
                          className="text-[#8E99A8] hover:text-[#D6453D] transition-colors p-1 shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Stage Form Inline with Venue Location */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Stage Title (e.g. Keynote)"
                      value={stageTitle}
                      onChange={(e) => setStageTitle(e.target.value)}
                      className="h-9 sm:col-span-4 rounded-xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-medium text-[#1A1D23] outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Venue (e.g. Lab A)"
                      value={stageVenue}
                      onChange={(e) => setStageVenue(e.target.value)}
                      className="h-9 sm:col-span-3 rounded-xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-medium text-[#1A1D23] outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Start (09:00 AM)"
                      value={stageStart}
                      onChange={(e) => setStageStart(e.target.value)}
                      className="h-9 sm:col-span-2 rounded-xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-2.5 text-xs font-medium text-[#1A1D23] outline-none"
                    />
                    <input
                      type="text"
                      placeholder="End (10:00 AM)"
                      value={stageEnd}
                      onChange={(e) => setStageEnd(e.target.value)}
                      className="h-9 sm:col-span-2 rounded-xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-2.5 text-xs font-medium text-[#1A1D23] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddStage}
                      className="h-9 sm:col-span-1 flex items-center justify-center rounded-xl bg-[#EBF0FA] text-[#3B6FD4] text-xs font-bold hover:bg-[#3B6FD4] hover:text-white transition-colors"
                      title="Add Stage"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full flex h-11 items-center justify-center gap-2 rounded-full bg-[#3B6FD4] text-xs font-bold text-white hover:bg-[#2F5BB8] shadow-md transition-colors"
                  >
                    <span>Build Working Dashboard</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
