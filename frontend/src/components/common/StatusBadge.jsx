import { cn } from "@/lib/utils";

const statusTextStyles = {
  Todo: "text-[#8E99A8]",
  "In Progress": "text-[#3B6FD4]",
  Blocked: "text-[#D4930E]",
  Done: "text-[#22A65E]",
  Unconfirmed: "text-[#D4930E]",
  Registered: "text-[#D4930E]",
  Confirmed: "text-[#22A65E]",
  "Checked In": "text-[#3B6FD4]",
  Rejected: "text-[#D6453D]",
  Completed: "text-[#22A65E]",
  LIVE: "text-[#22A65E]",
  current: "text-[#3B6FD4]",
  complete: "text-[#8E99A8]",
  upcoming: "text-[#5A6577]"
};

export function StatusBadge({ status, children, className }) {
  return (
    <span
      className={cn(
        "text-xs font-semibold whitespace-nowrap inline-block",
        statusTextStyles[status] ?? "text-[#5A6577]",
        className
      )}
    >
      {children ?? status}
    </span>
  );
}
