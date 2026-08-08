import { GlassCard } from "@/components/glass/GlassCard";

const toneClasses = {
  gold: "text-[#7a5a00]",
  info: "text-[#0056b3]",
  warning: "text-[#a45d00]",
  success: "text-[#157f37]"
};

export function MetricCard({ metric }) {
  return (
    <GlassCard interactive elevation="metric" className="min-h-[148px]">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[42px] font-bold leading-none tabular-nums text-[#111827]">{metric.value}</p>
        <metric.icon className={`mt-1 h-5 w-5 ${toneClasses[metric.tone]}`} strokeWidth={1.75} />
      </div>
      <p className="mt-5 text-sm font-semibold text-[#111827]">{metric.label}</p>
      <p className="mt-1 text-sm font-medium leading-6 text-[#9CA3AF]">{metric.detail}</p>
    </GlassCard>
  );
}
