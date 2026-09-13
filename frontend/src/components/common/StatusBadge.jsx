import { cn } from "@/lib/utils";
import { COLORS } from "@/constants/colors";

const statusTextStyles = {
  Todo: `text-[${COLORS.grayMuted}]`,
  "In Progress": `text-[${COLORS.primary}]`,
  Blocked: `text-[${COLORS.warning}]`,
  Done: `text-[${COLORS.success}]`,
  Unconfirmed: `text-[${COLORS.warning}]`,
  Registered: `text-[${COLORS.warning}]`,
  Confirmed: `text-[${COLORS.success}]`,
  "Checked In": `text-[${COLORS.primary}]`,
  Rejected: `text-[${COLORS.error}]`,
  Completed: `text-[${COLORS.success}]`,
  LIVE: `text-[${COLORS.success}]`,
  current: `text-[${COLORS.primary}]`,
  complete: `text-[${COLORS.grayMuted}]`,
  upcoming: `text-[${COLORS.grayText}]`
};

export function StatusBadge({ status, children, className }) {
  return (
    <span
      className={cn(
        "text-xs font-semibold whitespace-nowrap inline-block",
        statusTextStyles[status] ?? `text-[${COLORS.grayText}]`,
        className
      )}
    >
      {children ?? status}
    </span>
  );
}
