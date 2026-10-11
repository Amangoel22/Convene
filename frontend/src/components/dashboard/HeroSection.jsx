// Purpose: HeroSection implements this source module.
import { ArrowRight, Radio } from "lucide-react";
import { eventSummary, timelineStages } from "@/data/dashboard";
import { Badge } from "@/components/ui/Badge";
import { Countdown } from "@/components/common/Countdown";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassCard } from "@/components/glass/GlassCard";
import { ProgressTimeline } from "@/components/common/ProgressTimeline";

export function HeroSection() {
  return (
    <GlassCard elevation="hero" padding="none" className="overflow-hidden">
      <div className="relative p-5 md:p-6">
        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-2.5 flex flex-wrap items-center gap-3">
                <Badge tone="success">
                  <Radio className="mr-1 h-3.5 w-3.5" strokeWidth={1.75} />
                  Live Now
                </Badge>
                <span className="type-xs weight-medium text-token-secondary">{eventSummary.date}</span>
              </div>
              <p className="type-xs weight-semibold uppercase tracking-[0.18em] text-token-muted">Current Event</p>
              <h2 className="mt-1 type-2xl weight-bold leading-tight text-token-primary md:type-3xl">{eventSummary.name}</h2>
              <p className="mt-2 max-w-2xl type-xs leading-5 text-token-secondary">
                Mentoring is active across four labs. Keep owners visible, close urgent tasks, and prepare the judging transition.
              </p>
            </div>
            <Countdown label="Time to next stage" value={eventSummary.countdown} description="Judging preparation begins next" />
          </div>

          <ProgressTimeline progress={eventSummary.progress} stages={timelineStages} />

          <div>
            <GlassButton variant="primary" icon={<ArrowRight size={16} strokeWidth={1.75} />} className="h-9 px-4 type-xs">
              Open run of show
            </GlassButton>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
