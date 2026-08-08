import { AnimatePresence, motion } from "framer-motion";
import {
  BedDouble,
  Check,
  ChevronDown,
  Download,
  FileDown,
  FileUp,
  MoreHorizontal,
  Plus,
  QrCode,
  Search,
  Upload,
  Utensils,
  X,
  Award,
  ShieldAlert,
  UserCheck,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassModal } from "@/components/glass/GlassModal";
import { participantTeams } from "@/data/participants";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";

const filterOptions = {
  department: ["All Departments", "Registration", "Hospitality", "Operations", "Tech", "Stage", "Logistics"],
  status: ["All Statuses", "Registered", "Confirmed", "Checked In", "Rejected", "Completed"],
  college: ["All Colleges", ...Array.from(new Set(participantTeams.map((team) => team.college)))],
  accommodation: ["All Accommodation", "Assigned", "Pending", "Not Required"],
  food: ["All Food", "Issued", "Pending", "Dietary Flag"]
};

function SelectFilter({ value, onChange, options, label }) {
  return (
    <label className="glass-surface flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold text-[#6B7280]">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="cursor-pointer bg-transparent text-xs font-medium text-[#111827] outline-none"
      >
        {options.map((option) => (
          <option key={option} className="bg-[#111827] text-white">
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={13} strokeWidth={1.75} className="shrink-0 text-[#9CA3AF]" />
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
    neutral: "border-white/20 bg-white/10 text-[#cbd5e1]",
    success: "border-[#34C759]/35 bg-[#34C759]/18 text-[#4ade80]",
    warning: "border-[#FF9F0A]/35 bg-[#FF9F0A]/18 text-[#fbbf24]",
    info: "border-[#007AFF]/35 bg-[#007AFF]/18 text-[#38bdf8]",
    error: "border-[#FF453A]/35 bg-[#FF453A]/18 text-[#f87171]"
  };
  return <span className={cn("inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", tones[tone])}>{children}</span>;
}

function ParticipantDrawer({ team, onClose }) {
  if (!team) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-40 bg-[#111827]/10 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside
        className="glass-surface fixed bottom-4 right-4 top-4 z-50 w-[min(520px,calc(100vw-32px))] overflow-y-auto rounded-[32px] p-6 shadow-[0_24px_70px_rgba(31,41,55,0.18)]"
        initial={{ x: 540, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 540, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Participant Details</p>
            <h2 className="mt-2 text-2xl font-bold text-[#111827]">{team.team}</h2>
            <p className="mt-1 text-sm font-medium text-[#6B7280]">{team.project}</p>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/45 text-[#6B7280] hover:bg-white/65" onClick={onClose} aria-label="Close drawer">
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Info label="College" value={team.college} />
          <Info label="Leader" value={team.leader.name} />
          <Info label="Contact" value={team.leader.phone} />
          <Info label="QR Status" value={team.qr} />
          <Info label="Accommodation" value={team.accommodation} />
          <Info label="Food" value={team.food} />
          <Info label="Certificates" value={team.certificates} />
          <Info label="Feedback" value={team.feedback} />
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-bold text-[#111827]">Team Members</h3>
          <div className="mt-3 space-y-3">
            {team.members.map((member) => (
              <div key={member.email} className="rounded-[20px] border border-white/45 bg-white/35 p-3">
                <div className="flex items-center gap-3">
                  <UserAvatar initials={member.initials} image={member.avatar} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#111827]">{member.name}</p>
                    <p className="truncate text-xs font-medium text-[#9CA3AF]">{member.email}</p>
                  </div>
                  <MiniBadge>{member.role}</MiniBadge>
                </div>
                <p className="mt-2 text-xs font-medium text-[#6B7280]">{member.phone}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            ["Mark Check-In", Check],
            ["Assign Room", BedDouble],
            ["Generate QR", QrCode],
            ["Issue Certificate", Award],
            ["Add Note", Plus]
          ].map(([label, Icon], index) => (
            <GlassButton key={label} variant={index === 0 ? "primary" : "secondary"} icon={<Icon size={17} strokeWidth={1.75} />} className="justify-start">
              {label}
            </GlassButton>
          ))}
        </div>

        <div className="mt-6 rounded-[20px] border border-white/45 bg-white/35 p-4">
          <p className="text-sm font-bold text-[#111827]">Internal Notes</p>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">{team.notes}</p>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-[18px] border border-white/45 bg-white/35 p-3">
      <p className="text-xs font-semibold text-[#9CA3AF]">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-[#111827]">{value}</p>
    </div>
  );
}

function ImportModal({ open, onClose }) {
  const previewRows = participantTeams.slice(0, 4);
  return (
    <GlassModal open={open} className="w-[min(720px,calc(100vw-32px))] max-w-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#111827]">Import participants</h2>
          <p className="mt-1 text-sm font-medium text-[#6B7280]">Upload a CSV exported from your registration platform.</p>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/45 text-[#6B7280] hover:bg-white/65" onClick={onClose} aria-label="Close import modal">
          <X size={18} strokeWidth={1.75} />
        </button>
      </div>
      <div className="mt-6 rounded-[24px] border border-dashed border-white/70 bg-white/35 p-8 text-center">
        <Upload className="mx-auto text-[#6B7280]" size={30} strokeWidth={1.75} />
        <p className="mt-3 text-sm font-bold text-[#111827]">Drop CSV here</p>
        <p className="mt-1 text-xs font-medium text-[#9CA3AF]">Team, leader, college, members, project, accommodation and food columns supported.</p>
      </div>
      <div className="mt-5 overflow-hidden rounded-[20px] border border-white/45 bg-white/30">
        {previewRows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_1fr_0.8fr] gap-3 border-b border-white/35 px-4 py-3 text-sm last:border-b-0">
            <span className="truncate font-semibold text-[#111827]">{row.team}</span>
            <span className="truncate text-[#6B7280]">{row.college}</span>
            <span className="truncate text-[#6B7280]">{row.members.length} members</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <GlassButton onClick={onClose}>Cancel</GlassButton>
        <GlassButton variant="primary" icon={<FileUp size={17} strokeWidth={1.75} />}>Import CSV</GlassButton>
      </div>
    </GlassModal>
  );
}

export function ParticipantsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Statuses");
  const [college, setCollege] = useState("All Colleges");
  const [food, setFood] = useState("All Food");
  const [sort, setSort] = useState("Team A-Z");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [loading] = useState(false);

  const filteredTeams = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return participantTeams
      .filter((team) => {
        const matchesSearch = !query || [team.team, team.leader.name, team.college, team.project, team.status].some((value) => value.toLowerCase().includes(query));
        return (
          matchesSearch &&
          (department === "All Departments" || team.department === department) &&
          (status === "All Statuses" || team.status === status) &&
          (college === "All Colleges" || team.college === college) &&
          (food === "All Food" || team.food === food)
        );
      })
      .sort((a, b) => {
        if (sort === "College") return a.college.localeCompare(b.college);
        if (sort === "Status") return a.status.localeCompare(b.status);
        return a.team.localeCompare(b.team, undefined, { numeric: true });
      });
  }, [college, debouncedSearch, department, food, sort, status]);

  const totalParticipants = participantTeams.reduce((sum, team) => sum + team.members.length, 0);
  const checkedIn = participantTeams.filter((team) => team.status === "Checked In" || team.status === "Completed").reduce((sum, team) => sum + team.members.length, 0);
  const metrics = [
    { label: "Total Participants", value: String(totalParticipants), detail: `${participantTeams.length} teams imported`, icon: Users, tone: "info" },
    { label: "Checked In", value: String(checkedIn), detail: "Across registration desks", icon: UserCheck, tone: "success" },
    { label: "Pending Check-In", value: String(totalParticipants - checkedIn), detail: "Needs arrival follow-up", icon: ShieldAlert, tone: "warning" },
    { label: "Certificates Issued", value: String(participantTeams.filter((team) => team.certificates === "Issued").length), detail: "Completed teams", icon: Award, tone: "gold" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <PageHeader title="Participants" description="Manage teams, check-ins, accommodation and event operations." />
        <div className="flex flex-wrap gap-3">
          <GlassButton variant="success" icon={<FileUp size={17} strokeWidth={1.75} />} onClick={() => setImportOpen(true)}>Import CSV</GlassButton>
          <GlassButton variant="success" icon={<FileDown size={17} strokeWidth={1.75} />}>Export</GlassButton>
          <GlassButton icon={<Plus size={17} strokeWidth={1.75} />}>Create Participant</GlassButton>
        </div>
      </div>

      <GlassCard className="p-3">
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto lg:flex-nowrap">
          <GlassInput
            className="h-9 min-w-[220px] flex-1 bg-white/48 text-xs"
            leftIcon={<Search size={15} strokeWidth={1.75} />}
            placeholder="Search teams, leaders, colleges..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search participants"
          />
          <div className="flex shrink-0 items-center gap-2 overflow-x-auto">
            <SelectFilter label="Department" value={department} onChange={setDepartment} options={filterOptions.department} />
            <SelectFilter label="Status" value={status} onChange={setStatus} options={filterOptions.status} />
            <SelectFilter label="College" value={college} onChange={setCollege} options={filterOptions.college} />
            <SelectFilter label="Food" value={food} onChange={setFood} options={filterOptions.food} />
            <SelectFilter label="Sort" value={sort} onChange={setSort} options={["Team A-Z", "College", "Status"]} />
          </div>
        </div>
      </GlassCard>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4" aria-label="Participant metrics">
        {metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </section>

      <GlassCard padding="none" className="overflow-hidden">
        {loading ? (
          <div className="space-[#3] p-4">{Array.from({ length: 8 }).map((_, index) => <LoadingSkeleton key={index} className="h-14" />)}</div>
        ) : filteredTeams.length === 0 ? (
          <div className="p-6"><EmptyState title="Import your first participant list." description="No matching participants were found. Adjust filters or import your CSV to begin operating." actionLabel="Import CSV" /></div>
        ) : (
          <div className="max-h-[620px] overflow-auto">
            <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
              <thead className="sticky top-0 z-10 bg-slate-900/90 text-[#9CA3AF] border-b border-white/10 backdrop-blur-2xl">
                <tr className="text-[11px] font-bold uppercase tracking-wider">
                  {["Team", "Leader", "College", "Members", "Project", "Status", "Food", "QR", "Actions"].map((column) => (
                    <th key={column} className={cn("border-b border-white/45 px-3.5 py-3", column === "Members" && "text-center", column === "Actions" && "text-right")}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team, index) => {
                  const highlighted = debouncedSearch && [team.team, team.leader.name, team.college, team.project].some((value) => value.toLowerCase().includes(debouncedSearch.toLowerCase()));
                  return (
                    <motion.tr
                      key={team.id}
                      className={cn("group cursor-pointer transition-colors hover:bg-white/40", highlighted && "bg-[#F6C445]/10")}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.01, type: "spring", stiffness: 300, damping: 28 }}
                      onClick={() => setSelectedTeam(team)}
                    >
                      <td className="border-b border-white/35 px-3.5 py-2.5">
                        <p className="text-xs font-bold text-[#111827]">{team.team}</p>
                      </td>
                      <td className="border-b border-white/35 px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                          <UserAvatar initials={team.leader.initials} image={team.leader.avatar} className="h-7 w-7 text-[10px]" />
                          <span className="text-xs font-semibold text-[#111827]">{team.leader.name}</span>
                        </div>
                      </td>
                      <td className="border-b border-white/35 px-3.5 py-2.5 text-xs font-medium text-[#6B7280]">{team.college}</td>
                      <td className="border-b border-white/35 px-3.5 py-2.5 text-center text-xs font-bold text-[#111827]">{team.members.length}</td>
                      <td className="max-w-[200px] truncate border-b border-white/35 px-3.5 py-2.5 text-xs font-medium text-[#6B7280]">{team.project}</td>
                      <td className="border-b border-white/35 px-3.5 py-2.5"><StatusBadge status={team.status} /></td>
                      <td className="border-b border-white/35 px-3.5 py-2.5"><MiniBadge tone={team.food === "Issued" ? "success" : team.food === "Dietary Flag" ? "warning" : "neutral"}>{team.food}</MiniBadge></td>
                      <td className="border-b border-white/35 px-3.5 py-2.5"><MiniBadge tone={team.qr === "Scanned" ? "success" : team.qr === "Missing" ? "error" : "info"}>{team.qr}</MiniBadge></td>
                      <td className="border-b border-white/35 px-3.5 py-2.5 text-right">
                        <button className="min-h-0 rounded-lg p-1.5 text-[#6B7280] hover:bg-white/55" aria-label={`Actions for ${team.team}`}>
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <ParticipantDrawer team={selectedTeam} onClose={() => setSelectedTeam(null)} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
