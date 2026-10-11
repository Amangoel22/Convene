// Purpose: ScheduleCard implements this source module.
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
            <p className="pt-1 type-sm weight-bold tabular-nums text-token-primary">{item.time}</p>
            <div className="relative rounded-[20px] border border-token-inverse/45 surface-card-token/35 p-4 transition-colors hover:border-token-inverse/70 hover:surface-card-token/55">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="type-sm weight-semibold text-token-primary">{item.title}</p>
                  <p className="mt-1 type-xs weight-medium text-token-muted">{item.location}</p>
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
