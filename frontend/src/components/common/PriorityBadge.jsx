// Purpose: renders a compact priority label for task and issue records.
import { cn } from "@/lib/utils";
import { PRIORITY_TEXT_CLASSES } from "@/constants/colors";

// Renders a priority label using centralized color tokens.
export function PriorityBadge({ priority = "Medium", className }) {
  return (
    <span
      className={cn(
        "type-xs weight-bold whitespace-nowrap inline-block tracking-wide",
        PRIORITY_TEXT_CLASSES[priority] ?? PRIORITY_TEXT_CLASSES.Medium,
        className,
      )}
    >
      {priority}
    </span>
  );
}
