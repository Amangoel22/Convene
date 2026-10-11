// Purpose: ParticipantsComponents implements this source module.
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLORS } from "@/constants/colors";

export function MiniBadge({ children, tone = "neutral" }) {
  const tones = {
    neutral: `bg-[${COLORS.grayBg}] text-[${COLORS.grayText}]`,
    success: `bg-[${COLORS.success}]/10 text-[${COLORS.success}]`,
    warning: `bg-[${COLORS.warning}]/10 text-[${COLORS.warning}]`,
    info: `bg-[${COLORS.primary}]/10 text-[${COLORS.primary}]`,
    error: `bg-[${COLORS.error}]/10 text-[${COLORS.error}]`,
  };
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 type-11 weight-bold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function StatusPill({ status }) {
  const statusStyles = {
    Unconfirmed: `bg-[${COLORS.warning}]/10 text-[${COLORS.warning}] border-[${COLORS.warning}]/20`,
    Confirmed: `bg-[${COLORS.success}]/10 text-[${COLORS.success}] border-[${COLORS.success}]/20`,
    "Checked In": `bg-[${COLORS.primary}]/10 text-[${COLORS.primary}] border-[${COLORS.primary}]/20`,
    Absent: `bg-[${COLORS.grayMuted}]/10 text-[${COLORS.grayText}] border-[${COLORS.grayMuted}]/20`,
    Withdrawn: `bg-[${COLORS.purple}]/10 text-[${COLORS.purple}] border-[${COLORS.purple}]/20`,
    Rejected: `bg-[${COLORS.error}]/10 text-[${COLORS.error}] border-[${COLORS.error}]/20`,
    Blocked: `bg-[${COLORS.error}]/10 text-[${COLORS.error}] border-[${COLORS.error}]/20`,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 type-10 weight-black uppercase tracking-wider border",
        statusStyles[status] || "bg-token-field text-token-secondary",
      )}
    >
      {status}
    </span>
  );
}

export function ParticipantStatusSelect({ status, onChange, isLead = true }) {
  const statusColors = {
    Unconfirmed: `text-[${COLORS.warning}] bg-[${COLORS.warning}]/10 border-[${COLORS.warning}]/30`,
    Confirmed: `text-[${COLORS.success}] bg-[${COLORS.success}]/10 border-[${COLORS.success}]/30`,
    "Checked In": `text-[${COLORS.primary}] bg-[${COLORS.primary}]/10 border-[${COLORS.primary}]/30`,
    Absent: `text-[${COLORS.grayText}] bg-[${COLORS.grayMuted}]/10 border-[${COLORS.grayMuted}]/30`,
    Withdrawn: `text-[${COLORS.purple}] bg-[${COLORS.purple}]/10 border-[${COLORS.purple}]/30`,
    Rejected: `text-[${COLORS.error}] bg-[${COLORS.error}]/10 border-[${COLORS.error}]/30`,
    Blocked: `text-[${COLORS.error}] bg-[${COLORS.error}]/10 border-[${COLORS.error}]/30`,
  };

  if (!isLead) {
    return (
      <span
        className={cn(
          "inline-flex h-7 items-center rounded-full px-2.5 type-10 weight-black uppercase tracking-wider border",
          statusColors[status] || "bg-token-field text-token-secondary border-token-subtle",
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
        className={cn(
          "h-7 cursor-pointer appearance-none rounded-full pl-2.5 pr-6 type-10 weight-black uppercase tracking-wider border outline-none transition-all shadow-sm",
          statusColors[status] || "bg-token-field text-token-secondary border-token-subtle",
        )}
      >
        <option value="Checked In" className="surface-card-token text-token-primary font-sans weight-semibold capitalize">Checked In</option>
        <option value="Confirmed" className="surface-card-token text-token-primary font-sans weight-semibold capitalize">Confirmed</option>
        <option value="Unconfirmed" className="surface-card-token text-token-primary font-sans weight-semibold capitalize">Unconfirmed</option>
        <option value="Absent" className="surface-card-token text-token-primary font-sans weight-semibold capitalize">Absent</option>
        <option value="Withdrawn" className="surface-card-token text-token-primary font-sans weight-semibold capitalize">Withdrawn</option>
        <option value="Blocked" className="surface-card-token text-token-primary font-sans weight-semibold capitalize">Blocked</option>
        <option value="Rejected" className="surface-card-token text-token-primary font-sans weight-semibold capitalize">Rejected</option>
      </select>
    </div>
  );
}

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
          <option key={option} value={option} className="surface-card-token text-token-primary">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
