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
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAppStore } from "@/store/useAppStore";

const filterOptions = {
  department: ["All Departments", "Registration", "Hospitality", "Operations", "Tech", "Stage", "Logistics"],
  status: ["All Statuses", "Unconfirmed", "Confirmed", "Checked In", "Rejected"],
  college: ["All Colleges"]
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
          <option key={option} value={option} className="bg-white text-[#1A1D23]">
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={13} strokeWidth={2} className="absolute right-3 text-[#8E99A8] pointer-events-none" />
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
    error: "bg-[#D6453D]/10 text-[#D6453D]"
  };
  return <span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold", tones[tone])}>{children}</span>;
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3">
      <p className="text-[11px] font-semibold text-[#8E99A8]">{label}</p>
      <p className="mt-0.5 truncate text-sm font-bold text-[#1A1D23]">{value || "N/A"}</p>
    </div>
  );
}

function ParticipantDrawer({ team, member, onClose, isLead, onUpdateStatus }) {
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
            <div className="flex items-center gap-2">
              <StatusPill status={team.status} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E99A8]">
                {isIndividual ? "Teammate Profile" : "Team Overview"}
              </span>
            </div>
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

        {/* Change Status Control inside View Details Drawer (Leads only) */}
        {isLead && (
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#EBF0FA] border border-[#3B6FD4]/20 p-3.5">
            <span className="text-xs font-bold text-[#3B6FD4]">Update Registration Status</span>
            <div className="relative inline-flex items-center">
              <select
                value={team.status}
                onChange={(e) => onUpdateStatus(team.id, e.target.value)}
                className="cursor-pointer appearance-none rounded-full bg-white border border-[#3B6FD4]/30 pl-3 pr-7 py-1 text-xs font-bold text-[#1A1D23] outline-none shadow-sm"
              >
                <option value="Unconfirmed">Unconfirmed</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Checked In">Checked In</option>
                <option value="Rejected">Rejected</option>
              </select>
              <ChevronDown size={13} strokeWidth={2} className="absolute right-2.5 text-[#8E99A8] pointer-events-none" />
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
              <Info label="Role" value={member.role === "Leader" ? "Team Leader" : "Team Member"} />
              <Info label="College" value={team.college} />
              <Info label="Team" value={`${team.team}: ${team.teamName}`} />
            </>
          ) : (
            <>
              <Info label="College" value={team.college} />
              <Info label="Leader" value={team.leader.name} />
              <Info label="Contact (Leader)" value={team.leader.phone} />
              <Info label="QR Status" value={team.qr || "Generated"} />
              <Info label="Certificates" value={team.certificates || "Pending"} />
              <Info label="Feedback" value={team.feedback || "None"} />
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

        {isLead && (
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
        )}

        <div className="mt-6 rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#1A1D23]">Internal Notes</p>
          <p className="mt-1.5 text-sm leading-relaxed text-[#5A6577] font-medium">{team.notes}</p>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function ImportModal({ open, onClose }) {
  const previewRows = [];
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

function StatusPill({ status }) {
  const statusStyles = {
    Unconfirmed: "bg-[#D4930E]/10 text-[#D4930E] border-[#D4930E]/20",
    Confirmed: "bg-[#22A65E]/10 text-[#22A65E] border-[#22A65E]/20",
    "Checked In": "bg-[#3B6FD4]/10 text-[#3B6FD4] border-[#3B6FD4]/20",
    Rejected: "bg-[#D6453D]/10 text-[#D6453D] border-[#D6453D]/20"
  };

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border", statusStyles[status] || "bg-gray-100 text-gray-700")}>
      {status}
    </span>
  );
}

function CreateParticipantModal({ open, onClose, onSubmit, teams }) {
  const [mode, setMode] = useState("newTeam"); // "newTeam" | "existingTeam" | "individual"
  const [teamName, setTeamName] = useState("");
  const [college, setCollege] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [leaderPhone, setLeaderPhone] = useState("");
  const [targetTeamId, setTargetTeamId] = useState(teams[0]?.id || "");
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPhone, setMemberPhone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      mode,
      teamName,
      college,
      leaderName,
      leaderEmail,
      leaderPhone,
      targetTeamId,
      memberName,
      memberEmail,
      memberPhone
    });
  };

  return (
    <GlassModal open={open} onClose={onClose} title="Create Participant / Registration">
      {/* Mode Selector Tabs with polished UI */}
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-[#E8ECF1] p-1.5 border border-[rgba(0,0,0,0.06)] mb-6">
        {[
          ["newTeam", "Create Whole Team"],
          ["existingTeam", "Add to Existing Team"],
          ["individual", "Register Individual"]
        ].map(([mKey, label]) => (
          <button
            key={mKey}
            type="button"
            onClick={() => setMode(mKey)}
            className={cn(
              "px-2 py-2 text-xs font-bold rounded-xl transition-all text-center",
              mode === mKey
                ? "bg-white text-[#3B6FD4] shadow-sm border border-[rgba(0,0,0,0.04)] font-extrabold"
                : "text-[#5A6577] hover:text-[#1A1D23] font-semibold"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* MODE 1: Create Whole Team */}
        {mode === "newTeam" && (
          <>
            <div>
              <label className="text-xs font-bold text-[#1A1D23]">Team Name</label>
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
              <label className="text-xs font-bold text-[#1A1D23]">College / Organization</label>
              <input
                type="text"
                required
                placeholder="e.g. IIT Bombay"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-semibold text-[#1A1D23] outline-none"
              />
            </div>
            <div className="pt-2 border-t border-[rgba(0,0,0,0.06)]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B6FD4]">Team Leader Info</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <input
                  type="text"
                  required
                  placeholder="Leader Full Name"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="h-10 rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
                />
                <input
                  type="tel"
                  required
                  placeholder="Leader Phone Number"
                  value={leaderPhone}
                  onChange={(e) => setLeaderPhone(e.target.value)}
                  className="h-10 rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
                />
              </div>
              <input
                type="email"
                required
                placeholder="Leader Email Address"
                value={leaderEmail}
                onChange={(e) => setLeaderEmail(e.target.value)}
                className="mt-3 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
              />
            </div>
          </>
        )}

        {/* MODE 2: Add Member to Existing Team */}
        {mode === "existingTeam" && (
          <>
            <div>
              <label className="text-xs font-bold text-[#1A1D23]">Select Existing Target Team</label>
              <select
                value={targetTeamId}
                onChange={(e) => setTargetTeamId(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none cursor-pointer"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id} className="bg-white text-[#1A1D23]">
                    {t.team}: {t.teamName} ({t.college})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#1A1D23]">New Teammate Name</label>
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
                placeholder="Phone Number"
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value)}
                className="h-10 rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
              />
            </div>
          </>
        )}

        {/* MODE 3: Register Individual */}
        {mode === "individual" && (
          <>
            <div>
              <label className="text-xs font-bold text-[#1A1D23]">Individual Participant Name</label>
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
              <label className="text-xs font-bold text-[#1A1D23]">College / Organization</label>
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
                placeholder="Phone Number"
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value)}
                className="h-10 rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
              />
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end gap-3 pt-2">
          <GlassButton type="button" onClick={onClose} className="h-9 text-xs rounded-full">
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" icon={<Plus size={15} />} className="h-9 text-xs rounded-full">
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
  const isLead = role === "lead";

  const filteredTeams = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return teams
      .filter((team) => {
        const matchesSearch =
          !query ||
          [team.team, team.teamName, team.leader.name, team.college, team.status].some(
            (value) => value && value.toLowerCase().includes(query)
          );
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

  const handleUpdateTeamStatus = (teamId, newStatus) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, status: newStatus } : t))
    );
    setSelectedTeam((prev) => (prev && prev.id === teamId ? { ...prev, status: newStatus } : prev));
  };

  const handleCreateParticipant = (data) => {
    if (data.mode === "newTeam") {
      const newTeamObj = {
        id: `t-${Date.now()}`,
        team: `TEAM-${teams.length + 101}`,
        teamName: data.teamName,
        college: data.college,
        status: "Unconfirmed",
        leader: { name: data.leaderName, email: data.leaderEmail, phone: data.leaderPhone, initials: data.leaderName.substring(0, 2).toUpperCase() },
        members: [
          { name: data.leaderName, email: data.leaderEmail, phone: data.leaderPhone, role: "Leader", initials: data.leaderName.substring(0, 2).toUpperCase() }
        ],
        notes: "Manually registered whole team."
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
                { name: data.memberName, email: data.memberEmail, phone: data.memberPhone, role: "Member", initials: data.memberName.substring(0, 2).toUpperCase() }
              ]
            };
          }
          return t;
        })
      );
    } else if (data.mode === "individual") {
      const indTeamObj = {
        id: `t-${Date.now()}`,
        team: `IND-${teams.length + 1}`,
        teamName: `${data.memberName}'s Team`,
        college: data.college || "Individual",
        status: "Unconfirmed",
        leader: { name: data.memberName, email: data.memberEmail, phone: data.memberPhone, initials: data.memberName.substring(0, 2).toUpperCase() },
        members: [
          { name: data.memberName, email: data.memberEmail, phone: data.memberPhone, role: "Leader", initials: data.memberName.substring(0, 2).toUpperCase() }
        ],
        notes: "Individual participant."
      };
      setTeams((prev) => [indTeamObj, ...prev]);
    }
    setCreateModalOpen(false);
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
          {isLead && <GlassButton variant="primary" icon={<Plus size={16} strokeWidth={2} />} onClick={() => setCreateModalOpen(true)} className="rounded-full">Create Participant</GlassButton>}
        </div>
      </div>

      {/* Onboarding-style Participant Overview Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E99A8]">
            {filteredTeams.every((t) => t.members.length === 1) ? "Total Participants" : "Total Teams"}
          </p>
          <p className="mt-1 text-2xl font-extrabold text-[#1A1D23] font-mono">{filteredTeams.length}</p>
          <span className="text-[11px] font-medium text-[#5A6577]">
            {filteredTeams.every((t) => t.members.length === 1) ? "Registered individuals" : "Participating teams"}
          </span>
        </div>

        <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#3B6FD4]">Checked In</p>
          <p className="mt-1 text-2xl font-extrabold text-[#3B6FD4] font-mono">
            {filteredTeams.filter((t) => t.status === "Checked In").length}
          </p>
          <span className="text-[11px] font-medium text-[#5A6577]">On-site badge issued</span>
        </div>

        <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#D4930E]">Unconfirmed</p>
          <p className="mt-1 text-2xl font-extrabold text-[#D4930E] font-mono">
            {filteredTeams.filter((t) => t.status === "Unconfirmed").length}
          </p>
          <span className="text-[11px] font-medium text-[#5A6577]">Pending registration</span>
        </div>

        <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#22A65E]">Confirmed</p>
          <p className="mt-1 text-2xl font-extrabold text-[#22A65E] font-mono">
            {filteredTeams.filter((t) => t.status === "Confirmed").length}
          </p>
          <span className="text-[11px] font-medium text-[#5A6577]">Registration verified</span>
        </div>

        <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#D6453D]">Rejected</p>
          <p className="mt-1 text-2xl font-extrabold text-[#D6453D] font-mono">
            {filteredTeams.filter((t) => t.status === "Rejected").length}
          </p>
          <span className="text-[11px] font-medium text-[#5A6577]">Registration declined</span>
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
          <SelectFilter label="Status" value={status} onChange={setStatus} options={["All Statuses", "Unconfirmed", "Confirmed", "Checked In", "Rejected"]} />
          <SelectFilter label="College" value={college} onChange={setCollege} options={["All Colleges", ...Array.from(new Set(teams.map((t) => t.college)))]} />
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
                    <span className="text-xs font-semibold text-[#5A6577]">
                      • Leader: <strong className="text-[#1A1D23] font-bold">{team.leader.name}</strong> ({team.college}) • {team.members.length} Members
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

      <ParticipantDrawer
        team={selectedTeam}
        member={selectedMember}
        onClose={handleCloseDrawer}
        isLead={isLead}
        onUpdateStatus={handleUpdateTeamStatus}
      />
      <CreateParticipantModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onSubmit={handleCreateParticipant} teams={teams} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
