// Purpose: ParticipantsComponents implements this source module.
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PARTICIPANT_STATUSES,
  PARTICIPANT_STATUS_PILL_CLASSES,
  PARTICIPANT_STATUS_TEXT_CLASSES,
} from "@/constants/statuses";

const MINI_BADGE_TONE_CLASSES = {
  neutral: "bg-token-field text-token-secondary",
  success: "bg-token-success/10 text-token-success",
  warning: "bg-token-warning/10 text-token-warning",
  info: "bg-token-accent/10 text-token-accent",
  error: "bg-token-error/10 text-token-error",
};

// Renders a compact semantic badge for supplementary participant metadata.
export function MiniBadge({ children, tone = "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 type-11 weight-bold",
        MINI_BADGE_TONE_CLASSES[tone] ?? MINI_BADGE_TONE_CLASSES.neutral,
      )}
    >
      {children}
    </span>
  );
}

// Renders a participant status with a semantic border and background treatment.
export function StatusPill({ status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 type-10 weight-black uppercase tracking-wider border",
        PARTICIPANT_STATUS_PILL_CLASSES[status] ??
          "bg-token-field text-token-secondary border-token-subtle",
      )}
    >
      {status}
    </span>
  );
}

// Purpose: render a participant status as restrained text without a filled chip.
export function StatusText({ status }) {
  return (
    <span
      className={cn(
        "type-xs weight-bold",
        PARTICIPANT_STATUS_TEXT_CLASSES[status] ?? "text-token-secondary",
      )}
    >
      {status || "Confirmed"}
    </span>
  );
}

// Lets organizing leads update a participant status while preserving read-only access.
export function ParticipantStatusSelect({
  status,
  onChange,
  isLead = true,
  disabled = false,
}) {
  const statusClasses =
    PARTICIPANT_STATUS_PILL_CLASSES[status] ??
    "bg-token-field text-token-secondary border-token-subtle";

  if (!isLead || disabled) {
    return (
      <span
        className={cn(
          "inline-flex h-7 items-center rounded-full px-2.5 type-10 weight-black uppercase tracking-wider border",
          statusClasses,
        )}
      >
        {status || "Confirmed"}
      </span>
    );
  }

  return (
    <div
      className="relative inline-flex items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <select
        value={status || "Confirmed"}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "h-7 cursor-pointer appearance-none rounded-full pl-2.5 pr-6 type-10 weight-black uppercase tracking-wider border outline-none transition-all shadow-sm",
          statusClasses,
        )}
      >
        {PARTICIPANT_STATUSES.map((option) => (
          <option
            key={option}
            value={option}
            className="surface-card-token text-token-primary font-sans weight-semibold capitalize"
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

// Renders a reusable filter select with an accessible label.
export function SelectFilter({ value, onChange, options, label }) {
  return (
    <div className="relative inline-flex items-center">
      <label className="sr-only">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 cursor-pointer appearance-none rounded-full field-token border border-token pl-3.5 pr-8 type-xs weight-semibold text-token-primary outline-none hover:hover-token transition-colors"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="surface-card-token text-token-primary"
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
