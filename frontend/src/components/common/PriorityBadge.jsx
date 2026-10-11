// Purpose: renders a compact priority label for task and issue records.
import { cn } from "@/lib/utils";
import { COLORS } from "@/constants/colors";

const priorityStyles = { Critical: `text-[${COLORS.error}] weight-bold`, High: `text-[${COLORS.warning}] weight-bold`, Medium: `text-[${COLORS.primary}] weight-bold`, Low: `text-[${COLORS.grayMuted}] weight-bold` };

// Renders a priority label using centralized color tokens.
export function PriorityBadge({ priority = "Medium", className }) {
  return <span className={cn("type-xs weight-bold whitespace-nowrap inline-block tracking-wide", priorityStyles[priority] ?? priorityStyles.Medium, className)}>{priority}</span>;
}
