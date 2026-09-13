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
        "inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold",
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
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border",
        statusStyles[status] || "bg-gray-100 text-gray-700",
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
  };

  if (!isLead) {
    return (
      <span
        className={cn(
          "inline-flex h-7 items-center rounded-full px-2.5 text-[10px] font-black uppercase tracking-wider border",
          statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200",
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
          "h-7 cursor-pointer appearance-none rounded-full pl-2.5 pr-6 text-[10px] font-black uppercase tracking-wider border outline-none transition-all shadow-sm",
          statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200",
        )}
      >
        <option value="Checked In" className="bg-white text-[#1A1D23] font-sans font-semibold capitalize">Checked In</option>
        <option value="Confirmed" className="bg-white text-[#1A1D23] font-sans font-semibold capitalize">Confirmed</option>
        <option value="Unconfirmed" className="bg-white text-[#1A1D23] font-sans font-semibold capitalize">Unconfirmed</option>
        <option value="Absent" className="bg-white text-[#1A1D23] font-sans font-semibold capitalize">Absent</option>
        <option value="Withdrawn" className="bg-white text-[#1A1D23] font-sans font-semibold capitalize">Withdrawn</option>
        <option value="Rejected" className="bg-white text-[#1A1D23] font-sans font-semibold capitalize">Rejected</option>
      </select>
      <ChevronDown
        size={11}
        strokeWidth={2}
        className="absolute right-2 text-current pointer-events-none opacity-70"
      />
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
        className="h-9 cursor-pointer appearance-none rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] pl-3.5 pr-8 text-xs font-semibold text-[#1A1D23] outline-none hover:bg-[#E8ECF1] transition-colors"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-white text-[#1A1D23]">
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        strokeWidth={2}
        className="absolute right-3 text-[#8E99A8] pointer-events-none"
      />
    </div>
  );
}
