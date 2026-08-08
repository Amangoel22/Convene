import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  Camera,
  CheckCircle2,
  ChevronDown,
  Cpu,
  DollarSign,
  ExternalLink,
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
import { PageHeader } from "@/components/common/PageHeader";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassModal } from "@/components/glass/GlassModal";
import { initialTeams } from "@/data/teams";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";

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
    <label className="glass-surface flex h-10 shrink-0 items-center gap-2 rounded-2xl px-3 text-xs font-semibold text-[#6B7280]">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent text-xs font-medium text-[#111827] outline-none pr-1"
      >
        {options.map((option) => (
          <option key={option} className="bg-[#111827] text-white">
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={14} strokeWidth={1.75} className="shrink-0 text-[#9CA3AF]" />
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
        className="fixed inset-0 z-40 bg-[#111827]/20 backdrop-blur-[4px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        className="glass-surface fixed bottom-4 right-4 top-4 z-50 flex w-[min(540px,calc(100vw-32px))] flex-col overflow-hidden rounded-[32px] p-7 shadow-[0_24px_70px_rgba(31,41,55,0.25)]"
        initial={{ x: 600, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 600, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/20 pb-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6C445]/20 text-[#F6C445] border border-[#F6C445]/40 shadow-inner">
              <TeamIcon size={24} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#111827]">{team.name}</h2>
              <p className="mt-0.5 text-xs font-semibold text-[#9CA3AF]">{team.members.length} Team Members</p>
            </div>
          </div>
          <button
            className="flex h-9 w-9 min-h-0 items-center justify-center rounded-2xl bg-white/45 text-[#6B7280] hover:bg-white/70"
            onClick={onClose}
            aria-label="Close team drawer"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto py-6 space-y-7 pr-1">
          {/* Team Lead */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Team Lead</h3>
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/35 bg-white/30 p-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <UserAvatar initials={team.lead.initials} image={team.lead.avatar} className="h-11 w-11 text-xs" />
                <div>
                  <p className="text-base font-bold text-[#111827]">{team.lead.name}</p>
                  <p className="text-xs font-medium text-[#6B7280]">{team.lead.role}</p>
                </div>
              </div>
              <div className="text-right text-xs font-medium text-[#6B7280]">
                <p>{team.lead.email}</p>
                <p className="mt-0.5 text-[11px] text-[#9CA3AF]">{team.lead.phone}</p>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Team Members ({team.members.length})</h3>
            <div className="mt-3 space-y-3">
              {team.members.map((member) => (
                <div
                  key={member.email}
                  className="flex items-center justify-between rounded-2xl border border-white/35 bg-white/30 p-3.5 text-xs transition-colors hover:bg-white/45"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <UserAvatar initials={member.initials} image={member.avatar} className="h-9 w-9 text-[10px]" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#111827] truncate">{member.name}</p>
                      <p className="text-xs font-medium text-[#9CA3AF] truncate">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-medium text-[#6B7280]">
                    <p>{member.email}</p>
                    <p className="text-[11px] text-[#9CA3AF]">{member.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Responsibilities */}
          {team.responsibilities && team.responsibilities.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Responsibilities</h3>
              <div className="mt-3 space-y-2">
                {team.responsibilities.map((resp, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/35 bg-white/25 px-4 py-2.5 text-xs font-semibold text-[#111827]">
                    <CheckCircle2 size={16} className="text-[#34C759] shrink-0" />
                    <span>{resp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer CTA */}
        <div className="border-t border-white/20 pt-5">
          <GlassButton
            onClick={handleNavigateToTasks}
            variant="info"
            icon={<LayoutList size={16} />}
            className="w-full h-11 text-xs justify-center font-bold"
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
    <GlassModal open={open} className="w-[min(480px,calc(100vw-32px))] max-w-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Create Team</h2>
          <p className="mt-1 text-xs font-medium text-[#6B7280]">Add a new organizing team to the directory.</p>
        </div>
        <button
          className="flex h-8 w-8 min-h-0 items-center justify-center rounded-xl bg-white/45 text-[#6B7280] hover:bg-white/70"
          onClick={onClose}
          aria-label="Close create team modal"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-[#9CA3AF]">Team Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Design Team"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-white/35 bg-white/30 px-3.5 text-xs font-semibold text-[#111827] outline-none placeholder:text-[#9CA3AF]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#9CA3AF]">Team Lead Name</label>
          <input
            type="text"
            placeholder="e.g. Sara Sethi"
            value={leadName}
            onChange={(e) => setLeadName(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-white/35 bg-white/30 px-3.5 text-xs font-semibold text-[#111827] outline-none placeholder:text-[#9CA3AF]"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-2">
          <GlassButton type="button" onClick={onClose} className="h-9 text-xs">
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="info" icon={<Plus size={15} />} className="h-9 text-xs">
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
  }, [leadFilter, search, teams]);

  const handleCreateTeam = (newTeam) => {
    setTeams((prev) => [newTeam, ...prev]);
  };

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <PageHeader title="Teams" description="Coordinate organizing teams and monitor responsibilities." />
        <div className="flex items-center gap-3">
          <GlassButton variant="info" icon={<Plus size={17} strokeWidth={1.75} />} onClick={() => setCreateModalOpen(true)}>
            Create Team
          </GlassButton>
        </div>
      </div>

      {/* Search Bar & Optional Lead Filter */}
      <GlassCard className="p-3">
        <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
          <GlassInput
            className="h-10 min-w-[240px] flex-1 bg-white/48 text-xs"
            leftIcon={<Search size={16} strokeWidth={1.75} />}
            placeholder="Search by team name, lead, or member name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search teams"
          />
          <SelectFilter label="Lead" value={leadFilter} onChange={setLeadFilter} options={leadOptions} />
        </div>
      </GlassCard>

      {/* Minimal Team Cards Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-44 rounded-[28px]" />
          ))}
        </div>
      ) : filteredTeams.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <EmptyState
            title="No teams created."
            description="No organizing teams match your search. Create a team to build your directory."
            actionLabel="Create Team"
            onAction={() => setCreateModalOpen(true)}
          />
        </GlassCard>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTeams.map((team, index) => {
            const TeamIcon = iconMap[team.iconName] ?? Users;
            const visibleMembers = team.members.slice(0, 5);
            const remainingCount = team.members.length - visibleMembers.length;

            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02, type: "spring", stiffness: 300, damping: 28 }}
                whileHover={{ y: -3, scale: 1.01 }}
              >
                <GlassCard
                  className="group relative flex flex-col justify-between h-full rounded-[28px] p-6 transition-all hover:bg-white/55 hover:border-white/70 hover:shadow-xl cursor-pointer"
                  onClick={() => setSelectedTeam(team)}
                >
                  {/* Team Icon & Name */}
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F6C445]/20 text-[#F6C445] border border-[#F6C445]/40 transition-transform group-hover:scale-105 shadow-inner">
                      <TeamIcon size={22} strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-[#111827] truncate group-hover:text-[#F6C445] transition-colors">
                        {team.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#9CA3AF] truncate">
                        Lead: <span className="text-[#111827]">{team.lead.name}</span>
                      </p>
                    </div>
                  </div>

                  {/* Member Avatar Stack */}
                  <div className="mt-8 flex items-center justify-between border-t border-white/20 pt-4">
                    <span className="text-xs font-semibold text-[#9CA3AF]">Members ({team.members.length})</span>
                    <div className="flex items-center -space-x-2">
                      {visibleMembers.map((m) => (
                        <div key={m.email} className="ring-2 ring-white/60 rounded-full" title={`${m.name} (${m.role})`}>
                          <UserAvatar initials={m.initials} image={m.avatar} className="h-7 w-7 text-[10px]" />
                        </div>
                      ))}
                      {remainingCount > 0 && (
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/50 text-[10px] font-bold text-[#111827] ring-2 ring-white/60"
                          title={`${remainingCount} more members`}
                        >
                          +{remainingCount}
                        </span>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
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
