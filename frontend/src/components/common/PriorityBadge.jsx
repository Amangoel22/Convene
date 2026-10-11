// Purpose: renders a compact priority label for task and issue records.
import { cn } from "@/lib/utils";
import { COLORS } from "@/constants/colors";

const priorityStyles = { Critical: `text-[${COLORS.error}] font-bold`, High: `text-[${COLORS.warning}] font-bold`, Medium: `text-[${COLORS.primary}] font-bold`, Low: `text-[${COLORS.grayMuted}] font-bold` };

// Renders a priority label using centralized color tokens.
export function PriorityBadge({ priority = "Medium", className }) {
  return <span className={cn("text-xs font-bold whitespace-nowrap inline-block tracking-wide", priorityStyles[priority] ?? priorityStyles.Medium, className)}>{priority}</span>;
}
