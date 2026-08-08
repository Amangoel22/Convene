import { schedule } from "@/data/dashboard";
import { GlassCard } from "@/components/glass/GlassCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatusBadge } from "@/components/common/StatusBadge";

export function ScheduleCard() {
  return (
    <GlassCard elevation="main" className="h-full">
      <SectionHeader title="Today's Schedule" description="Current and upcoming activities" />
      <div className="space-y-4">
        {schedule.map((item) => (
          <div key={`${item.time}-${item.title}`} className="grid grid-cols-[56px_1fr] gap-4">
            <p className="pt-1 text-sm font-bold tabular-nums text-[#111827]">{item.time}</p>
            <div className="relative rounded-[20px] border border-white/45 bg-white/35 p-4 transition-colors hover:border-white/70 hover:bg-white/55">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{item.title}</p>
                  <p className="mt-1 text-xs font-medium text-[#9CA3AF]">{item.location}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
