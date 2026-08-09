import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  Camera,
  CheckCircle2,
  ChevronDown,
  Cpu,
  DollarSign,
  HeartHandshake,
  LayoutList,
  Megaphone,
  Palette,
  Plus,
  Search,
  Truck,
  UserCheck,
  Users,
  Utensils,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassModal } from "@/components/glass/GlassModal";
import { initialTeams } from "@/data/teams";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAppStore } from "@/store/useAppStore";

const iconMap = {
  UserCheck,
  Cpu,
  Utensils,
  Megaphone,
  Truck,
  Camera,
  DollarSign,
  Briefcase,
  Palette,
  HeartHandshake
};

function SelectFilter({ value, onChange, options, label }) {
  return (
    <label className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#5A6577]">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent text-xs font-semibold text-[#1A1D23] outline-none pr-1"
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

function TeamDrawer({ team, onClose }) {
  const navigate = useNavigate();

  if (!team) return null;

  const TeamIcon = iconMap[team.iconName] ?? Users;

  const handleNavigateToTasks = () => {
    onClose();
    navigate(`/tasks?team=${team.slug}`);
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
        className="fixed bottom-4 right-4 top-4 z-50 flex w-[min(540px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-7 shadow-xl text-[#1A1D23]"
        initial={{ x: 600, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 600, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(0,0,0,0.06)] pb-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF0FA] text-[#3B6FD4]">
              <TeamIcon size={24} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1A1D23]">{team.name}</h2>
              <p className="mt-0.5 text-xs font-semibold text-[#8E99A8]">{team.members.length} Team Members</p>
            </div>
          </div>
          <button
            className="flex h-9 w-9 min-h-0 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23]"
            onClick={onClose}
            aria-label="Close team drawer"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto py-6 space-y-7 pr-1">
          {/* Team Lead */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E99A8]">Team Lead</h3>
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-4">
              <div className="flex items-center gap-3.5">
                <UserAvatar initials={team.lead.initials} image={team.lead.avatar} className="h-11 w-11 text-xs bg-[#EBF0FA] text-[#3B6FD4]" />
                <div>
                  <p className="text-base font-bold text-[#1A1D23]">{team.lead.name}</p>
                  <p className="text-xs font-medium text-[#5A6577]">{team.lead.role}</p>
                </div>
              </div>
              <div className="text-right text-xs font-medium text-[#5A6577]">
                <p>{team.lead.email}</p>
                <p className="mt-0.5 text-[11px] text-[#8E99A8]">{team.lead.phone}</p>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E99A8]">Team Members ({team.members.length})</h3>
            <div className="mt-3 space-y-2">
              {team.members.map((member) => (
                <div
                  key={member.email}
                  className="flex items-center justify-between rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3.5 text-xs transition-colors hover:bg-[#F0F2F5]"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <UserAvatar initials={member.initials} image={member.avatar} className="h-9 w-9 text-[10px] bg-[#EBF0FA] text-[#3B6FD4]" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1A1D23] truncate">{member.name}</p>
                      <p className="text-xs font-medium text-[#8E99A8] truncate">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-medium text-[#5A6577]">
                    <p>{member.email}</p>
                    <p className="text-[11px] text-[#8E99A8]">{member.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Responsibilities */}
          {team.responsibilities && team.responsibilities.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E99A8]">Responsibilities</h3>
              <div className="mt-3 space-y-2">
                {team.responsibilities.map((resp, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] px-4 py-2.5 text-xs font-semibold text-[#1A1D23]">
                    <CheckCircle2 size={16} className="text-[#22A65E] shrink-0" />
                    <span>{resp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer CTA */}
        <div className="border-t border-[rgba(0,0,0,0.06)] pt-5">
          <GlassButton
            onClick={handleNavigateToTasks}
            variant="primary"
            icon={<LayoutList size={16} />}
            className="w-full h-10 text-xs justify-center font-bold rounded-full"
          >
            Open Team Tasks
          </GlassButton>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function CreateTeamModal({ open, onClose, onCreateTeam }) {
  const [name, setName] = useState("");
  const [leadName, setLeadName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newTeam = {
      id: `team-${Date.now()}`,
      slug,
      name: name.trim(),
      iconName: "Users",
      lead: {
        name: leadName.trim() || "Aman Goel",
        role: `${name.trim()} Lead`,
        avatar: "https://i.pravatar.cc/96?img=33",
        initials: "AG",
        email: "aman.goel@convene.edu",
        phone: "+91 98765 00099"
      },
      members: [
        { name: leadName.trim() || "Aman Goel", role: "Team Lead", avatar: "https://i.pravatar.cc/96?img=33", initials: "AG", email: "aman.goel@convene.edu", phone: "+91 98765 00099" }
      ],
      responsibilities: ["Operational management and team oversight"]
    };

    onCreateTeam(newTeam);
    setName("");
    setLeadName("");
    onClose();
  };

  return (
    <GlassModal open={open} className="w-[min(480px,calc(100vw-32px))] max-w-none bg-white border border-[rgba(0,0,0,0.08)] rounded-3xl p-6 text-[#1A1D23]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1A1D23]">Create Team</h2>
          <p className="mt-1 text-xs font-medium text-[#5A6577]">Add a new organizing team to the directory.</p>
        </div>
        <button
          className="flex h-8 w-8 min-h-0 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23]"
          onClick={onClose}
          aria-label="Close create team modal"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-[#8E99A8]">Team Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Design Team"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-10 w-full rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-4 text-xs font-semibold text-[#1A1D23] outline-none placeholder:text-[#8E99A8]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#8E99A8]">Team Lead Name</label>
          <input
            type="text"
            placeholder="e.g. Sara Sethi"
            value={leadName}
            onChange={(e) => setLeadName(e.target.value)}
            className="mt-1 h-10 w-full rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-4 text-xs font-semibold text-[#1A1D23] outline-none placeholder:text-[#8E99A8]"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-2">
          <GlassButton type="button" onClick={onClose} className="h-9 text-xs rounded-full">
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" icon={<Plus size={15} />} className="h-9 text-xs rounded-full">
            Create Team
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}

export function TeamsPage() {
  const [teams, setTeams] = useState(initialTeams);
  const [search, setSearch] = useState("");
  const [leadFilter, setLeadFilter] = useState("All Leads");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading] = useState(false);

  const role = useAppStore((state) => state.role);
  const isLead = role === "lead";

  const leadOptions = useMemo(() => {
    return ["All Leads", ...Array.from(new Set(teams.map((t) => t.lead.name)))];
  }, [teams]);

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();
    return teams.filter((team) => {
      const matchesSearch =
        !query ||
        team.name.toLowerCase().includes(query) ||
        team.lead.name.toLowerCase().includes(query) ||
        team.members.some((m) => m.name.toLowerCase().includes(query));

      const matchesLead = leadFilter === "All Leads" || team.lead.name === leadFilter;

      return matchesSearch && matchesLead;
    });
  }, [isLead, leadFilter, search, teams]);

  const handleCreateTeam = (newTeam) => {
    setTeams((prev) => [newTeam, ...prev]);
  };

  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1D23] md:text-3xl">Teams</h1>
          <p className="mt-1 text-sm text-[#5A6577] font-medium">Coordinate organizing teams and monitor responsibilities.</p>
        </div>
        {isLead && (
          <div className="flex items-center gap-3">
            <GlassButton variant="primary" icon={<Plus size={16} strokeWidth={2} />} onClick={() => setCreateModalOpen(true)} className="rounded-full">
              Create Team
            </GlassButton>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
        <div className="flex h-9 min-w-[240px] flex-1 items-center gap-2 rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-medium text-[#1A1D23] focus-within:ring-1 focus-within:ring-[#3B6FD4]">
          <Search size={15} strokeWidth={2} className="text-[#8E99A8] shrink-0" />
          <input
            type="text"
            placeholder="Search by team name, lead, or member name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-xs font-medium text-[#1A1D23] placeholder:text-[#8E99A8]"
            aria-label="Search teams"
          />
        </div>
      </div>

      {/* Minimal Team Cards Grid */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-44 rounded-3xl" />
          ))}
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white">
          <EmptyState
            title="No teams created."
            description="No organizing teams match your search. Create a team to build your directory."
            actionLabel="Create Team"
            onAction={() => setCreateModalOpen(true)}
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTeams.map((team) => {
            const TeamIcon = iconMap[team.iconName] ?? Users;
            const visibleMembers = team.members.slice(0, 5);
            const remainingCount = team.members.length - visibleMembers.length;

            return (
              <div
                key={team.id}
                className="group relative flex flex-col justify-between h-full rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-6 transition-colors hover:bg-[#F7F8FA] cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                onClick={() => setSelectedTeam(team)}
              >
                {/* Team Icon & Name */}
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EBF0FA] text-[#3B6FD4]">
                    <TeamIcon size={20} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-[#1A1D23] truncate">
                      {team.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#8E99A8] truncate mt-0.5">
                      Lead: <span className="text-[#5A6577]">{team.lead.name}</span>
                    </p>
                  </div>
                </div>

                {/* Member Avatar Stack */}
                <div className="mt-8 flex items-center justify-between border-t border-[rgba(0,0,0,0.06)] pt-4">
                  <span className="text-xs font-semibold text-[#8E99A8]">Members ({team.members.length})</span>
                  <div className="flex items-center -space-x-2">
                    {visibleMembers.map((m) => (
                      <div key={m.email} className="ring-2 ring-white rounded-full" title={`${m.name} (${m.role})`}>
                        <UserAvatar initials={m.initials} image={m.avatar} className="h-7 w-7 text-[10px] bg-[#EBF0FA] text-[#3B6FD4]" />
                      </div>
                    ))}
                    {remainingCount > 0 && (
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EBF0FA] text-[10px] font-bold text-[#3B6FD4] ring-2 ring-white"
                        title={`${remainingCount} more members`}
                      >
                        +{remainingCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Team Drawer */}
      <TeamDrawer team={selectedTeam} onClose={() => setSelectedTeam(null)} />

      {/* Create Team Modal */}
      <CreateTeamModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onCreateTeam={handleCreateTeam} />
    </div>
  );
}
