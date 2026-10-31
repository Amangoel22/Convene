// Purpose: StatusBadge implements this source module.
import { cn } from "@/lib/utils";
import { STATUS_TEXT_CLASSES } from "@/constants/colors";

export function StatusBadge({ status, children, className }) {
  return (
    <span
      className={cn(
        "type-xs weight-semibold whitespace-nowrap inline-block",
        STATUS_TEXT_CLASSES[status] ?? STATUS_TEXT_CLASSES.upcoming,
        className
      )}
    >
      {children ?? status}
    </span>
  );
}
