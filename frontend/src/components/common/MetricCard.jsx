// Purpose: MetricCard implements this source module.
import { GlassCard } from "@/components/glass/GlassCard";

const toneClasses = {
  gold: "text-token-warning-dark",
  info: "text-token-accent-dark",
  warning: "text-token-warning-dark",
  success: "text-token-success-dark"
};

export function MetricCard({ metric }) {
  return (
    <GlassCard interactive elevation="metric" className="min-h-[148px]">
      <div className="flex items-start justify-between gap-4">
        <p className="type-42 weight-bold leading-none tabular-nums text-token-primary">{metric.value}</p>
        <metric.icon className={`mt-1 h-5 w-5 ${toneClasses[metric.tone]}`} strokeWidth={1.75} />
      </div>
      <p className="mt-5 type-sm weight-semibold text-token-primary">{metric.label}</p>
      <p className="mt-1 type-sm weight-medium leading-6 text-token-muted">{metric.detail}</p>
    </GlassCard>
  );
}
