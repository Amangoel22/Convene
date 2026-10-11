// Purpose: RunOfShowPage implements this source module.
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit,
  FileDown,
  MapPin,
  Plus,
  Radio,
  Search,
  Sparkles,
  Users,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassModal } from "@/components/glass/GlassModal";
import { cn, formatTimeString, getStageStatus, isEventComplete, parseTimeString, addHoursToTimeString } from "@/lib/utils";

const statusStyles = {
  LIVE: "bg-[#22A65E]/10 text-[#22A65E]",
  Completed: "bg-[#22A65E]/10 text-[#22A65E]",
  Upcoming: "bg-[#EBF0FA] text-[#3B6FD4]"
};

function StatusBadge({ status = "Upcoming" }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide",
        statusStyles[status] ?? statusStyles.Upcoming
      )}
    >
      {status === "LIVE" ? (
        <>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22A65E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#22A65E]"></span>
          </span>
          LIVE
        </>
      ) : (
        status
      )}
    </span>
  );
}

function formatStageSchedule(stage) {
  const start = stage.startAt ? new Date(stage.startAt) : null;
  const end = stage.endAt ? new Date(stage.endAt) : null;
  if (!start || Number.isNaN(start.getTime())) return stage.timeWindow || "Schedule not set";

  const dateOptions = { day: "numeric", month: "short", year: "numeric" };
  const timeOptions = { hour: "numeric", minute: "2-digit" };
  const startDate = start.toLocaleDateString("en-IN", dateOptions);
  const endDate = end && !Number.isNaN(end.getTime()) ? end.toLocaleDateString("en-IN", dateOptions) : startDate;
  const dateRange = end && start.toDateString() !== end.toDateString() ? `${startDate} – ${endDate}` : startDate;
  const startTime = start.toLocaleTimeString("en-IN", timeOptions);
  const endTime = end && !Number.isNaN(end.getTime()) ? end.toLocaleTimeString("en-IN", timeOptions) : "—";
  return `${dateRange} | ${startTime} – ${endTime}`;
}

