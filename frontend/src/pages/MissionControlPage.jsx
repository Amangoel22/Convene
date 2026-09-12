import { ArrowRight, AlertTriangle, Check, CheckSquare, Clock, MapPin, Square } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cn, parseTimeString } from "@/lib/utils";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAppStore } from "@/store/useAppStore";

const initialOrganizerDuties = [];
const initialOrganizerTasks = [];

export function MissionControlPage() {
  const activeEvent = useAppStore((state) => state.activeEvent);
  const currentUser = useAppStore((state) => state.currentUser);
  const [duties, setDuties] = useState(initialOrganizerDuties);
  const [tasks, setTasks] = useState(initialOrganizerTasks);
  const [hasUrgentIssue] = useState(false);
  const [now, setNow] = useState(new Date());

  // Tick every second to update current time
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Derive dynamic stage rail from activeEvent or empty array
  const rawStages = activeEvent?.stages || [];

  // Evaluate dynamic status based on current real-time clock
  const evaluatedStages = useMemo(() => {
    return rawStages.map((s) => {
      let calculatedStatus = s.status || "Upcoming";

      if (s.timeWindow) {
        const parts = s.timeWindow.split(/[–—-]/);
        const startStr = parts[0]?.trim();
        const endStr = parts[1]?.trim();

        const startDateObj = parseTimeString(startStr, now);
        const endDateObj = parseTimeString(endStr, now);

        if (startDateObj && endDateObj) {
          if (now >= endDateObj) {
            calculatedStatus = "Completed";
          } else if (now >= startDateObj && now < endDateObj) {
            calculatedStatus = "LIVE";
          } else if (now < startDateObj) {
            calculatedStatus = "Upcoming";
          }
        } else if (startDateObj) {
          if (now < startDateObj) {
            calculatedStatus = "Upcoming";
          }
        }
      }

      return { ...s, calculatedStatus };
    });
  }, [rawStages, now]);

  const liveStageIndex = evaluatedStages.findIndex((s) => s.calculatedStatus === "LIVE");
  const liveStage = liveStageIndex !== -1 ? evaluatedStages[liveStageIndex] : rawStages.find((s) => s.status === "LIVE");
  const upcomingStage = evaluatedStages.find((s) => s.calculatedStatus === "Upcoming");
  const completedCount = evaluatedStages.filter((s) => s.calculatedStatus === "Completed").length;

  // Compute continuous timeline line progress percentage across all stages
  const lineProgressPercent = useMemo(() => {
    if (evaluatedStages.length <= 1) return 0;
    const totalSegments = evaluatedStages.length - 1;

    if (liveStageIndex !== -1 && evaluatedStages[liveStageIndex]?.timeWindow) {
      const parts = evaluatedStages[liveStageIndex].timeWindow.split(/[–—-]/);
      const startStr = parts[0]?.trim();
      const endStr = parts[1]?.trim();
      const startDateObj = parseTimeString(startStr, now);
      const endDateObj = parseTimeString(endStr, now);

      if (startDateObj && endDateObj && endDateObj.getTime() > startDateObj.getTime()) {
        const totalDuration = endDateObj.getTime() - startDateObj.getTime();
        const elapsed = Math.max(0, Math.min(totalDuration, now.getTime() - startDateObj.getTime()));
        const withinStageFraction = elapsed / totalDuration; // accurately 0.0 to 1.0 based on current time
        const overallFraction = (liveStageIndex + withinStageFraction) / totalSegments;
        return Math.min(100, Math.max(0, Math.round(overallFraction * 100)));
      }
      // If no valid timeWindow duration, progress line at least reaches current node
      return Math.min(100, Math.round((liveStageIndex / totalSegments) * 100));
    }

    return Math.min(100, Math.round((completedCount / totalSegments) * 100));
  }, [evaluatedStages, liveStageIndex, completedCount, now]);

  const progressPercent = lineProgressPercent;

  // Live countdown timer in JavaScript synced with target upcoming stage / event time
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    function calculateTargetSeconds() {
      let targetTimeStr = null;

      if (upcomingStage?.timeWindow) {
        targetTimeStr = upcomingStage.timeWindow.split(/[–—-]/)[0]?.trim();
      }

      if (!targetTimeStr && activeEvent?.startTime) {
        targetTimeStr = activeEvent.startTime.trim();
      }

      if (targetTimeStr) {
        const parsedTarget = parseTimeString(targetTimeStr, now);
        if (parsedTarget) {
          const diff = Math.floor((parsedTarget.getTime() - now.getTime()) / 1000);
          return diff > 0 ? diff : 0;
        }
      }

      return 0;
    }

    setSecondsRemaining(calculateTargetSeconds());
  }, [upcomingStage, activeEvent, now]);

  const formatCountdown = (totalSeconds) => {
    if (totalSeconds <= 0) return "00:00:00";
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const toggleDuty = (dutyId) => {
    setDuties((prev) =>
      prev.map((d) => (d.id === dutyId ? { ...d, completed: !d.completed, status: !d.completed ? "Completed" : "In Progress" } : d))
    );
  };

  const toggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed, status: !t.completed ? "Completed" : "In Progress" } : t))
    );
  };



  return (
    <div className="space-y-9 w-full max-w-[1360px] mx-auto pb-16 pt-2">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1A1D23]">
          Good morning{currentUser?.name ? `, ${currentUser.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 text-base text-[#5A6577] font-medium">
          Here is what requires your operational focus for <span className="font-bold text-[#3B6FD4]">{activeEvent?.name || "your event"}</span> today.
        </p>
      </div>

      {/* Hero Surface */}
      <section aria-label="Current event status" className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-7 md:p-9 space-y-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
        {/* Top Split: Left Event Info & Right Next Stage / Countdown */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Left Zone: Active Stage Details */}
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-extrabold text-[#3B6FD4] bg-[#EBF0FA] px-3 py-1 rounded-full uppercase tracking-wider">
                {activeEvent?.name || "No Event Selected"} • {activeEvent?.type || "Event"}
              </span>
              {liveStage && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#22A65E]/10 border border-[#22A65E]/25 px-3 py-1 text-xs font-extrabold text-[#22A65E]">
                  <span className="h-2 w-2 rounded-full bg-[#22A65E] animate-pulse" />
                  LIVE STAGE
                </span>
              )}
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1D23] tracking-tight">
                {liveStage ? liveStage.title : activeEvent ? "Event In Progress" : "No Active Event"}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-semibold text-[#5A6577]">
                {(liveStage?.location || activeEvent?.location || activeEvent?.primaryLocation) && (
                  <span className="inline-flex items-center gap-1.5 bg-[#F0F2F5] px-3 py-1 rounded-full text-xs font-bold text-[#1A1D23]">
                    <MapPin size={14} className="text-[#3B6FD4]" />
                    <span>{liveStage?.location || activeEvent?.location || activeEvent?.primaryLocation}</span>
                  </span>
                )}
                {activeEvent?.duration && (
                  <span className="inline-flex items-center gap-1.5 bg-[#EBF0FA] px-3 py-1 rounded-full text-xs font-bold text-[#3B6FD4] font-mono">
                    <Clock size={14} /> {activeEvent.duration} ({activeEvent.startTime || "09:00"} – {activeEvent.endTime || "21:00"})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Zone: Next Stage & Live Countdown Timer */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[rgba(0,0,0,0.06)]">
            <div className="text-left lg:text-right rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3.5 w-full sm:w-auto lg:w-56">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E99A8] block">
                UPCOMING STAGE
              </span>
              <span className="text-sm font-extrabold text-[#1A1D23] block mt-0.5 truncate">
                {upcomingStage?.title || "No Upcoming Stages"}
              </span>
              <div className="mt-2 pt-2 border-t border-[rgba(0,0,0,0.06)] flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#8E99A8]">Starts in</span>
                <span className="text-base font-mono font-extrabold text-[#3B6FD4]">
                  {formatCountdown(secondsRemaining)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Zone: Run of Show Progress Rail */}
        <div className="pt-5 border-t border-[rgba(0,0,0,0.06)] space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#1A1D23] font-bold uppercase tracking-wider text-xs">
              Run of Show Progress
            </span>
            <span className="text-[#5A6577] text-xs font-medium">
              {completedCount} of {rawStages.length} completed · {progressPercent}% through event schedule
            </span>
          </div>

          {/* Horizontal Stage Rail */}
          <div className="relative pt-2 pb-1">
            <div className="flex items-center justify-between text-center relative z-10 gap-2">
              {evaluatedStages.map((stg, i) => {
                const status = stg.calculatedStatus || stg.status;
                const isCurrent = status === "LIVE" || status === "current";
                const isCompleted = status === "Completed" || status === "completed";

                return (
                  <div key={stg.id || i} className="flex flex-col items-center gap-2 group cursor-pointer flex-1 min-w-0">
                    {/* Node Circle */}
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full transition-all flex items-center justify-center border-2 shrink-0",
                        isCurrent
                          ? "bg-[#3B6FD4] border-[#3B6FD4] ring-4 ring-[#3B6FD4]/20 shadow-[0_0_12px_rgba(59,111,212,0.3)]"
                          : isCompleted
                          ? "bg-[#22A65E] border-[#22A65E]"
                          : "bg-[#F0F2F5] border-[#D0D5DD]"
                      )}
                    >
                      {isCompleted && <Check size={9} className="text-white stroke-[3]" />}
                    </div>

                    {/* Stage Name */}
                    <span
                      className={cn(
                        "text-xs font-semibold truncate w-full text-center",
                        isCurrent
                          ? "text-[#3B6FD4] font-bold"
                          : isCompleted
                          ? "text-[#5A6577]"
                          : "text-[#8E99A8]"
                      )}
                    >
                      {stg.title || stg.name}
                    </span>

                    {/* Event Timing Below Name */}
                    <span
                      className={cn(
                        "text-[11px] font-mono font-medium truncate w-full text-center",
                        isCurrent
                          ? "text-[#3B6FD4] font-bold"
                          : isCompleted
                          ? "text-[#8E99A8]"
                          : "text-[#B5BCC7]"
                      )}
                    >
                      {stg.timeWindow || stg.timeDisplay || stg.time}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Connecting Line */}
            {evaluatedStages.length > 1 && (
              <div
                className="absolute top-[17px] h-0.5 bg-[#E8ECF1] -z-0"
                style={{
                  left: `${100 / (evaluatedStages.length * 2)}%`,
                  right: `${100 / (evaluatedStages.length * 2)}%`
                }}
              >
                {/* Active/Live progress line advancing forward towards next stage in blue */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-[#3B6FD4] transition-all duration-300"
                  style={{
                    width: `${lineProgressPercent}%`
                  }}
                />
                {/* Past completed stages strictly in green */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-[#22A65E] transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((completedCount / (evaluatedStages.length - 1)) * 100))}%`
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Two-Column Layout: Your Duties (58%) & Your Tasks (42%) */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Your Duties (58% width - 7 cols) */}
        <section className="lg:col-span-7 space-y-4" aria-label="Personal organizer duties">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-bold text-[#1A1D23]">Your Duties</h3>
            <span className="text-xs font-medium text-[#8E99A8]">Assigned shift roles</span>
          </div>

          <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-3 divide-y divide-[rgba(0,0,0,0.06)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {duties.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-sm font-bold text-[#1A1D23]">No duties assigned</p>
                <p className="text-xs text-[#8E99A8]">You currently have no shift duties assigned for this event.</p>
              </div>
            ) : (
              duties.map((duty) => (
                <div
                  key={duty.id}
                  onClick={() => toggleDuty(duty.id)}
                  className={cn(
                    "group flex items-start gap-3.5 py-3.5 px-3 rounded-2xl cursor-pointer transition-colors duration-150",
                    duty.completed
                      ? "opacity-60 bg-[#F7F8FA]"
                      : "hover:bg-[#F7F8FA]"
                  )}
                >
                  {/* Completion Checkbox */}
                  <button
                    type="button"
                    aria-label={`Toggle ${duty.title}`}
                    className="mt-0.5 shrink-0 text-[#8E99A8] group-hover:text-[#1A1D23] transition-colors"
                  >
                    {duty.completed ? (
                      <CheckSquare size={18} className="text-[#22A65E]" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>

                  {/* Duty Details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm font-bold text-[#1A1D23] leading-snug truncate",
                          duty.completed && "line-through text-[#8E99A8]"
                        )}
                      >
                        {duty.title}
                      </p>
                      <PriorityBadge priority={duty.priority} />
                    </div>

                    <div className="flex items-center justify-between text-xs font-medium text-[#5A6577] pt-0.5">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#3B6FD4]">
                          <Clock size={12} className="text-[#3B6FD4]" />
                          {duty.time}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-[#5A6577]">
                          <MapPin size={12} />
                          <span className="text-[#5A6577] font-medium">{duty.location}</span>
                        </span>
                      </div>
                      <StatusBadge status={duty.status} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Your Tasks (42% width - 5 cols) */}
        <section className="lg:col-span-5 space-y-4" aria-label="Personal organizer tasks">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-bold text-[#1A1D23]">Your Tasks</h3>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-[#3B6FD4] hover:text-[#2F5BB8] transition-colors inline-flex items-center gap-1"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>

          <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-3 divide-y divide-[rgba(0,0,0,0.06)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {tasks.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-sm font-bold text-[#1A1D23]">No tasks assigned</p>
                <p className="text-xs text-[#8E99A8]">You currently have no tasks assigned for this event.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "group flex items-start gap-3 py-3.5 px-3 rounded-xl cursor-pointer transition-colors duration-150",
                    task.completed
                      ? "opacity-60"
                      : "hover:bg-[#F7F8FA]"
                  )}
                >
                  <button
                    type="button"
                    aria-label={`Toggle ${task.title}`}
                    className="mt-0.5 shrink-0 text-[#8E99A8] group-hover:text-[#1A1D23] transition-colors"
                  >
                    {task.completed ? (
                      <CheckSquare size={17} className="text-[#22A65E]" />
                    ) : (
                      <Square size={17} />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-xs font-semibold text-[#1A1D23] leading-snug truncate",
                          task.completed && "line-through text-[#8E99A8]"
                        )}
                      >
                        {task.title}
                      </p>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] font-medium text-[#8E99A8]">
                      <span>{task.time} · {task.area}</span>
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Operational Attention Alert Banner */}
      {hasUrgentIssue && (
        <section aria-label="Operational alerts" className="pt-2">
          <div className="flex items-center justify-between rounded-2xl bg-white border border-[rgba(212,147,14,0.25)] px-5 py-3.5 text-xs font-medium text-[#1A1D23] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D4930E]/15 text-[#D4930E]">
                <AlertTriangle size={15} />
              </div>
              <div>
                <span className="font-bold text-[#1A1D23]">Needs Attention:</span> <span className="text-[#5A6577]">2 unresolved issues flagged in Technical Team (WiFi latency in Lab C).</span>
              </div>
            </div>
            <Link
              to="/issues"
              className="font-bold text-[#3B6FD4] hover:text-[#2F5BB8] shrink-0 text-xs inline-flex items-center gap-1"
            >
              Resolve <ArrowRight size={13} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
