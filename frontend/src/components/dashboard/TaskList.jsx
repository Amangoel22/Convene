import { Check, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { todayTasks } from "@/data/dashboard";
import { GlassCard } from "@/components/glass/GlassCard";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";

export function TaskList() {
  return (
    <GlassCard elevation="main" className="h-full">
      <SectionHeader title="Today's Tasks" description="Items needing organizer attention" actionLabel="View all" />
      <div className="space-y-2">
        {todayTasks.map((task) => (
          <motion.div
            key={task.id}
            className="rounded-xl border border-white/45 bg-white/35 px-3 py-2 transition-colors hover:border-white/70 hover:bg-white/55"
            whileHover={{ y: -1, scale: 1.005, boxShadow: "0 6px 20px rgba(31,41,55,0.06)" }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
          >
            <div className="flex items-center justify-between gap-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs font-semibold text-[#111827]">{task.title}</p>
                  <PriorityBadge priority={task.priority} />
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-[#6B7280]">
                  <span className="truncate">{task.department}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} strokeWidth={1.75} />
                    {task.dueTime}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <UserAvatar initials={task.assignee} className="h-6 w-6 text-[10px]" />
                <motion.button
                  className="flex h-6 w-6 min-h-0 shrink-0 items-center justify-center rounded-full bg-white/60 text-[#34C759] hover:bg-white"
                  aria-label={`Complete ${task.title}`}
                  whileHover={{ scale: 1.15, rotate: -4 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 520, damping: 22 }}
                >
                  <Check size={13} strokeWidth={2} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
