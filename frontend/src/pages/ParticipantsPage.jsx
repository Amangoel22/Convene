import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  FileDown,
  FileUp,
  Plus,
  QrCode,
  Search,
  Upload,
  X,
  Award,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassModal } from "@/components/glass/GlassModal";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAppStore } from "@/store/useAppStore";

const filterOptions = {
  department: [
    "All Departments",
    "Registration",
    "Hospitality",
    "Operations",
    "Tech",
    "Stage",
    "Logistics",
  ],
  status: [
    "All Statuses",
    "Unconfirmed",
    "Confirmed",
    "Checked In",
    "Rejected",
  ],
  college: ["All Colleges"],
};

function SelectFilter({ value, onChange, options, label }) {
  return (
    <div className="relative inline-flex items-center">
      <label className="sr-only">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 cursor-pointer appearance-none rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] pl-3.5 pr-8 text-xs font-semibold text-[#1A1D23] outline-none hover:bg-[#E8ECF1] transition-colors"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-white text-[#1A1D23]"
          >
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

function useDebouncedValue(value, delay = 180) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function MiniBadge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-[#F0F2F5] text-[#5A6577]",
    success: "bg-[#22A65E]/10 text-[#22A65E]",
    warning: "bg-[#D4930E]/10 text-[#D4930E]",
    info: "bg-[#3B6FD4]/10 text-[#3B6FD4]",
    error: "bg-[#D6453D]/10 text-[#D6453D]",
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

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3">
      <p className="text-[11px] font-semibold text-[#8E99A8]">{label}</p>
      <p className="mt-0.5 truncate text-sm font-bold text-[#1A1D23]">
        {value || "N/A"}
      </p>
    </div>
  );
}

function ParticipantDrawer({
  team,
  member,
  onClose,
  isLead,
  onUpdateTeamStatus,
  onUpdateMemberStatus,
  onSaveNotes,
}) {
  if (!team) return null;

  const isIndividual = Boolean(member);
  const currentStatus = isIndividual ? member.status || "Confirmed" : team.status || "Confirmed";
  const currentNotes = isIndividual ? member.notes || "" : team.notes || "";

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(currentNotes);

  useEffect(() => {
    setNoteText(currentNotes);
    setIsEditingNote(false);
  }, [team?.id, member?.id, currentNotes]);

  const handleStatusChange = (newStatus) => {
    if (isIndividual) {
      onUpdateMemberStatus(team.id, member.id, newStatus);
    } else {
      onUpdateTeamStatus(team.id, newStatus);
    }
  };

  const handleSaveNoteSubmit = async () => {
    await onSaveNotes(isIndividual ? "member" : "team", team.id, member?.id, noteText);
    setIsEditingNote(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        className="fixed bottom-4 right-4 top-4 z-50 w-[min(520px,calc(100vw-32px))] overflow-y-auto rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-6 shadow-xl text-[#1A1D23]"
        initial={{ x: 540, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 540, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <StatusPill status={currentStatus} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E99A8]">
                {isIndividual ? "Teammate Profile" : "Team Overview"}
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-[#1A1D23]">
              {isIndividual ? member.name : `${team.team}: ${team.teamName}`}
            </h2>
            {isIndividual && (
              <p className="mt-0.5 text-xs font-semibold text-[#5A6577]">
                {team.team}: {team.teamName} •{" "}
                {member.role === "Leader" ? "Team Leader" : "Team Member"}
              </p>
            )}
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23]"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Change Status Control inside View Details Drawer (Leads only) */}
        {isLead && (
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#EBF0FA] border border-[#3B6FD4]/20 p-3.5">
            <span className="text-xs font-bold text-[#3B6FD4]">
              {isIndividual ? "Update Participant Status" : "Update Team Status"}
            </span>
            <div className="relative inline-flex items-center">
              <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="cursor-pointer appearance-none rounded-full bg-white border border-[#3B6FD4]/30 pl-3 pr-7 py-1 text-xs font-bold text-[#1A1D23] outline-none shadow-sm"
              >
                {isIndividual ? (
                  <>
                    <option value="Checked In">Checked In</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Unconfirmed">Unconfirmed</option>
                    <option value="Absent">Absent</option>
                    <option value="Withdrawn">Withdrawn</option>
                    <option value="Rejected">Rejected</option>
                  </>
                ) : (
                  <>
                    <option value="Unconfirmed">Unconfirmed</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Checked In">Checked In</option>
                    <option value="Rejected">Rejected</option>
                  </>
                )}
              </select>
              <ChevronDown
                size={13}
                strokeWidth={2}
                className="absolute right-2.5 text-[#8E99A8] pointer-events-none"
              />
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {isIndividual ? (
            <>
              <Info label="Name" value={member.name} />
              <Info label="Phone Number" value={member.phone} />
              <Info label="Email" value={member.email} />
              <Info
                label="Role"
                value={member.role === "Leader" ? "Team Leader" : "Team Member"}
              />
              <Info label="College" value={member.college || team.college} />
              <Info label="Team" value={`${team.team}: ${team.teamName}`} />
            </>
          ) : (
            <>
              <Info label="College" value={team.college} />
              <Info label="Leader" value={team.leader.name} />
              <Info label="Contact (Leader)" value={team.leader.phone} />
              <Info label="Status" value={team.status || "Unconfirmed"} />
              <Info
                label="Certificates"
                value={team.certificates || "Pending"}
              />
              <Info label="Feedback" value={team.feedback || "None"} />
            </>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-bold text-[#1A1D23]">
            Team Members ({team.members.length})
          </h3>
          <div className="mt-3 space-y-2">
            {team.members.map((m) => (
              <div
                key={m.id || m.email}
                className={cn(
                  "rounded-2xl border p-3 transition-colors",
                  isIndividual && (m.id === member.id || m.email === member.email)
                    ? "bg-[#EBF0FA] border-[#3B6FD4]/30"
                    : "bg-[#F7F8FA] border-[rgba(0,0,0,0.06)]",
                )}
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    initials={m.initials}
                    image={m.avatar}
                    className="bg-[#EBF0FA] text-[#3B6FD4]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#1A1D23]">
                      {m.name}
                    </p>
                    <p className="truncate text-xs font-medium text-[#8E99A8]">
                      {m.email}
                    </p>
                  </div>
                  <MiniBadge tone={m.role === "Leader" ? "warning" : "neutral"}>
                    {m.role === "Leader" ? "Leader" : "Member"}
                  </MiniBadge>
                </div>
                <p className="mt-2 text-xs font-medium text-[#5A6577]">
                  {m.phone}
                </p>
              </div>
            ))}
          </div>
        </div>

        {isLead && (
          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            <GlassButton
              variant="primary"
              icon={<Check size={16} strokeWidth={2} />}
              onClick={() => handleStatusChange("Checked In")}
              className="justify-start rounded-full text-xs"
            >
              Mark Check-In
            </GlassButton>
            {isIndividual ? (
              <GlassButton
                variant="secondary"
                icon={<QrCode size={16} strokeWidth={2} />}
                className="justify-start rounded-full text-xs"
              >
                Generate QR
              </GlassButton>
            ) : (
              <GlassButton
                variant="secondary"
                icon={<Award size={16} strokeWidth={2} />}
                className="justify-start rounded-full text-xs"
              >
                Issue Certificate
              </GlassButton>
            )}
            <GlassButton
              variant="secondary"
              icon={<Plus size={16} strokeWidth={2} />}
              onClick={() => setIsEditingNote(true)}
              className="justify-start rounded-full text-xs"
            >
              {isEditingNote ? "Editing Note..." : "Add Note"}
            </GlassButton>
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-[#1A1D23]">
              {isIndividual ? "Participant Internal Notes" : "Team Internal Notes"}
            </p>
            {!isEditingNote && isLead && (
              <button
                onClick={() => setIsEditingNote(true)}
                className="text-xs font-bold text-[#3B6FD4] hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          {isEditingNote ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={
                  isIndividual
                    ? "Enter notes specific to this participant..."
                    : "Enter notes specific to this team..."
                }
                rows={3}
                className="w-full rounded-xl border border-[rgba(0,0,0,0.12)] p-2.5 text-xs font-semibold text-[#1A1D23] outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsEditingNote(false)}
                  className="px-3 py-1 rounded-full text-xs font-bold text-[#5A6577] bg-[#E8ECF1]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNoteSubmit}
                  className="px-3 py-1 rounded-full text-xs font-bold text-white bg-[#3B6FD4]"
                >
                  Save Note
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1.5 text-sm leading-relaxed text-[#5A6577] font-medium">
              {currentNotes || (isIndividual ? "No participant notes added yet." : "No team notes added yet.")}
            </p>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function ImportModal({ open, onClose }) {
  const previewRows = [];
  return (
    <GlassModal
      open={open}
      className="w-[min(720px,calc(100vw-32px))] max-w-none bg-white border border-[rgba(0,0,0,0.08)] rounded-3xl p-6 text-[#1A1D23]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1A1D23]">
            Import participants
          </h2>
          <p className="mt-1 text-xs font-medium text-[#5A6577]">
            Upload a CSV exported from your registration platform.
          </p>
        </div>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23]"
          onClick={onClose}
          aria-label="Close import modal"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>
      <div className="mt-6 rounded-2xl border-2 border-dashed border-[rgba(0,0,0,0.12)] bg-[#F7F8FA] p-8 text-center">
        <Upload className="mx-auto text-[#3B6FD4]" size={30} strokeWidth={2} />
        <p className="mt-3 text-sm font-bold text-[#1A1D23]">Drop CSV here</p>
        <p className="mt-1 text-xs font-medium text-[#8E99A8]">
          Team, leader, college, and members columns supported.
        </p>
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)]">
        {previewRows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[1fr_1fr_0.8fr] gap-3 border-b border-[rgba(0,0,0,0.06)] px-4 py-3 text-xs last:border-b-0"
          >
            <span className="truncate font-semibold text-[#1A1D23]">
              {row.team}: {row.teamName}
            </span>
            <span className="truncate text-[#5A6577]">{row.college}</span>
            <span className="truncate text-[#8E99A8]">
              {row.members.length} members
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <GlassButton onClick={onClose} className="rounded-full">
          Cancel
        </GlassButton>
        <GlassButton
          variant="primary"
          icon={<FileUp size={16} strokeWidth={2} />}
          className="rounded-full"
        >
          Import CSV
        </GlassButton>
      </div>
    </GlassModal>
  );
}

function StatusPill({ status }) {
  const statusStyles = {
    Unconfirmed: "bg-[#D4930E]/10 text-[#D4930E] border-[#D4930E]/20",
    Confirmed: "bg-[#22A65E]/10 text-[#22A65E] border-[#22A65E]/20",
    "Checked In": "bg-[#3B6FD4]/10 text-[#3B6FD4] border-[#3B6FD4]/20",
    Absent: "bg-[#8E99A8]/10 text-[#5A6577] border-[#8E99A8]/20",
    Withdrawn: "bg-[#9333EA]/10 text-[#9333EA] border-[#9333EA]/20",
    Rejected: "bg-[#D6453D]/10 text-[#D6453D] border-[#D6453D]/20",
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

function ParticipantStatusSelect({ status, onChange }) {
  const statusColors = {
    Unconfirmed: "text-[#D4930E] bg-[#D4930E]/10 border-[#D4930E]/30",
    Confirmed: "text-[#22A65E] bg-[#22A65E]/10 border-[#22A65E]/30",
    "Checked In": "text-[#3B6FD4] bg-[#3B6FD4]/10 border-[#3B6FD4]/30",
    Absent: "text-[#5A6577] bg-[#8E99A8]/10 border-[#8E99A8]/30",
    Withdrawn: "text-[#9333EA] bg-[#9333EA]/10 border-[#9333EA]/30",
    Rejected: "text-[#D6453D] bg-[#D6453D]/10 border-[#D6453D]/30",
  };

  return (
    <div className="relative inline-flex items-center" onClick={(e) => e.stopPropagation()}>
      <select
        value={status || "Confirmed"}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-7 cursor-pointer appearance-none rounded-full pl-2.5 pr-6 text-[10px] font-black uppercase tracking-wider border outline-none transition-all shadow-sm",
          statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200"
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
        strokeWidth={2.5}
        className="absolute right-2 pointer-events-none opacity-70"
      />
    </div>
  );
}

function CreateParticipantModal({ open, onClose, onSubmit, teams }) {
  const [mode, setMode] = useState("newTeam"); // "newTeam" | "existingTeam" | "individual"
  const [teamName, setTeamName] = useState("");
  const [college, setCollege] = useState("");
  const [teamMembers, setTeamMembers] = useState([
    { name: "", email: "", phone: "" },
  ]);
  const [targetTeamId, setTargetTeamId] = useState(teams[0]?.id || "");
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPhone, setMemberPhone] = useState("");

  const handleAddMember = () => {
    if (teamMembers.length < 4) {
      setTeamMembers((prev) => [...prev, { name: "", email: "", phone: "" }]);
    }
  };

  const handleRemoveMember = (idx) => {
    if (teamMembers.length > 1) {
      setTeamMembers((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleMemberChange = (idx, field, value) => {
    setTeamMembers((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      mode,
      teamName,
      college,
      teamMembers,
      leaderName: teamMembers[0]?.name || "",
      leaderEmail: teamMembers[0]?.email || "",
      leaderPhone: teamMembers[0]?.phone || "",
      targetTeamId,
      memberName,
      memberEmail,
      memberPhone,
    });
  };

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      title="Create Participant / Registration"
    >
      {/* Mode Selector Tabs with polished UI */}
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-[#E8ECF1] p-1.5 border border-[rgba(0,0,0,0.06)] mb-6">
        {[
          ["newTeam", "Create Whole Team"],
          ["existingTeam", "Add to Existing Team"],
          ["individual", "Register Individual"],
        ].map(([mKey, label]) => (
          <button
            key={mKey}
            type="button"
            onClick={() => setMode(mKey)}
            className={cn(
              "px-2 py-2 text-xs font-bold rounded-xl transition-all text-center",
              mode === mKey
                ? "bg-white text-[#3B6FD4] shadow-sm border border-[rgba(0,0,0,0.04)] font-extrabold"
                : "text-[#5A6577] hover:text-[#1A1D23] font-semibold",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* MODE 1: Create Whole Team */}
        {mode === "newTeam" && (
          <>
            <div>
              <label className="text-xs font-bold text-[#1A1D23]">
                Team Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CyberKnights"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-semibold text-[#1A1D23] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#1A1D23]">
                College / Organization
              </label>
              <input
                type="text"
                required
                placeholder="e.g. IIT Bombay"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-semibold text-[#1A1D23] outline-none"
              />
            </div>

            {/* Team Members List (1 to 4 members) */}
            <div className="pt-2 border-t border-[rgba(0,0,0,0.06)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B6FD4]">
                  Team Members ({teamMembers.length}/4)
                </span>
                {teamMembers.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#3B6FD4] hover:text-[#2a54a7] transition-colors"
                  >
                    <Plus size={14} /> Add Teammate
                  </button>
                )}
              </div>

              {teamMembers.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#1A1D23]">
                      {idx === 0
                        ? "Member 1 (Team Leader - Mandatory)"
                        : `Member ${idx + 1}`}
                    </span>
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="text-xs font-bold text-[#D6453D] hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      required={idx === 0}
                      placeholder={
                        idx === 0 ? "Leader Full Name *" : "Teammate Full Name"
                      }
                      value={m.name}
                      onChange={(e) =>
                        handleMemberChange(idx, "name", e.target.value)
                      }
                      className="h-9 rounded-xl bg-white border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
                    />
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="Phone Number (10 digits)"
                      value={m.phone}
                      onChange={(e) =>
                        handleMemberChange(idx, "phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      className="h-9 rounded-xl bg-white border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={m.email}
                    onChange={(e) =>
                      handleMemberChange(idx, "email", e.target.value)
                    }
                    className="h-9 w-full rounded-xl bg-white border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* MODE 2: Add Member to Existing Team */}
        {mode === "existingTeam" && (
          <>
            <div>
              <label className="text-xs font-bold text-[#1A1D23]">
                Select Existing Target Team
              </label>
              <select
                value={targetTeamId}
                onChange={(e) => setTargetTeamId(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none cursor-pointer"
              >
                {teams.map((t) => (
                  <option
                    key={t.id}
                    value={t.id}
                    className="bg-white text-[#1A1D23]"
                  >
                    {t.team}: {t.teamName} ({t.college})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#1A1D23]">
                New Teammate Name
              </label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-semibold text-[#1A1D23] outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="email"
                required
                placeholder="Email Address"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="h-10 rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
              />
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="Phone Number (10 digits)"
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="h-10 rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
              />
            </div>
          </>
        )}

        {/* MODE 3: Register Individual */}
        {mode === "individual" && (
          <>
            <div>
              <label className="text-xs font-bold text-[#1A1D23]">
                Individual Participant Name
              </label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-semibold text-[#1A1D23] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#1A1D23]">
                College / Organization
              </label>
              <input
                type="text"
                placeholder="e.g. Stanford University"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-semibold text-[#1A1D23] outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="email"
                required
                placeholder="Email Address"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="h-10 rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
              />
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="Phone Number (10 digits)"
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="h-10 rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
              />
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end gap-3 pt-2">
          <GlassButton
            type="button"
            onClick={onClose}
            className="h-9 text-xs rounded-full"
          >
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            icon={<Plus size={15} />}
            className="h-9 text-xs rounded-full"
          >
            Save Participant
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}

export function ParticipantsPage() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState("All Statuses");
  const [college, setCollege] = useState("All Colleges");
  const [sort, setSort] = useState("Team A-Z");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [loading] = useState(false);

  const role = useAppStore((state) => state.role);
  const activeEvent = useAppStore((state) => state.activeEvent);
  const isLead = role === "lead";

  const loadEventTeams = useCallback(async () => {
    const token = localStorage.getItem("convene_token");
    let eventId = activeEvent?.id;

    try {
      if (!eventId && token) {
        const eventsRes = await fetch("http://localhost:8000/api/events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          if (eventsData.events?.length > 0) {
            eventId = eventsData.events[0].id;
          }
        }
      }

      if (!eventId) {
        if (activeEvent?.teams) {
          setTeams(activeEvent.teams);
        }
        return;
      }

      const res = await fetch(`http://localhost:8000/api/events/${eventId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        const rawTeams = data.event?.participantTeams || [];
        const rawParticipants = data.event?.participants || [];

        // Build a map of userId -> checkInStatus/internalNotes from rawParticipants
        const participantStatusMap = {};
        const participantNotesMap = {};
        rawParticipants.forEach((ep) => {
          const uId = ep.userId || ep.user?.id;
          if (uId) {
            let st = ep.internalNotes || ep.checkInStatus || "Confirmed";
            if (st === "Checked_In") st = "Checked In";
            participantStatusMap[uId] = st;
            participantNotesMap[uId] = ep.internalNotes || "";
          }
        });

        const mappedTeams = rawTeams.map((t) => {
          const leadMember =
            t.members?.find((m) => m.role === "lead") || t.members?.[0];
          const leader = leadMember?.user
            ? {
                name: leadMember.user.name,
                email: leadMember.user.email,
                phone: leadMember.user.phone || "N/A",
                initials: leadMember.user.name
                  ? leadMember.user.name.substring(0, 2).toUpperCase()
                  : "U",
              }
            : {
                name: "Team Lead",
                email: "lead@convene.test",
                phone: "N/A",
                initials: "TL",
              };

          const members = (t.members || []).map((m) => {
            const userId = m.user?.id || m.userId || m.id;
            const memberStatus = (userId && participantStatusMap[userId]) || "Confirmed";
            const memberNotes = (userId && participantNotesMap[userId]) || "";

            return {
              id: userId,
              name: m.user?.name || "Participant",
              email: m.user?.email || "participant@convene.test",
              phone: m.user?.phone || "N/A",
              college: t.description || "Convene Campus",
              role: m.role === "lead" ? "Team Lead" : "Member",
              status: memberStatus,
              notes: memberNotes,
              initials: m.user?.name
                ? m.user.name.substring(0, 2).toUpperCase()
                : "P",
            };
          });

          return {
            id: t.id,
            team: t.teamCode || t.name,
            teamName: t.name,
            college: t.description || "Convene Campus",
            status: t.status || "Confirmed",
            notes: t.internalNotes || "No team notes added yet.",
            leader,
            members,
          };
        });

        // Also map individual participants who aren't in team members
        const teamUserIds = new Set(
          mappedTeams.flatMap((t) => t.members.map((m) => m.id))
        );

        rawParticipants.forEach((ep) => {
          if (ep.user && !teamUserIds.has(ep.user.id)) {
            let memberStatus = ep.internalNotes || ep.checkInStatus || "Confirmed";
            if (memberStatus === "Checked_In") memberStatus = "Checked In";
            const pNotes = ep.internalNotes || "No participant notes added yet.";

            mappedTeams.push({
              id: ep.id,
              team: ep.participantCode || `IND-${ep.user.id.substring(0, 4)}`,
              teamName: `${ep.user.name}'s Team`,
              college: "Individual",
              status: memberStatus,
              notes: pNotes,
              leader: {
                name: ep.user.name,
                email: ep.user.email,
                phone: ep.user.phone || "N/A",
                initials: ep.user.name
                  ? ep.user.name.substring(0, 2).toUpperCase()
                  : "P",
              },
              members: [
                {
                  id: ep.user.id,
                  name: ep.user.name,
                  email: ep.user.email,
                  phone: ep.user.phone || "N/A",
                  college: "Individual",
                  role: "Team Lead",
                  status: memberStatus,
                  notes: pNotes,
                  initials: ep.user.name
                    ? ep.user.name.substring(0, 2).toUpperCase()
                    : "P",
                },
              ],
            });
          }
        });

        setTeams(mappedTeams);
        return;
      }
    } catch (err) {
      console.warn("Failed to fetch event teams from backend:", err.message);
    }

    if (activeEvent?.teams) {
      setTeams(activeEvent.teams);
    }
  }, [activeEvent]);

  useEffect(() => {
    loadEventTeams();
  }, [loadEventTeams]);

  const filteredTeams = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return teams
      .filter((team) => {
        const matchesSearch =
          !query ||
          [
            team.team,
            team.teamName,
            team.leader.name,
            team.college,
            team.status,
          ].some((value) => value && value.toLowerCase().includes(query));
        return (
          matchesSearch &&
          (status === "All Statuses" || team.status === status) &&
          (college === "All Colleges" || team.college === college)
        );
      })
      .sort((a, b) => {
        if (sort === "College") return a.college.localeCompare(b.college);
        if (sort === "Status") return a.status.localeCompare(b.status);
        return a.team.localeCompare(b.team, undefined, { numeric: true });
      });
  }, [college, debouncedSearch, sort, status, teams]);

  const handleCloseDrawer = () => {
    setSelectedTeam(null);
    setSelectedMember(null);
  };

  const handleUpdateTeamStatus = async (teamId, newStatus) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, status: newStatus } : t)),
    );
    setSelectedTeam((prev) =>
      prev && prev.id === teamId ? { ...prev, status: newStatus } : prev,
    );

    const token = localStorage.getItem("convene_token");
    try {
      await fetch(`http://localhost:8000/api/participants/teams/${teamId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.warn("Failed to update team status on backend:", err.message);
    }
  };

  const handleUpdateMemberStatus = async (teamId, memberId, newStatus) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          const updatedMembers = t.members.map((m) =>
            m.id === memberId ? { ...m, status: newStatus } : m
          );
          return { ...t, members: updatedMembers };
        }
        return t;
      })
    );

    const token = localStorage.getItem("convene_token");
    try {
      await fetch(`http://localhost:8000/api/participants/${memberId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ checkInStatus: newStatus }),
      });
    } catch (err) {
      console.warn("Failed to update status on backend:", err.message);
    }
  };

  const handleCreateParticipant = async (data) => {
    if (data.mode === "newTeam") {
      const validMembers = (data.teamMembers || [])
        .filter((m) => m.name && m.name.trim())
        .map((m, index) => ({
          name: m.name.trim(),
          email: m.email.trim() || `participant${index + 1}@convene.test`,
          phone: m.phone.trim() || "N/A",
          role: index === 0 ? "Leader" : "Member",
          initials: m.name.trim().substring(0, 2).toUpperCase(),
        }));

      const leaderInfo = validMembers[0] || {
        name: data.leaderName || "Team Lead",
        email: data.leaderEmail || "lead@convene.test",
        phone: data.leaderPhone || "N/A",
        initials: (data.leaderName || "TL").substring(0, 2).toUpperCase(),
      };

      const newTeamObj = {
        id: `t-${Date.now()}`,
        team: `TEAM-${teams.length + 101}`,
        teamName: data.teamName,
        college: data.college,
        status: "Unconfirmed",
        leader: {
          name: leaderInfo.name,
          email: leaderInfo.email,
          phone: leaderInfo.phone,
          initials: leaderInfo.initials,
        },
        members:
          validMembers.length > 0
            ? validMembers
            : [
                {
                  name: leaderInfo.name,
                  email: leaderInfo.email,
                  phone: leaderInfo.phone,
                  role: "Leader",
                  initials: leaderInfo.initials,
                },
              ],
        notes: "Manually registered whole team.",
      };
      setTeams((prev) => [newTeamObj, ...prev]);
    } else if (data.mode === "existingTeam") {
      setTeams((prev) =>
        prev.map((t) => {
          if (t.id === data.targetTeamId) {
            return {
              ...t,
              members: [
                ...t.members,
                {
                  name: data.memberName,
                  email: data.memberEmail,
                  phone: data.memberPhone,
                  role: "Member",
                  initials: data.memberName.substring(0, 2).toUpperCase(),
                },
              ],
            };
          }
          return t;
        }),
      );
    } else if (data.mode === "individual") {
      const indTeamObj = {
        id: `t-${Date.now()}`,
        team: `IND-${teams.length + 1}`,
        teamName: `${data.memberName}'s Team`,
        college: data.college || "Individual",
        status: "Unconfirmed",
        leader: {
          name: data.memberName,
          email: data.memberEmail,
          phone: data.memberPhone,
          initials: data.memberName.substring(0, 2).toUpperCase(),
        },
        members: [
          {
            name: data.memberName,
            email: data.memberEmail,
            phone: data.memberPhone,
            role: "Leader",
            initials: data.memberName.substring(0, 2).toUpperCase(),
          },
        ],
        notes: "Individual participant.",
      };
      setTeams((prev) => [indTeamObj, ...prev]);
    }
    setCreateModalOpen(false);

    // Persist to backend API database
    const token = localStorage.getItem("convene_token");
    const eventId = activeEvent?.id;
    if (eventId) {
      try {
        const res = await fetch(
          `http://localhost:8000/api/participants/${eventId}/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(data),
          },
        );
        if (res.ok) {
          await loadEventTeams();
        }
      } catch (err) {
        console.warn("Failed to persist registration to backend:", err.message);
      }
    }
  };

  const handleSaveNotes = async (type, teamId, memberId, noteText) => {
    const token = localStorage.getItem("convene_token");

    if (type === "member" && memberId) {
      setTeams((prev) =>
        prev.map((t) => {
          if (t.id === teamId) {
            const updatedMembers = t.members.map((m) =>
              m.id === memberId ? { ...m, notes: noteText } : m
            );
            return { ...t, members: updatedMembers };
          }
          return t;
        })
      );
      setSelectedMember((prev) => (prev && prev.id === memberId ? { ...prev, notes: noteText } : prev));

      try {
        await fetch(`http://localhost:8000/api/participants/${memberId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ checkInStatus: selectedMember?.status || "Confirmed", internalNotes: noteText }),
        });
      } catch (err) {
        console.warn("Failed to update participant notes on backend:", err.message);
      }
    } else {
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, notes: noteText } : t))
      );
      setSelectedTeam((prev) => (prev && prev.id === teamId ? { ...prev, notes: noteText } : prev));

      try {
        await fetch(`http://localhost:8000/api/participants/teams/${teamId}/notes`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ internalNotes: noteText }),
        });
      } catch (err) {
        console.warn("Failed to update team notes on backend:", err.message);
      }
    }
  };

  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1D23] md:text-3xl">
            Participants
          </h1>
          <p className="mt-1 text-sm text-[#5A6577] font-medium">
            Manage teams, check-ins, and event operations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {isLead && (
            <GlassButton
              variant="secondary"
              icon={<FileUp size={16} strokeWidth={2} />}
              onClick={() => setImportOpen(true)}
              className="rounded-full"
            >
              Import CSV
            </GlassButton>
          )}
          <GlassButton
            variant="secondary"
            icon={<FileDown size={16} strokeWidth={2} />}
            className="rounded-full"
          >
            Export
          </GlassButton>
          {isLead && (
            <GlassButton
              variant="primary"
              icon={<Plus size={16} strokeWidth={2} />}
              onClick={() => setCreateModalOpen(true)}
              className="rounded-full"
            >
              Create Participant
            </GlassButton>
          )}
        </div>
      </div>

      {/* Onboarding-style Participant Overview Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E99A8]">
            {filteredTeams.every((t) => t.members.length === 1)
              ? "Total Participants"
              : "Total Teams"}
          </p>
          <p className="mt-1 text-2xl font-bold text-[#1A1D23]">
            {filteredTeams.length}
          </p>
        </div>
        <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E99A8]">
            Checked In
          </p>
          <p className="mt-1 text-2xl font-bold text-[#22A65E]">
            {
              filteredTeams.filter(
                (t) =>
                  t.status === "Checked In" ||
                  t.members.some((m) => m.status === "Checked In"),
              ).length
            }
          </p>
        </div>
        <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E99A8]">
            Confirmed
          </p>
          <p className="mt-1 text-2xl font-bold text-[#3B6FD4]">
            {filteredTeams.filter((t) => t.status === "Confirmed").length}
          </p>
        </div>
        <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E99A8]">
            Unconfirmed
          </p>
          <p className="mt-1 text-2xl font-bold text-[#D4930E]">
            {filteredTeams.filter((t) => t.status === "Unconfirmed").length}
          </p>
        </div>
        <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E99A8]">
            Colleges
          </p>
          <p className="mt-1 text-2xl font-bold text-[#1A1D23]">
            {new Set(filteredTeams.map((t) => t.college)).size}
          </p>
        </div>
      </div>

      {/* Search Bar & Filters Header */}
      <div className="flex flex-col gap-3 rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-3 sm:flex-row sm:items-center sm:justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-[#F0F2F5] px-3.5 py-2">
          <Search size={16} strokeWidth={2} className="text-[#8E99A8]" />
          <input
            type="text"
            placeholder="Search teams, leaders, colleges..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-transparent outline-none text-xs font-medium text-[#1A1D23] placeholder:text-[#8E99A8]"
            aria-label="Search participants"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2 overflow-x-auto">
          <SelectFilter
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              "All Statuses",
              "Unconfirmed",
              "Confirmed",
              "Checked In",
              "Rejected",
            ]}
          />
          <SelectFilter
            label="College"
            value={college}
            onChange={setCollege}
            options={[
              "All Colleges",
              ...Array.from(new Set(teams.map((t) => t.college))),
            ]}
          />
          <SelectFilter
            label="Sort"
            value={sort}
            onChange={setSort}
            options={["Team A-Z", "College", "Status"]}
          />
        </div>
      </div>

      {/* Grouped Participant Teams */}
      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-48 rounded-3xl" />
          ))}
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="p-10 text-center rounded-3xl border border-[rgba(0,0,0,0.08)] bg-white">
          <EmptyState
            title="No matching participants found."
            description="Adjust your search query or filters to view participant teams."
            actionLabel="Import CSV"
            onAction={() => setImportOpen(true)}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] overflow-hidden transition-colors hover:border-[rgba(0,0,0,0.14)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              {/* Team Group Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-[#F7F8FA] px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#3B6FD4] bg-[#EBF0FA] px-3 py-1 rounded-full shrink-0">
                    {team.team}
                  </span>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="text-base font-bold text-[#1A1D23]">
                      {team.teamName}
                    </h3>
                    <span className="text-xs font-semibold text-[#5A6577]">
                      • Leader:{" "}
                      <strong className="text-[#1A1D23] font-bold">
                        {team.leader.name}
                      </strong>{" "}
                      • {team.members.length} Members
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusPill status={team.status} />
                  <GlassButton
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTeam(team);
                      setSelectedMember(null);
                    }}
                    className="h-8 px-3.5 text-xs font-bold rounded-full min-h-0 text-[#3B6FD4] bg-[#EBF0FA] border-[#3B6FD4]/20 hover:bg-[#3B6FD4] hover:text-white cursor-pointer"
                  >
                    View Details
                  </GlassButton>
                </div>
              </div>

              {/* Table Column Headers */}
              <div className="hidden sm:grid grid-cols-[200px_1fr_130px_150px_130px_80px] items-center gap-3 bg-[#FAFAFC] px-6 py-2 border-b border-[rgba(0,0,0,0.04)] text-[10px] font-bold uppercase tracking-wider text-[#8E99A8]">
                <span>Participant</span>
                <span>Email</span>
                <span>Phone</span>
                <span>College / Org</span>
                <span>Status</span>
                <span className="text-right">Role</span>
              </div>

              {/* Members List */}
              <div className="divide-y divide-[rgba(0,0,0,0.05)]">
                {team.members.map((member) => {
                  const isLeader = member.role === "Leader";

                  return (
                    <div
                      key={member.id || member.email}
                      onClick={() => {
                        setSelectedTeam(team);
                        setSelectedMember(member);
                      }}
                      className="group grid grid-cols-1 sm:grid-cols-[200px_1fr_130px_150px_130px_80px] items-center gap-3 px-6 py-3 text-xs transition-colors hover:bg-[#F7F8FA] cursor-pointer"
                    >
                      {/* Col 1: Participant Name */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar
                          initials={member.initials}
                          image={member.avatar}
                          className="h-7 w-7 text-[10px] bg-[#EBF0FA] text-[#3B6FD4] shrink-0"
                        />
                        <p className="font-bold text-[#1A1D23] truncate">
                          {member.name}
                        </p>
                      </div>

                      {/* Col 2: Email */}
                      <div className="min-w-0 truncate">
                        <span className="font-medium text-[#5A6577] truncate">
                          {member.email}
                        </span>
                      </div>

                      {/* Col 3: Phone */}
                      <div className="min-w-0 shrink-0">
                        <span className="font-medium text-[#5A6577]">
                          {member.phone}
                        </span>
                      </div>

                      {/* Col 4: College / Organization */}
                      <div className="min-w-0 truncate">
                        <span className="font-semibold text-[#1A1D23] truncate">
                          {member.college || team.college || "Convene Campus"}
                        </span>
                      </div>

                      {/* Col 5: Participant Status Dropdown */}
                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        <ParticipantStatusSelect
                          status={member.status || "Confirmed"}
                          onChange={(newStatus) =>
                            handleUpdateMemberStatus(team.id, member.id, newStatus)
                          }
                        />
                      </div>

                      {/* Col 6: Leader vs Member Badge */}
                      <div className="text-left sm:text-right shrink-0">
                        {isLeader ? (
                          <MiniBadge tone="warning">Leader</MiniBadge>
                        ) : (
                          <MiniBadge tone="neutral">Member</MiniBadge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <ParticipantDrawer
        team={selectedTeam}
        member={selectedMember}
        onClose={handleCloseDrawer}
        isLead={isLead}
        onUpdateTeamStatus={handleUpdateTeamStatus}
        onUpdateMemberStatus={handleUpdateMemberStatus}
        onSaveNotes={handleSaveNotes}
      />
      <CreateParticipantModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateParticipant}
        teams={teams}
      />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