function SelectFilter({ value, onChange, options, label }) {
  return (
    <label className="filter-chip flex h-9 shrink-0 items-center rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] pl-3 text-xs font-semibold text-[#5A6577]">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent text-xs font-semibold text-[#1A1D23] outline-none pr-1"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-white text-[#1A1D23]">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

import { useAppStore } from "@/store/useAppStore";

function StageDrawer({ stage, onClose, onUpdateStatus }) {
  const navigate = useNavigate();
  const role = useAppStore((state) => state.role);
  const isLead = role === "lead";

  if (!stage) return null;

  const isLive = stage.status === "LIVE";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        className="fixed bottom-4 right-4 top-4 z-50 flex w-[min(540px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-7 shadow-xl text-[#1A1D23]"
        initial={{ x: 600, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 600, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(0,0,0,0.06)] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <StatusBadge status={stage.status} />
              <span className="text-xs font-bold text-[#8E99A8]">Stage {stage.order} of 6</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-[#1A1D23]">{stage.title}</h2>
          </div>
          <button
            className="flex h-9 w-9 min-h-0 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23]"
            onClick={onClose}
            aria-label="Close stage drawer"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3.5">
              <span className="text-[11px] font-semibold text-[#8E99A8] block">Time Window</span>
              <span className="text-xs font-bold text-[#1A1D23] block mt-1">{stage.timeWindow}</span>
            </div>
            <div className="rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3.5">
              <span className="text-[11px] font-semibold text-[#8E99A8] block">Location</span>
              <span className="text-xs font-bold text-[#1A1D23] block mt-1">{stage.location}</span>
            </div>
            <div className="rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3.5">
              <span className="text-[11px] font-semibold text-[#8E99A8] block">Lead Owner</span>
              <span className="text-xs font-bold text-[#1A1D23] block mt-1">{stage.owner}</span>
            </div>
            <div className="rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3.5">
              <span className="text-[11px] font-semibold text-[#8E99A8] block">Department</span>
              <span className="text-xs font-bold text-[#1A1D23] block mt-1">{stage.department}</span>
            </div>
          </div>

          {/* Key Checklist Milestones */}
          {stage.milestones && stage.milestones.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E99A8]">Stage Milestones</h3>
              <div className="mt-3 space-y-2">
                {stage.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3 text-xs font-medium text-[#1A1D23]">
                    <CheckCircle2 size={16} className={cn(m.completed ? "text-[#22A65E]" : "text-[#8E99A8]")} />
                    <span className={cn(m.completed && "line-through text-[#8E99A8]")}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Footer */}
        {isLead && (
          <div className="border-t border-[rgba(0,0,0,0.06)] pt-5 flex items-center gap-3">
            {isLive && (
              <GlassButton
                variant="secondary"
                icon={<Check size={16} />}
                onClick={() => onUpdateStatus(stage.id, "Completed")}
                className="flex-1 h-10 text-xs font-bold rounded-full"
              >
                Mark Completed
              </GlassButton>
            )}
          </div>
        )}
      </motion.aside>
    </AnimatePresence>
  );
}

function StageModal({ open, onClose, stage, onSave, lastStage }) {
  const [title, setTitle] = useState(stage ? stage.title : "");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState(stage ? stage.location : "");

  // Helper to format 24h or manual time string (e.g. 09:00, 2:30 pm) into 12h format (e.g. 02:30 PM)
  const format12h = (tStr) => {
    if (!tStr) return "";
    return formatTimeString(tStr);
  };

  // Convert 12h time string (e.g. "11:00 AM") to 24h format "11:00" for <input type="time" />
  const to24h = (tStr) => {
    const d = parseTimeString(tStr);
    if (!d) return "09:00";
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const toInputTime = (dateValue) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return null;
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  // Sync state if editing target stage changes or opening for new stage
  useEffect(() => {
    if (!open) return;

    if (stage) {
      setTitle(stage.title || "");
      setLocation(stage.location || "");
      const persistedStartTime = stage.startAt && toInputTime(stage.startAt);
      const persistedEndTime = stage.endAt && toInputTime(stage.endAt);
      if (persistedStartTime && persistedEndTime) {
        setStartTime(persistedStartTime);
        setEndTime(persistedEndTime);
      } else if (stage.timeWindow) {
        const parts = stage.timeWindow.split(/[–—-]/);
        setStartTime(to24h(parts[0]?.trim()));
        setEndTime(to24h(parts[1]?.trim()));
      }
    } else {
      // Adding new stage: clear title and location, auto-chain time from previous stage
      setTitle("");
      setLocation("");
      if (lastStage && lastStage.timeWindow) {
        const parts = lastStage.timeWindow.split(/[–—-]/);
        const lastEnd12h = parts[1]?.trim() || "10:00 AM";
        const nextStart24h = to24h(lastEnd12h);
        const nextEnd12h = addHoursToTimeString(lastEnd12h, 1);
        const nextEnd24h = to24h(nextEnd12h);
        setStartTime(nextStart24h);
        setEndTime(nextEnd24h);
      } else {
        setStartTime("09:00");
        setEndTime("10:00");
      }
    }
  }, [stage?.id, open, lastStage?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formattedWindow = `${format12h(startTime)} – ${format12h(endTime)}`;

    onSave({
      id: stage ? stage.id : `stg-${Date.now()}`,
      order: stage ? stage.order : 99,
      title: title.trim(),
      timeWindow: formattedWindow,
      location: location.trim() || "",
      status: stage ? stage.status : "Upcoming"
    });
    onClose();
  };

  return (
    <GlassModal open={open} onClose={onClose} title={stage ? "Edit Timeline Stage" : "Add Timeline Stage"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-[#8E99A8]">Stage Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Inauguration & Keynote Address"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 h-10 w-full rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-4 text-xs font-semibold text-[#1A1D23] outline-none placeholder:text-[#8E99A8]"
          />
        </div>

        {/* Time Selector Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#8E99A8]">Start Time</label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 h-9 w-full cursor-pointer rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-bold text-[#1A1D23] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8E99A8]">End Time</label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 h-9 w-full cursor-pointer rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-bold text-[#1A1D23] outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#8E99A8]">Venue</label>
            <input
              type="text"
              placeholder="e.g. Main Auditorium"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 h-9 w-full rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-2">
          <GlassButton type="button" onClick={onClose} className="h-9 text-xs rounded-full">
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" icon={<Check size={15} />} className="h-9 text-xs rounded-full">
            {stage ? "Save Changes" : "Create Stage"}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}

export function RunOfShowPage() {
  const eventsHydrated = useAppStore((state) => state.eventsHydrated);
  const activeEvent = useAppStore((state) => state.activeEvent);
  const updateActiveEventStages = useAppStore((state) => state.updateActiveEventStages);
  const updateStageDetails = useAppStore((state) => state.updateStageDetails);
  const addStageToActiveEvent = useAppStore((state) => state.addStageToActiveEvent);
  const role = useAppStore((state) => state.role);
  const isLead = role === "lead";

  const rawStages = activeEvent?.stages || [];
  const timelineLoading = !eventsHydrated;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [selectedStage, setSelectedStage] = useState(null);
  const [now, setNow] = useState(new Date());

  const eventIsComplete = isEventComplete(activeEvent, now);

  // Tick every second to evaluate live time window
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Edit / Create Stage Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState(null);

  // Evaluate stages dynamically based on current time window, preserving manual overrides
  const stages = useMemo(() => {
    return rawStages.map((s) => ({ ...s, status: eventIsComplete ? "Completed" : getStageStatus(s, now) }));
  }, [eventIsComplete, rawStages, now]);

  const filteredStages = useMemo(() => {
    const query = search.trim().toLowerCase();
    return stages.filter((stage) => {
      const matchesSearch =
        !query ||
        stage.title.toLowerCase().includes(query) ||
        (stage.location && stage.location.toLowerCase().includes(query));

      const matchesStatus = statusFilter === "All Statuses" || stage.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, stages]);

  const handleUpdateStatus = async (stageId, newStatus) => {
    updateActiveEventStages(stageId, newStatus);
    setSelectedStage((prev) => (prev ? { ...prev, status: newStatus } : null));

    const token = localStorage.getItem("convene_token");
    if (token && stageId && !stageId.startsWith("stg-")) {
      try {
        await fetch(`http://localhost:8000/api/stages/${stageId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (err) {
        console.warn("Backend status sync warning:", err.message);
      }
    }
  };

  const handleSaveStage = async (stageData) => {
    const token = localStorage.getItem("convene_token");

    if (editingStage) {
      updateStageDetails(stageData.id, stageData);
      if (token && stageData.id && !stageData.id.startsWith("stg-")) {
        try {
          await fetch(`http://localhost:8000/api/stages/${stageData.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              title: stageData.title,
              timeWindow: stageData.timeWindow,
              location: stageData.location
            })
          });
        } catch (err) {
          console.warn("Backend stage update warning:", err.message);
        }
      }
    } else {
      let createdStage = {
        ...stageData,
        order: stages.length + 1
      };

      if (token && activeEvent?.id) {
        try {
          const res = await fetch(`http://localhost:8000/api/events/${activeEvent.id}/stages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              title: stageData.title,
              timeWindow: stageData.timeWindow,
              location: stageData.location,
              stageOrder: stages.length + 1
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.stage) {
              createdStage = {
                ...createdStage,
                id: data.stage.id,
                order: data.stage.stageOrder
              };
            }
          }
        } catch (err) {
          console.warn("Backend stage create warning:", err.message);
        }
      }

      addStageToActiveEvent(createdStage);
    }

    setEditModalOpen(false);
    setEditingStage(null);
  };

  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1D23] md:text-3xl">Run of Show</h1>
          <p className="mt-2 text-sm font-bold text-[#1A1D23]">{activeEvent?.name || "Event"}</p>
          <p className="mt-1 text-xs font-semibold text-[#8E99A8]">
            {(() => {
              const startDate = activeEvent?.startDate ? new Date(activeEvent.startDate) : null;
              const endDate = activeEvent?.endDate ? new Date(activeEvent.endDate) : null;
              const dateOptions = { day: "numeric", month: "short", year: "numeric" };
              const startLabel = startDate ? startDate.toLocaleDateString("en-IN", dateOptions) : "Date not set";
              const endLabel = endDate ? endDate.toLocaleDateString("en-IN", dateOptions) : startLabel;
              const dateRange = startDate && endDate && startDate.toDateString() !== endDate.toDateString()
                ? `${startLabel} – ${endLabel}`
                : startLabel;
              return dateRange;
            })()}
            <span className="mx-2 text-[#C4CBD4]">|</span>
            {activeEvent?.startTime || "Start time not set"} – {activeEvent?.endTime || "End time not set"}
          </p>
          <p className="mt-1 text-sm text-[#5A6577] font-medium">Master timeline, stage handovers, and live event progression.</p>
        </div>
        <div className="flex items-center gap-3">
          {isLead && !eventIsComplete && (
            <GlassButton
              variant="primary"
              icon={<Plus size={16} strokeWidth={2} />}
              onClick={() => {
                setEditingStage(null);
                setEditModalOpen(true);
              }}
              className="rounded-full text-xs font-bold"
            >
              Add Stage
            </GlassButton>
          )}
          <GlassButton variant="secondary" icon={<FileDown size={16} strokeWidth={2} />} className="rounded-full text-xs">
            Export Schedule
          </GlassButton>
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-9 min-w-[240px] flex-1 items-center gap-2 rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-medium text-[#1A1D23] focus-within:ring-1 focus-within:ring-[#3B6FD4]">
          <Search size={15} strokeWidth={2} className="text-[#8E99A8] shrink-0" />
          <input
            type="text"
            placeholder="Search timeline stages, locations, leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-xs font-medium text-[#1A1D23] placeholder:text-[#8E99A8]"
            aria-label="Search run of show"
          />
        </div>
        <SelectFilter
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={["All Statuses", "LIVE", "Upcoming", "Completed"]}
        />
      </div>

      {/* Timeline stages list */}
      {!timelineLoading && eventIsComplete && (
        <div className="flex items-center gap-4 rounded-3xl border border-[#22A65E]/20 bg-gradient-to-r from-[#22A65E]/10 via-white to-[#EBF0FA] px-6 py-4 shadow-[0_4px_16px_rgba(34,166,94,0.08)]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#22A65E] text-white shadow-sm">
            <CheckCircle2 size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-extrabold text-[#1A1D23]">Event completed</p>
            <p className="mt-0.5 text-xs font-medium text-[#5A6577]">All timeline stages are complete. This schedule is now read-only.</p>
          </div>
        </div>
      )}
      {timelineLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : filteredStages.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No timeline stages configured"
          description="Create timeline stages to track live event progression, venues, and stage leads."
          actionLabel={isLead && activeEvent ? "Add Stage" : undefined}
          onAction={isLead && activeEvent ? () => { setEditingStage(null); setEditModalOpen(true); } : undefined}
        />
      ) : (
        <div className="relative space-y-4 md:before:absolute md:before:bottom-8 md:before:left-[2.75rem] md:before:top-8 md:before:w-px md:before:bg-[#22A65E]/20">
          {filteredStages.map((stg, idx) => {
            const isLive = stg.status === "LIVE";
            const displayIndex = String(stg.order || idx + 1).padStart(2, "0");

            return (
              <div
                key={stg.id}
                className={cn(
                  "group relative z-[1] flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
                  isLive
                    ? "bg-white border-[#3B6FD4]/40 ring-1 ring-[#3B6FD4]/20"
                    : stg.status === "Completed"
                      ? "bg-gradient-to-r from-[#F4FBF7] to-white border-[#22A65E]/20"
                    : "bg-white border-[rgba(0,0,0,0.08)]"
                )}
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-mono text-sm font-bold",
                      isLive ? "bg-[#EBF0FA] text-[#3B6FD4]" : stg.status === "Completed" ? "bg-[#22A65E] text-white" : "bg-[#F0F2F5] text-[#5A6577]"
                    )}
                  >
                    {stg.status === "Completed" ? <Check size={18} strokeWidth={3} /> : displayIndex}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-[#1A1D23] truncate">{stg.title}</h3>
                      <StatusBadge status={stg.status} />
                    </div>
                    <div className="mt-2.5 space-y-1.5 text-xs font-medium text-[#8E99A8]">
                      {stg.location && (
                        <span className="inline-flex items-center gap-1.5 font-mono font-bold text-[#3B6FD4]">
                          <MapPin size={13} className="text-[#3B6FD4]" /> {stg.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 font-mono font-bold text-[#3B6FD4]">
                        <Clock size={13} /> {formatStageSchedule(stg)}
                      </span>
                    </div>
                  </div>
                </div>

                {isLead && (
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {!eventIsComplete && stg.status !== "Completed" && (
                      <GlassButton
                        variant="secondary"
                        icon={<Edit size={14} />}
                        onClick={() => {
                          setEditingStage(stg);
                          setEditModalOpen(true);
                        }}
                        className="h-8 px-3 text-xs font-semibold rounded-full min-h-0 text-[#5A6577] hover:text-[#1A1D23]"
                      >
                        Edit Stage
                      </GlassButton>
                    )}
                    {isLive && (
                      <GlassButton
                        variant="secondary"
                        icon={<Check size={14} />}
                        onClick={() => handleUpdateStatus(stg.id, "Completed")}
                        className="h-8 px-3.5 text-xs font-bold rounded-full min-h-0 text-[#22A65E]"
                      >
                        Mark Completed
                      </GlassButton>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <StageDrawer
        stage={selectedStage}
        onClose={() => setSelectedStage(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Timeline Edit Modal */}
      <StageModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingStage(null);
        }}
        stage={editingStage}
        lastStage={stages.length > 0 ? stages[stages.length - 1] : null}
        onSave={handleSaveStage}
      />
    </div>
  );
}
