import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, AlertTriangle, Check, CheckSquare, Clock, MapPin, Sparkles, Square } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const timelineEvents = [
  { time: "09:00", title: "Registration", status: "completed" },
  { time: "10:00", title: "Opening Ceremony", status: "completed" },
  { time: "12:30", title: "Lunch", status: "completed" },
  { time: "15:00", title: "Mentoring", status: "current" },
  { time: "17:30", title: "Judging", status: "upcoming" },
  { time: "20:00", title: "Closing Ceremony", status: "upcoming" }
];

const initialOrganizerTasks = [
  { id: "t1", title: "Confirm mentor room signage", time: "10:30", area: "Operations", completed: false },
  { id: "t2", title: "Check presentation setup", time: "11:00", area: "Technical", completed: false },
  { id: "t3", title: "Publish judging rubric", time: "11:20", area: "Content", completed: false },
  { id: "t4", title: "Restock mentor water bottles", time: "14:00", area: "Hospitality", completed: true }
];

export function MissionControlPage() {
  const [tasks, setTasks] = useState(initialOrganizerTasks);
  const [hasUrgentIssue, setHasUrgentIssue] = useState(true);

  const toggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-16 pt-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#172B4D] md:text-3xl">
          Good morning, Aman
        </h1>
        <p className="mt-1.5 text-sm text-[#52657A] font-medium">
          Here is what requires your operational focus for HackFest 2026 today.
        </p>
      </div>

      {/* Current Event (Soft Tinted Section Boundary - NOT a floating white card) */}
      <section aria-label="Current event status" className="rounded-3xl bg-[#E8F1F9] p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Left Information */}
          <div className="space-y-3.5 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#8190A3] uppercase tracking-widest">
                HackFest 2026
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E2F2E9] px-2.5 py-0.5 text-xs font-semibold text-[#2E7D5B]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D5B] animate-pulse" />
                Live
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#172B4D] tracking-tight md:text-3xl">
                Mentoring Round
              </h2>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#52657A]">
                <MapPin size={15} className="text-[#4A7FA7]" />
                <span>Labs A–D</span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[#52657A] font-medium">
              Mentoring is currently in progress across four labs. Keep floor leads visible and ensure mentor handovers remain on schedule before Judging begins.
            </p>
          </div>

          {/* Right Next Stage & Countdown */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#D0DFEC]">
            <div className="text-left lg:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8190A3] block">
                Next Stage
              </span>
              <span className="text-sm font-bold text-[#172B4D] block mt-0.5">
                Judging
              </span>
            </div>

            <div className="text-left lg:text-right">
              <span className="text-xs font-medium text-[#8190A3] block">Starts in</span>
              <span className="text-2xl font-mono font-bold text-[#1A3D63] tracking-tight block">
                01:42:18
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Column Layout (Timeline & Tasks - Flat Google Calendar & Keep Style) */}
      <div className="grid gap-10 lg:grid-cols-12">
        {/* Today's Timeline (Google Calendar style clean vertical timeline) */}
        <section className="lg:col-span-7 space-y-4" aria-label="Today's event timeline">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider">Today's Timeline</h3>
            <Link
              to="/run-of-show"
              className="text-xs font-semibold text-[#4A7FA7] hover:text-[#1A3D63] hover:underline inline-flex items-center gap-1"
            >
              Full schedule <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-1 pt-1">
            {timelineEvents.map((evt) => {
              const isCurrent = evt.status === "current";
              const isCompleted = evt.status === "completed";

              return (
                <div
                  key={evt.time}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-2.5 text-xs transition-colors duration-150",
                    isCurrent
                      ? "bg-[#B9DDF5] text-[#0B3555] font-bold"
                      : isCompleted
                      ? "text-[#8190A3] hover:bg-[#E3EDF5]"
                      : "text-[#172B4D] hover:bg-[#E3EDF5]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        "font-mono text-xs w-12 shrink-0 font-semibold",
                        isCurrent ? "text-[#0B3555]" : isCompleted ? "text-[#8190A3]" : "text-[#52657A]"
                      )}
                    >
                      {evt.time}
                    </span>
                    <span className="text-sm font-medium">{evt.title}</span>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B3555] bg-[#E8F1F9] px-2.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Your Tasks (Flat clean list - NO big card box container!) */}
        <section className="lg:col-span-5 space-y-4" aria-label="Personal organizer tasks">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider">Your Tasks</h3>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-[#4A7FA7] hover:text-[#1A3D63] hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-[#D0DFEC]/40 pt-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "group flex items-start gap-3 py-3 px-3 rounded-xl cursor-pointer transition-colors duration-150",
                  task.completed
                    ? "opacity-60"
                    : "hover:bg-[#E3EDF5]"
                )}
              >
                <button
                  type="button"
                  aria-label={`Toggle ${task.title}`}
                  className="mt-0.5 shrink-0 text-[#8190A3] group-hover:text-[#1A3D63] transition-colors"
                >
                  {task.completed ? (
                    <CheckSquare size={16} className="text-[#1A3D63]" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-xs font-semibold text-[#172B4D] leading-snug",
                      task.completed && "line-through text-[#8190A3]"
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-[#52657A]">
                    {task.time} · {task.area}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Optional Attention Alert Area */}
      {hasUrgentIssue && (
        <section aria-label="Operational alerts" className="pt-2">
          <div className="flex items-center justify-between rounded-2xl bg-[#FAF5E8] px-5 py-3.5 text-xs font-medium text-[#172B4D]">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E5A91A]/20 text-[#E5A91A]">
                <AlertTriangle size={15} />
              </div>
              <div>
                <span className="font-bold text-[#172B4D]">Needs Attention:</span> <span className="text-[#52657A]">2 unresolved issues flagged in Technical Team (WiFi latency in Lab C).</span>
              </div>
            </div>
            <Link
              to="/issues"
              className="font-bold text-[#1A3D63] hover:underline shrink-0 text-xs inline-flex items-center gap-1"
            >
              Resolve <ArrowRight size={13} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
