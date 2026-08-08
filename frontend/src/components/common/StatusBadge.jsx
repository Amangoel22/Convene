import { Badge } from "@/components/ui/Badge";

const statusTone = {
  Todo: "neutral",
  "In Progress": "info",
  Blocked: "warning",
  Done: "success",
  Registered: "neutral",
  Confirmed: "info",
  "Checked In": "success",
  Rejected: "error",
  Completed: "success",
  current: "success",
  complete: "neutral",
  upcoming: "neutral"
};

export function StatusBadge({ status, children, className }) {
  return (
    <Badge tone={statusTone[status] ?? "neutral"} className={className}>
      {children ?? status}
    </Badge>
  );
}
