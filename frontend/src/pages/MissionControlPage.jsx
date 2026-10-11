// Shows the event dashboard, timeline, and assignments for the active user.
import {
  ArrowRight,
  AlertTriangle,
  Check,
  CheckSquare,
  Clock,
  MapPin,
  Square,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  cn,
  getStageStatus,
  isEventComplete,
  parseTimeString,
} from "@/lib/utils";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useAppStore } from "@/store/useAppStore";

const initialOrganizerDuties = [];
const initialOrganizerTasks = [];

// Converts a persisted duty into the dashboard assignment shape.
function formatDashboardDuty(duty) {
  const assignedToCurrentUser = (duty.assignments || []).some(
    (assignment) =>
      (assignment.orgMember?.userId || assignment.userId) ===
      useAppStore.getState().currentUser?.id,
  );
  if (!assignedToCurrentUser) return null;
  const start = new Date(duty.startAt);
  const end = new Date(duty.endAt);
  const time =
    !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())
      ? `${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
      : "Time not set";
  return {
    ...duty,
    title: duty.title,
    time,
    location: duty.venue?.name || "Venue not set",
  };
}

// Renders the active event command dashboard.
export function MissionControlPage() {
  const activeEvent = useAppStore((state) => state.activeEvent);
  const currentUser = useAppStore((state) => state.currentUser);
  const eventsHydrated = useAppStore((state) => state.eventsHydrated);
  const [duties, setDuties] = useState(initialOrganizerDuties);
  const [tasks, setTasks] = useState(initialOrganizerTasks);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [hasUrgentIssue] = useState(false);
  const [now, setNow] = useState(new Date());

  // Tick every second to update current time
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!activeEvent?.id || !currentUser?.id) {
      if (eventsHydrated) setTasksLoading(false);
      return;
    }
    setTasksLoading(true);
    const token = localStorage.getItem("convene_token");
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    Promise.all([
      fetch(`${apiBase}/events/${activeEvent.id}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${apiBase}/events/${activeEvent.id}/duties`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([tasksResponse, dutiesResponse]) => {
        if (!tasksResponse.ok) throw new Error("Failed to load tasks.");
        const [{ tasks: eventTasks = [] }, { duties: eventDuties = [] }] =
          await Promise.all([
            tasksResponse.json(),
            dutiesResponse.ok
              ? dutiesResponse.json()
              : Promise.resolve({ duties: [] }),
          ]);
        setTasks(
          eventTasks
            .filter((task) => task.assignedOrgMember?.userId === currentUser.id)
            .map((task) => ({
              ...task,
              completed: task.status === "Completed",
              time: task.dueAt
                ? new Date(task.dueAt).toLocaleDateString()
                : "No due date",
              area: task.orgTeam?.name || "Unassigned",
              status:
                task.status === "In_Progress" ? "In Progress" : task.status,
            })),
        );
        setDuties(eventDuties.map(formatDashboardDuty).filter(Boolean));
      })
      .catch(() => {
        setTasks([]);
        setDuties([]);
      })
      .finally(() => setTasksLoading(false));
  }, [activeEvent?.id, currentUser?.id, eventsHydrated]);

  // Derive dynamic stage rail from activeEvent or empty array
  const rawStages = activeEvent?.stages || [];
  const eventIsComplete = isEventComplete(activeEvent, now);

  // Evaluate dynamic status based on current real-time clock
  const evaluatedStages = useMemo(() => {
    return rawStages.map((s) => ({
      ...s,
      calculatedStatus: eventIsComplete ? "Completed" : getStageStatus(s, now),
    }));
  }, [eventIsComplete, rawStages, now]);

  const liveStageIndex = evaluatedStages.findIndex(
    (s) => s.calculatedStatus === "LIVE",
  );
  const liveStage =
    liveStageIndex !== -1
      ? evaluatedStages[liveStageIndex]
      : rawStages.find((s) => s.status === "LIVE");
  const upcomingStage = evaluatedStages.find(
    (s) => s.calculatedStatus === "Upcoming",
  );
  const completedCount = evaluatedStages.filter(
    (s) => s.calculatedStatus === "Completed",
  ).length;

  // Compute continuous timeline line progress percentage across all stages
  const lineProgressPercent = useMemo(() => {
    if (eventIsComplete) return evaluatedStages.length > 0 ? 100 : 0;
    if (evaluatedStages.length <= 1) return 0;
    const totalSegments = evaluatedStages.length - 1;

    if (liveStageIndex !== -1 && evaluatedStages[liveStageIndex]?.timeWindow) {
      const parts = evaluatedStages[liveStageIndex].timeWindow.split(/[–—-]/);
      const startStr = parts[0]?.trim();
      const endStr = parts[1]?.trim();
      const startDateObj = parseTimeString(startStr, now);
      const endDateObj = parseTimeString(endStr, now);

      if (
        startDateObj &&
        endDateObj &&
        endDateObj.getTime() > startDateObj.getTime()
      ) {
        const totalDuration = endDateObj.getTime() - startDateObj.getTime();
        const elapsed = Math.max(
          0,
          Math.min(totalDuration, now.getTime() - startDateObj.getTime()),
        );
        const withinStageFraction = elapsed / totalDuration; // accurately 0.0 to 1.0 based on current time
        const overallFraction =
          (liveStageIndex + withinStageFraction) / totalSegments;
        return Math.min(100, Math.max(0, Math.round(overallFraction * 100)));
      }
      // If no valid timeWindow duration, progress line at least reaches current node
      return Math.min(100, Math.round((liveStageIndex / totalSegments) * 100));
    }

    return Math.min(100, Math.round((completedCount / totalSegments) * 100));
  }, [eventIsComplete, evaluatedStages, liveStageIndex, completedCount, now]);

  const progressPercent = lineProgressPercent;

  // Live countdown timer in JavaScript synced with target upcoming stage / event time
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    function calculateTargetSeconds() {
      let parsedTarget = upcomingStage?.startAt
        ? new Date(upcomingStage.startAt)
        : null;

      if (!parsedTarget || Number.isNaN(parsedTarget.getTime())) {
        if (activeEvent?.startDate && activeEvent?.startTime) {
          parsedTarget = new Date(
            `${activeEvent.startDate}T${activeEvent.startTime}`,
          );
        } else if (activeEvent?.startTime) {
          parsedTarget = parseTimeString(activeEvent.startTime.trim(), now);
        }
      }

      if (parsedTarget && !Number.isNaN(parsedTarget.getTime())) {
        const diff = Math.floor(
          (parsedTarget.getTime() - now.getTime()) / 1000,
        );
        return diff > 0 ? diff : 0;
      }

      return 0;
    }

    setSecondsRemaining(calculateTargetSeconds());
  }, [upcomingStage, activeEvent, now]);

  const formatCountdown = (totalSeconds) => {
    if (totalSeconds <= 0) return "00:00:00";
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0",
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const toggleTask = async (taskId) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    const nextStatus =
      task.status === "Completed" ? "In Progress" : "Completed";
    const token = localStorage.getItem("convene_token");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/tasks/${taskId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to update task status.");
      const updated = data.task;
      setTasks((prev) =>
        prev.map((item) =>
          item.id === taskId
            ? {
                ...item,
                ...updated,
                completed: updated.status === "Completed",
                status:
                  updated.status === "In_Progress"
                    ? "In Progress"
                    : updated.status,
                area: updated.orgTeam?.name || item.area,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-9 w-full max-w-[1360px] mx-auto pb-16 pt-2">
      {/* Header */}
      <div>
        <h1 className="type-4xl md:type-5xl weight-extrabold tracking-tight text-token-primary">
          Good morning
          {currentUser?.name ? `, ${currentUser.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 type-base text-token-secondary weight-medium">
          Here is what requires your operational focus for{" "}
          <span className="weight-bold text-token-accent">
            {activeEvent?.name || "your event"}
          </span>{" "}
          today.
        </p>
      </div>

      {/* Hero Surface */}
      <section
        aria-label="Current event status"
        className="rounded-3xl surface-card-token border border-token p-7 md:p-9 space-y-8 shadow-token-soft relative overflow-hidden"
      >
        {/* Top Split: Left Event Info & Right Next Stage / Countdown */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Left Zone: Active Stage Details */}
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="type-xs weight-extrabold text-token-accent accent-surface-token px-3 py-1 rounded-full uppercase tracking-wider">
                {activeEvent?.name || "No Event Selected"} •{" "}
                {activeEvent?.type || "Event"}
              </span>
              {eventIsComplete ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-token-success/10 border border-token-success/25 px-3 py-1 type-xs weight-extrabold text-token-success">
                  <Check size={13} strokeWidth={3} /> COMPLETED
                </span>
              ) : (
                liveStage && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-token-success/10 border border-token-success/25 px-3 py-1 type-xs weight-extrabold text-token-success">
                    <span className="h-2 w-2 rounded-full bg-token-success animate-pulse" />
                    LIVE STAGE
                  </span>
                )
              )}
            </div>

            <div>
              <h2 className="type-3xl md:type-4xl weight-extrabold text-token-primary tracking-tight">
                {eventIsComplete
                  ? "Event Completed"
                  : liveStage
                    ? liveStage.title
                    : activeEvent
                      ? "Event In Progress"
                      : "No Active Event"}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 type-sm weight-semibold text-token-secondary">
                {(liveStage?.location ||
                  activeEvent?.location ||
                  activeEvent?.primaryLocation) && (
                  <span className="inline-flex items-center gap-1.5 field-token px-3 py-1 rounded-full type-xs weight-bold text-token-primary">
                    <MapPin size={14} className="text-token-accent" />
                    <span>
                      {liveStage?.location ||
                        activeEvent?.location ||
                        activeEvent?.primaryLocation}
                    </span>
                  </span>
                )}
                {activeEvent?.duration && !eventIsComplete && (
                  <span className="inline-flex items-center gap-1.5 accent-surface-token px-3 py-1 rounded-full type-xs weight-bold text-token-accent font-mono">
                    <Clock size={14} /> {activeEvent.duration} (
                    {activeEvent.startTime || "09:00"} –{" "}
                    {activeEvent.endTime || "21:00"})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Zone: Next Stage & Live Countdown Timer */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-subtle-token">
            <div className="text-left lg:text-right rounded-2xl surface-token border border-subtle-token p-3.5 w-full sm:w-auto lg:w-56">
              <span className="type-10 weight-bold uppercase tracking-wider text-token-muted block">
                {eventIsComplete ? "EVENT STATUS" : "UPCOMING STAGE"}
              </span>
              <span className="type-sm weight-extrabold text-token-primary block mt-0.5 truncate">
                {eventIsComplete
                  ? "Completed"
                  : upcomingStage?.title || "No Upcoming Stages"}
              </span>
              <div className="mt-2 pt-2 border-t border-subtle-token flex items-center justify-between">
                <span className="type-11 weight-semibold text-token-muted">
                  {eventIsComplete ? "Timeline" : "Starts in"}
                </span>
                <span className="type-base font-mono weight-extrabold text-token-accent">
                  {eventIsComplete
                    ? "100% complete"
                    : formatCountdown(secondsRemaining)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Zone: Run of Show Progress Rail */}
        <div className="pt-5 border-t border-subtle-token space-y-4">
          <div className="flex items-center justify-between type-xs weight-semibold">
            <span className="text-token-primary weight-bold uppercase tracking-wider type-xs">
              Run of Show Progress
            </span>
            <span className="text-token-secondary type-xs weight-medium">
              {completedCount} of {rawStages.length} completed ·{" "}
              {progressPercent}% through event schedule
            </span>
          </div>

          {/* Horizontal Stage Rail */}
          <div className="relative pt-2 pb-1">
            <div className="flex items-center justify-between text-center relative z-10 gap-2">
              {evaluatedStages.map((stg, i) => {
                const status = stg.calculatedStatus || stg.status;
                const isCurrent = status === "LIVE" || status === "current";
                const isCompleted =
                  status === "Completed" || status === "completed";

                return (
                  <div
                    key={stg.id || i}
                    className="flex flex-col items-center gap-2 group cursor-pointer flex-1 min-w-0"
                  >
                    {/* Node Circle */}
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full transition-all flex items-center justify-center border-2 shrink-0",
                        isCurrent
                          ? "bg-token-accent border-token-accent ring-4 ring-token-accent/20 shadow-token-accent"
                          : isCompleted
                            ? "bg-token-success border-token-success"
                            : "field-token border-token-medium",
                      )}
                    >
                      {isCompleted && (
                        <Check size={9} className="text-token-inverse stroke-[3]" />
                      )}
                    </div>

                    {/* Stage Name */}
                    <span
                      className={cn(
                        "type-xs weight-semibold truncate w-full text-center",
                        isCurrent
                          ? "text-token-accent weight-bold"
                          : isCompleted
                            ? "text-token-secondary"
                            : "text-token-muted",
                      )}
                    >
                      {stg.title || stg.name}
                    </span>

                    {/* Event Timing Below Name */}
                    <span
                      className={cn(
                        "type-11 font-mono weight-medium truncate w-full text-center",
                        isCurrent
                          ? "text-token-accent weight-bold"
                          : isCompleted
                            ? "text-token-muted"
                            : "text-token-inverse-muted",
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
                className="absolute top-[17px] h-0.5 hover-token -z-0"
                style={{
                  left: `${100 / (evaluatedStages.length * 2)}%`,
                  right: `${100 / (evaluatedStages.length * 2)}%`,
                }}
              >
                {/* Active/Live progress line advancing forward towards next stage in blue */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-token-accent transition-all duration-300"
                  style={{
                    width: `${lineProgressPercent}%`,
                  }}
                />
                {/* Past completed stages strictly in green */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-token-success transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((completedCount / (evaluatedStages.length - 1)) * 100))}%`,
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
        <section
          className="lg:col-span-7 space-y-4"
          aria-label="Personal organizer duties"
        >
          <div className="flex items-center justify-between">
            <h3 className="type-20 weight-bold text-token-primary">
              Your Duties
            </h3>
            <span className="type-xs weight-medium text-token-muted">
              Assigned shift roles
            </span>
          </div>

          <div className="rounded-3xl surface-card-token  border border-token  p-3 divide-y divide-subtle-token  shadow-token-card">
            {duties.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="type-sm weight-bold text-token-primary">
                  No duties assigned
                </p>
                <p className="type-xs text-token-muted">
                  You currently have no shift duties assigned for this event.
                </p>
              </div>
            ) : (
              duties.map((duty) => (
                <div
                  key={duty.id}
                  className="group flex items-start gap-3.5 py-3.5 px-3 rounded-2xl transition-colors duration-150 hover-surface-token "
                >
                  {/* Duty Details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "type-sm weight-bold text-token-primary dark:text-token-inverse leading-snug truncate",
                        )}
                      >
                        {duty.title}
                      </p>
                    </div>

                    <div className="flex items-center justify-between type-xs weight-medium text-token-secondary pt-0.5">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 font-mono type-11 weight-bold text-token-accent">
                          <Clock size={12} className="text-token-accent" />
                          {duty.time}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-secondary">
                          <MapPin size={12} />
                          <span className="text-secondary weight-medium">
                            {duty.location}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Your Tasks (42% width - 5 cols) */}
        <section
          className="lg:col-span-5 space-y-4"
          aria-label="Personal organizer tasks"
        >
          <div className="flex items-center justify-between">
            <h3 className="type-20 weight-bold text-token-primary">Your Tasks</h3>
            <Link
              to="/tasks"
              className="type-xs weight-semibold text-token-accent hover:text-token-accent-dark transition-colors inline-flex items-center gap-1"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>

          <div className="rounded-3xl surface-card-token  border border-token  p-3 divide-y divide-subtle-token  shadow-token-card">
            {tasksLoading ? (
              <div className="space-y-3 p-5">
                <LoadingSkeleton className="h-10" />
                <LoadingSkeleton className="h-10" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="type-sm weight-bold text-token-primary">
                  No tasks assigned
                </p>
                <p className="type-xs text-token-muted">
                  You currently have no tasks assigned for this event.
                </p>
              </div>
            ) : (
              [...tasks]
                .sort(
                  (left, right) =>
                    Number(left.completed) - Number(right.completed),
                )
                .map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "group flex items-start gap-3 py-3.5 px-3 rounded-xl cursor-pointer transition-colors duration-150",
                      task.completed
                        ? "opacity-75"
                        : "hover-surface-token ",
                    )}
                  >
                    <button
                      type="button"
                      aria-label={`Toggle ${task.title}`}
                      className="mt-0.5 shrink-0 text-token-muted group-hover:text-token-primary transition-colors"
                    >
                      {task.completed ? (
                        <CheckSquare size={17} className="text-token-success" />
                      ) : (
                        <Square size={17} />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "type-xs weight-semibold text-token-primary dark:text-token-inverse leading-snug truncate",
                          )}
                        >
                          {task.title}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center justify-between type-11 weight-medium text-token-muted">
                        <span>{task.time}</span>
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
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
          <div className="flex items-center justify-between rounded-2xl surface-card-token border border-token-warning-soft px-5 py-3.5 type-xs weight-medium text-token-primary shadow-token-card">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-token-warning/15 text-token-warning">
                <AlertTriangle size={15} />
              </div>
              <div>
                <span className="weight-bold text-token-primary">
                  Needs Attention:
                </span>{" "}
                <span className="text-token-secondary">
                  2 unresolved issues flagged in Technical Team (WiFi latency in
                  Lab C).
                </span>
              </div>
            </div>
            <Link
              to="/issues"
              className="weight-bold text-token-accent hover:text-token-accent-dark shrink-0 type-xs inline-flex items-center gap-1"
            >
              Resolve <ArrowRight size={13} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
