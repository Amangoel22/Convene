import { cn } from "@/lib/utils";

const priorityStyles = {
  Critical: "border-[#FF453A]/40 bg-[#FF453A]/18 text-[#f87171]",
  High: "border-[#FF9F0A]/40 bg-[#FF9F0A]/18 text-[#fbbf24]",
  Medium: "border-[#007AFF]/40 bg-[#007AFF]/18 text-[#38bdf8]",
  Low: "border-white/20 bg-white/10 text-[#cbd5e1]"
};

export function PriorityBadge({ priority = "Medium", className }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        priorityStyles[priority] ?? priorityStyles.Medium,
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          priority === "Critical"
            ? "bg-[#FF453A] animate-pulse"
            : priority === "High"
            ? "bg-[#FF9F0A]"
            : priority === "Medium"
            ? "bg-[#007AFF]"
            : "bg-[#9CA3AF]"
        )}
      />
      {priority}
    </span>
  );
}
