import { cn } from "@/lib/utils";

const priorityStyles = {
  Critical: "text-[#D6453D] font-bold",
  High: "text-[#D4930E] font-bold",
  Medium: "text-[#3B6FD4] font-bold",
  Low: "text-[#8E99A8] font-bold"
};

export function PriorityBadge({ priority = "Medium", className }) {
  return (
    <span
      className={cn(
        "text-xs font-bold whitespace-nowrap inline-block tracking-wide",
        priorityStyles[priority] ?? priorityStyles.Medium,
        className
      )}
    >
      {priority}
    </span>
  );
}
