import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Edit,
  ExternalLink,
  FileDown,
  FileText,
  Filter,
  Flame,
  LayoutList,
  MapPin,
  Plus,
  Radio,
  Search,
  Sparkles,
  Users,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassModal } from "@/components/glass/GlassModal";
import { initialStages } from "@/data/runOfShow";
import { cn } from "@/lib/utils";

const statusStyles = {
  LIVE: "border-[#34C759]/50 bg-[#34C759]/20 text-[#4ade80] gold-glow",
  Completed: "border-white/20 bg-white/10 text-[#cbd5e1]",
  Upcoming: "border-[#007AFF]/40 bg-[#007AFF]/18 text-[#38bdf8]"
};

function StatusBadge({ status = "Upcoming" }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
        statusStyles[status] ?? statusStyles.Upcoming
      )}
    >
      {status === "LIVE" ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34C759]"></span>
          </span>
          LIVE
        </>
      ) : (
        status
      )}
    </span>
  );
}

function SelectFilter({ value, onChange, options, label }) {
  return (
    <label className="glass-surface flex h-10 shrink-0 items-center gap-2 rounded-2xl px-3 text-xs font-semibold text-[#6B7280]">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent text-xs font-medium text-[#111827] outline-none pr-1"
      >
        {options.map((option) => (
          <option key={option} className="bg-[#111827] text-white">
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={14} strokeWidth={1.75} className="shrink-0 text-[#9CA3AF]" />
    </label>
  );
}

function StageDrawer({ stage, onClose }) {
  const navigate = useNavigate();

  if (!stage) return null;

  const handleOpenTasks = () => {
    onClose();
    navigate(`/tasks?team=${stage.ownerSlug}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 bg-[#111827]/20 backdrop-blur-[4px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        className="glass-surface fixed bottom-4 right-4 top-4 z-50 flex w-[min(540px,calc(100vw-32px))] flex-col overflow-hidden rounded-[32px] p-7 shadow-[0_24px_70px_rgba(31,41,55,0.25)]"
        initial={{ x: 600, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 600, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/20 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <StatusBadge status={stage.status} />
              <span className="text-xs font-mono font-semibold text-[#9CA3AF]">{stage.timeRange}</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-[#111827]">{stage.title}</h2>
          </div>
          <button
            className="flex h-9 w-9 min-h-0 items-center justify-center rounded-2xl bg-white/45 text-[#6B7280] hover:bg-white/70"
            onClick={onClose}
            aria-label="Close stage drawer"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto py-6 space-y-7 pr-1">
          {/* Key Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/35 bg-white/30 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#9CA3AF]">
                <MapPin size={15} /> Venue Location
              </div>
              <p className="mt-1 text-sm font-bold text-[#111827]">{stage.venue}</p>
            </div>

            <div className="rounded-2xl border border-white/35 bg-white/30 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#9CA3AF]">
                <Users size={15} /> Owner Team
              </div>
              <p className="mt-1 text-sm font-bold text-[#111827]">{stage.ownerTeam}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Stage Overview</h3>
            <p className="mt-2 text-sm leading-6 text-[#111827] bg-white/25 rounded-2xl border border-white/30 p-4">
              {stage.description}
            </p>
          </div>

          {/* Attached Resources */}
          {stage.resources && stage.resources.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Attached Stage Resources</h3>
              <div className="mt-3 space-y-2.5">
                {stage.resources.map((res) => (
                  <div
                    key={res.name}
                    className="flex items-center justify-between rounded-2xl border border-white/35 bg-white/30 p-3.5 text-xs"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/50 text-[#F6C445]">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#111827] truncate">{res.name}</p>
                        <p className="text-[11px] font-medium text-[#9CA3AF]">{res.type}</p>
                      </div>
                    </div>
                    <button className="flex h-8 w-8 min-h-0 items-center justify-center rounded-xl bg-white/50 text-[#6B7280] hover:bg-white">
                      <Download size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer CTA */}
        <div className="border-t border-white/20 pt-5">
          <GlassButton
            onClick={handleOpenTasks}
            variant="info"
            icon={<LayoutList size={16} />}
            className="w-full h-11 text-xs justify-center font-bold"
          >
            Open Related Tasks ({stage.relatedTasksCount})
          </GlassButton>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function EditTimelineModal({ open, onClose }) {
  return (
    <GlassModal open={open} className="w-[min(480px,calc(100vw-32px))] max-w-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Edit Timeline</h2>
          <p className="mt-1 text-xs font-medium text-[#6B7280]">Adjust master event stage timings and owner allocations.</p>
        </div>
        <button
          className="flex h-8 w-8 min-h-0 items-center justify-center rounded-xl bg-white/45 text-[#6B7280] hover:bg-white/70"
          onClick={onClose}
          aria-label="Close edit timeline modal"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-5 p-4 rounded-2xl border border-white/35 bg-white/20 text-center">
        <Clock size={28} className="mx-auto text-[#F6C445]" />
        <p className="mt-2 text-xs font-bold text-[#111827]">Master Schedule Editor</p>
        <p className="mt-1 text-[11px] text-[#6B7280]">Stage sequence locked to live broadcast sync.</p>
      </div>

      <div className="mt-6 flex justify-end pt-2">
        <GlassButton onClick={onClose} className="h-9 text-xs">
          Close
        </GlassButton>
      </div>
    </GlassModal>
  );
}

export function RunOfShowPage() {
  const [stages, setStages] = useState(initialStages);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState("Today"); // "Today" | "All Stages"
  const [selectedStage, setSelectedStage] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading] = useState(false);

  const liveStage = useMemo(() => stages.find((s) => s.status === "LIVE"), [stages]);

  const filteredStages = useMemo(() => {
    const query = search.trim().toLowerCase();
    return stages.filter((stage) => {
      const matchesSearch =
        !query ||
        stage.title.toLowerCase().includes(query) ||
        stage.venue.toLowerCase().includes(query) ||
        stage.ownerTeam.toLowerCase().includes(query);

      return matchesSearch;
    });
  }, [search, stages]);

  const progressPercentage = useMemo(() => {
    const completedCount = stages.filter((s) => s.status === "Completed").length;
    const liveCount = stages.filter((s) => s.status === "LIVE").length ? 0.5 : 0;
    return Math.round(((completedCount + liveCount) / stages.length) * 100);
  }, [stages]);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <PageHeader title="Run of Show" description="Monitor the live event schedule and upcoming stages." />
        <div className="flex items-center gap-3">
          <GlassButton icon={<FileDown size={17} strokeWidth={1.75} />}>Export Schedule</GlassButton>
          <GlassButton variant="info" icon={<Edit size={16} strokeWidth={1.75} />} onClick={() => setEditModalOpen(true)}>
            Edit Timeline
          </GlassButton>
        </div>
      </div>

      {/* Current Live Stage Hero Card */}
      {liveStage && (
        <GlassCard elevation="hero" padding="none" className="overflow-hidden rounded-[32px]">
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 flex items-center gap-3">
                  <StatusBadge status="LIVE" />
                  <span className="text-xs font-semibold text-[#6B7280]">{liveStage.timeRange}</span>
                  <span className="text-xs font-semibold text-[#9CA3AF]">• {liveStage.venue}</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Current Active Stage</p>
                <h2 className="mt-1.5 text-2xl md:text-3xl font-bold text-[#111827]">{liveStage.title}</h2>
                <p className="mt-2 text-xs md:text-sm leading-6 font-medium text-[#6B7280]">
                  Owner: <span className="font-bold text-[#111827]">{liveStage.ownerTeam}</span>
                </p>
              </div>

              {/* Live Countdown & Next Stage */}
              <div className="flex flex-wrap items-center gap-4 lg:flex-col lg:items-end">
                <div className="glass-surface rounded-2xl border-white/60 px-5 py-3 shadow-md text-right">
                  <p className="text-[11px] font-semibold text-[#6B7280]">Time Remaining</p>
                  <p className="text-2xl font-bold tabular-nums text-[#111827]">{liveStage.remainingTime}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-[#9CA3AF]">Next: {liveStage.nextStage}</p>
                  <p className="text-xs font-bold text-[#F6C445]">Starts in {liveStage.nextStartsIn}</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Horizontal Animated Timeline */}
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Master Stage Progress</p>
          <span className="text-xs font-bold text-[#F6C445]">{progressPercentage}% Complete</span>
        </div>

        {/* Progress Line */}
        <div className="relative mb-6 h-2 w-full rounded-full bg-white/30 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[#F6C445]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        {/* Stages Steps */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stages.map((stg) => {
            const isLive = stg.status === "LIVE";
            const isCompleted = stg.status === "Completed";

            return (
              <motion.div
                key={stg.id}
                className={cn(
                  "cursor-pointer rounded-2xl border p-3 text-center transition-all",
                  isLive
                    ? "gold-glow border-[#F6C445] bg-[#F6C445]/20 shadow-md"
                    : isCompleted
                    ? "border-white/30 bg-white/20 opacity-75"
                    : "border-white/30 bg-white/10"
                )}
                whileHover={{ y: -2, scale: 1.02 }}
                onClick={() => setSelectedStage(stg)}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">{stg.timeDisplay}</p>
                <p className="mt-1 truncate text-xs font-bold text-[#111827]">{stg.title}</p>
                <div className="mt-2 flex justify-center">
                  <StatusBadge status={stg.status} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Today's Schedule Toolbar */}
      <GlassCard className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <GlassInput
            className="h-10 min-w-[240px] max-w-sm flex-1 bg-white/48 text-xs"
            leftIcon={<Search size={16} strokeWidth={1.75} />}
            placeholder="Search stages, venues, owner teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search stages"
          />

          <SelectFilter
            label="Schedule Filter"
            value={filterMode}
            onChange={setFilterMode}
            options={["Today", "All Stages"]}
          />
        </div>
      </GlassCard>

      {/* Vertical Timeline Schedule */}
      <GlassCard padding="none" className="p-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : filteredStages.length === 0 ? (
          <div className="py-8 text-center">
            <EmptyState
              title="No schedule created."
              description="No timeline stages match your search query."
              actionLabel="Create Timeline"
              onAction={() => setEditModalOpen(true)}
            />
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/30">
            {filteredStages.map((stg, index) => {
              const isLive = stg.status === "LIVE";

              return (
                <motion.div
                  key={stg.id}
                  className="relative group cursor-pointer"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, type: "spring", stiffness: 300, damping: 28 }}
                  whileHover={{ y: -2, scale: 1.005 }}
                  onClick={() => setSelectedStage(stg)}
                >
                  {/* Timeline Dot Connector */}
                  <div
                    className={cn(
                      "absolute -left-6 top-5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-transform group-hover:scale-125",
                      isLive
                        ? "border-[#34C759] bg-[#34C759] text-white shadow-[0_0_12px_rgba(52,199,89,0.6)]"
                        : stg.status === "Completed"
                        ? "border-[#F6C445] bg-[#F6C445]"
                        : "border-white/50 bg-[#111827]"
                    )}
                  >
                    {isLive && <span className="h-2 w-2 rounded-full bg-white animate-ping" />}
                  </div>

                  {/* Stage Card */}
                  <div className="rounded-2xl border border-white/40 bg-white/35 p-4.5 transition-all hover:bg-white/60 hover:shadow-md">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-[#F6C445] bg-white/40 px-2.5 py-1 rounded-xl shrink-0">
                          {stg.timeDisplay}
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-[#111827] group-hover:text-[#F6C445] transition-colors">
                            {stg.title}
                          </h3>
                          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#6B7280]">
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={13} className="text-[#9CA3AF]" /> {stg.venue}
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <Users size={13} className="text-[#9CA3AF]" /> {stg.ownerTeam}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <StatusBadge status={stg.status} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Stage Details Drawer */}
      <StageDrawer stage={selectedStage} onClose={() => setSelectedStage(null)} />

      {/* Edit Timeline Modal */}
      <EditTimelineModal open={editModalOpen} onClose={() => setEditModalOpen(false)} />
    </div>
  );
}
