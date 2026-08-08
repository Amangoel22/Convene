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
  Award
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassModal } from "@/components/glass/GlassModal";
import { participantTeams } from "@/data/participants";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";

const filterOptions = {
  department: ["All Departments", "Registration", "Hospitality", "Operations", "Tech", "Stage", "Logistics"],
  status: ["All Statuses", "Unconfirmed", "Confirmed", "Checked In", "Rejected", "Completed"],
  college: ["All Colleges", ...Array.from(new Set(participantTeams.map((team) => team.college)))]
};

function SelectFilter({ value, onChange, options, label }) {
  return (
    <label className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#5A6577]">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="cursor-pointer bg-transparent text-xs font-semibold text-[#1A1D23] outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-white text-[#1A1D23]">
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={13} strokeWidth={2} className="shrink-0 text-[#8E99A8]" />
    </label>
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
    error: "bg-[#D6453D]/10 text-[#D6453D]"
  };
  return <span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold", tones[tone])}>{children}</span>;
}

function ParticipantDrawer({ team, member, onClose }) {
  if (!team) return null;

  const isIndividual = Boolean(member);

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside
        className="fixed bottom-4 right-4 top-4 z-50 w-[min(520px,calc(100vw-32px))] overflow-y-auto rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-6 shadow-xl text-[#1A1D23]"
        initial={{ x: 540, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 540, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8E99A8]">
              {isIndividual ? "Teammate Profile" : "Team Overview"}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#1A1D23]">
              {isIndividual ? member.name : `${team.team}: ${team.teamName}`}
            </h2>
            {isIndividual && (
              <p className="mt-0.5 text-xs font-semibold text-[#5A6577]">
                {team.team}: {team.teamName} • {member.role === "Leader" ? "Team Leader" : "Team Member"}
              </p>
            )}
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23]" onClick={onClose} aria-label="Close drawer">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Info Grid */}
        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {isIndividual ? (
            <>
              <Info label="Name" value={member.name} />
              <Info label="Phone Number" value={member.phone} />
              <Info label="Email" value={member.email} />
              <Info label="Role" value={member.role === "Leader" ? "Team Leader" : "Team Member"} />
              <Info label="College" value={team.college} />
              <Info label="Team" value={`${team.team}: ${team.teamName}`} />
            </>
          ) : (
            <>
              <Info label="College" value={team.college} />
              <Info label="Leader" value={team.leader.name} />
              <Info label="Contact (Leader)" value={team.leader.phone} />
              <Info label="QR Status" value={team.qr} />
              <Info label="Certificates" value={team.certificates} />
              <Info label="Feedback" value={team.feedback} />
            </>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-bold text-[#1A1D23]">Team Members ({team.members.length})</h3>
          <div className="mt-3 space-y-2">
            {team.members.map((m) => (
              <div
                key={m.email}
                className={cn(
                  "rounded-2xl border p-3 transition-colors",
                  isIndividual && m.email === member.email
                    ? "bg-[#EBF0FA] border-[#3B6FD4]/30"
                    : "bg-[#F7F8FA] border-[rgba(0,0,0,0.06)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <UserAvatar initials={m.initials} image={m.avatar} className="bg-[#EBF0FA] text-[#3B6FD4]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#1A1D23]">{m.name}</p>
                    <p className="truncate text-xs font-medium text-[#8E99A8]">{m.email}</p>
                  </div>
                  <MiniBadge tone={m.role === "Leader" ? "warning" : "neutral"}>
                    {m.role === "Leader" ? "Leader" : "Member"}
                  </MiniBadge>
                </div>
                <p className="mt-2 text-xs font-medium text-[#5A6577]">{m.phone}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {[
            ["Mark Check-In", Check],
            ["Generate QR", QrCode],
            ["Issue Certificate", Award],
            ["Add Note", Plus]
          ].map(([label, Icon], index) => (
            <GlassButton key={label} variant={index === 0 ? "primary" : "secondary"} icon={<Icon size={16} strokeWidth={2} />} className="justify-start rounded-full text-xs">
              {label}
            </GlassButton>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#1A1D23]">Internal Notes</p>
          <p className="mt-1.5 text-sm leading-relaxed text-[#5A6577] font-medium">{team.notes}</p>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3">
      <p className="text-[11px] font-semibold text-[#8E99A8]">{label}</p>
      <p className="mt-0.5 truncate text-sm font-bold text-[#1A1D23]">{value}</p>
    </div>
  );
}

function ImportModal({ open, onClose }) {
  const previewRows = participantTeams.slice(0, 4);
  return (
    <GlassModal open={open} className="w-[min(720px,calc(100vw-32px))] max-w-none bg-white border border-[rgba(0,0,0,0.08)] rounded-3xl p-6 text-[#1A1D23]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1A1D23]">Import participants</h2>
          <p className="mt-1 text-xs font-medium text-[#5A6577]">Upload a CSV exported from your registration platform.</p>
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23]" onClick={onClose} aria-label="Close import modal">
          <X size={18} strokeWidth={2} />
        </button>
      </div>
      <div className="mt-6 rounded-2xl border-2 border-dashed border-[rgba(0,0,0,0.12)] bg-[#F7F8FA] p-8 text-center">
        <Upload className="mx-auto text-[#3B6FD4]" size={30} strokeWidth={2} />
        <p className="mt-3 text-sm font-bold text-[#1A1D23]">Drop CSV here</p>
        <p className="mt-1 text-xs font-medium text-[#8E99A8]">Team, leader, college, and members columns supported.</p>
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)]">
        {previewRows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_1fr_0.8fr] gap-3 border-b border-[rgba(0,0,0,0.06)] px-4 py-3 text-xs last:border-b-0">
            <span className="truncate font-semibold text-[#1A1D23]">{row.team}: {row.teamName}</span>
            <span className="truncate text-[#5A6577]">{row.college}</span>
            <span className="truncate text-[#8E99A8]">{row.members.length} members</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <GlassButton onClick={onClose} className="rounded-full">Cancel</GlassButton>
        <GlassButton variant="primary" icon={<FileUp size={16} strokeWidth={2} />} className="rounded-full">Import CSV</GlassButton>
      </div>
    </GlassModal>
  );
}

import { useAppStore } from "@/store/useAppStore";

export function ParticipantsPage() {
  const [teams, setTeams] = useState(participantTeams);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Statuses");
  const [college, setCollege] = useState("All Colleges");
  const [sort, setSort] = useState("Team A-Z");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [loading] = useState(false);

  const role = useAppStore((state) => state.role);
  const isLead = role === "lead";

  const handleUpdateTeamStatus = (teamId, newStatus) => {
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, status: newStatus } : t)));
    setSelectedTeam((prev) => (prev && prev.id === teamId ? { ...prev, status: newStatus } : prev));
  };

  const filteredTeams = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return teams
      .filter((team) => {
        const matchesSearch = !query || [team.team, team.teamName, team.leader.name, team.college, team.status].some((value) => value && value.toLowerCase().includes(query));
        return (
          matchesSearch &&
          (department === "All Departments" || team.department === department) &&
          (status === "All Statuses" || team.status === status) &&
          (college === "All Colleges" || team.college === college)
        );
      })
      .sort((a, b) => {
        if (sort === "College") return a.college.localeCompare(b.college);
        if (sort === "Status") return a.status.localeCompare(b.status);
        return a.team.localeCompare(b.team, undefined, { numeric: true });
      });
  }, [college, debouncedSearch, department, sort, status, teams]);

  const handleCloseDrawer = () => {
    setSelectedTeam(null);
    setSelectedMember(null);
  };

  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1D23] md:text-3xl">Participants</h1>
          <p className="mt-1 text-sm text-[#5A6577] font-medium">Manage teams, check-ins, and event operations.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {isLead && <GlassButton variant="secondary" icon={<FileUp size={16} strokeWidth={2} />} onClick={() => setImportOpen(true)} className="rounded-full">Import CSV</GlassButton>}
          <GlassButton variant="secondary" icon={<FileDown size={16} strokeWidth={2} />} className="rounded-full">Export</GlassButton>
          {isLead && <GlassButton variant="primary" icon={<Plus size={16} strokeWidth={2} />} className="rounded-full">Create Participant</GlassButton>}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-9 min-w-[240px] flex-1 items-center gap-2 rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-medium text-[#1A1D23] focus-within:ring-1 focus-within:ring-[#3B6FD4]">
          <Search size={15} strokeWidth={2} className="text-[#8E99A8] shrink-0" />
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
          <SelectFilter label="Department" value={department} onChange={setDepartment} options={filterOptions.department} />
          <SelectFilter label="Status" value={status} onChange={setStatus} options={filterOptions.status} />
          <SelectFilter label="College" value={college} onChange={setCollege} options={filterOptions.college} />
          <SelectFilter label="Sort" value={sort} onChange={setSort} options={["Team A-Z", "College", "Status"]} />
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
                    <h3 className="text-base font-bold text-[#1A1D23]">{team.teamName}</h3>
                    <span className="text-xs font-medium text-[#8E99A8]">({team.college} • {team.members.length} Members)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#8E99A8]">Status:</span>
                    <select
                      value={team.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleUpdateTeamStatus(team.id, e.target.value);
                      }}
                      className="cursor-pointer rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 py-1 text-xs font-bold text-[#1A1D23] outline-none"
                    >
                      <option value="Unconfirmed">Unconfirmed</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Checked In">Checked In</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <GlassButton
                    onClick={() => {
                      setSelectedTeam(team);
                      setSelectedMember(null);
                    }}
                    className="h-8 px-3 text-xs font-semibold rounded-full min-h-0 text-[#5A6577] hover:text-[#1A1D23]"
                  >
                    View Details
                  </GlassButton>
                </div>
              </div>

              {/* Members List */}
              <div className="divide-y divide-[rgba(0,0,0,0.05)]">
                {team.members.map((member) => {
                  const isLeader = member.role === "Leader";

                  return (
                    <div
                      key={member.email}
                      onClick={() => {
                        setSelectedTeam(team);
                        setSelectedMember(member);
                      }}
                      className="group grid grid-cols-1 sm:grid-cols-[280px_1fr_180px_110px] items-center gap-4 px-6 py-3.5 text-xs transition-colors hover:bg-[#F7F8FA] cursor-pointer"
                    >
                      {/* Col 1: Participant Name */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <UserAvatar initials={member.initials} image={member.avatar} className="h-8 w-8 text-[11px] bg-[#EBF0FA] text-[#3B6FD4] shrink-0" />
                        <p className="font-bold text-[#1A1D23] truncate">{member.name}</p>
                      </div>

                      {/* Col 2: Email */}
                      <div className="min-w-0 truncate">
                        <span className="font-medium text-[#5A6577] truncate">{member.email}</span>
                      </div>

                      {/* Col 3: Phone */}
                      <div className="min-w-0 shrink-0">
                        <span className="font-medium text-[#5A6577]">{member.phone}</span>
                      </div>

                      {/* Col 4: Leader vs Member Badge */}
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

      <ParticipantDrawer team={selectedTeam} member={selectedMember} onClose={handleCloseDrawer} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
