// Purpose: TeamsPage implements this source module.
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
  KeyRound,
  RefreshCw,
  Search,
  Trash2,
  Truck,
  UserCheck,
  Users,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassModal } from "@/components/glass/GlassModal";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAppStore } from "@/store/useAppStore";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function formatTeam(team) {
  const members = team.members || [];
  const leadMember =
    members.find((member) => member.role === "leader") ||
    members.find((member) => member.role === "co-leader") ||
    members[0];
  const leadUser = leadMember?.user;
  const leadName = leadUser?.name || leadMember?.name || "Unassigned";
  const leadRole = (leadMember?.role || "member").replace("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  return {
    ...team,
    iconName: "Users",
    slug: team.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    lead: {
      name: leadName,
      role: leadRole,
      initials: leadName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      email: leadUser?.email || "",
      phone: leadUser?.phone || leadMember?.phone || "",
      avatar: leadUser?.avatarUrl,
    },
    members: members.map((member) => {
      const user = member.user;
      const name = user?.name || member.name;
      return {
        ...member,
        name,
        role: member.role || "member",
        accessLevel: member.accessLevel === "lead" ? "lead" : "member",
        initials: name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        email: user?.email || "",
        phone: user?.phone || member.phone || "",
        avatar: user?.avatarUrl,
      };
    }),
  };
}

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
  HeartHandshake,
};

function SelectFilter({ value, onChange, options, label }) {
  return (
    <label className="filter-chip flex h-9 shrink-0 items-center rounded-full field-token border border-token pl-3 type-xs weight-semibold text-token-secondary">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent type-xs weight-semibold text-token-primary outline-none pr-1"
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
    </label>
  );
}

function TeamDrawer({
  team,
  onClose,
  onEditMember,
  onAddMember,
  onRemoveMember,
  onViewKey,
  isLead,
}) {
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
        className="fixed inset-0 z-40 bg-token-black/20 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        className="fixed bottom-4 right-4 top-4 z-50 flex w-[min(540px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl surface-card-token border border-token p-7 shadow-xl text-token-primary"
        initial={{ x: 600, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 600, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-4 border-b border-subtle-token pb-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl accent-surface-token text-token-accent">
              <TeamIcon size={24} strokeWidth={2} />
            </div>
            <div>
              <h2 className="type-2xl weight-bold text-token-primary">{team.name}</h2>
              <p className="mt-0.5 type-xs weight-semibold text-token-muted">
                {team.members.length} Team Members
              </p>
            </div>
          </div>
          <button
            className="flex h-9 w-9 min-h-0 items-center justify-center rounded-full field-token text-token-secondary hover:hover-token hover:text-token-primary"
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
            <h3 className="type-xs weight-bold uppercase tracking-wider text-token-muted">
              Team Lead
            </h3>
            <div className="mt-3 flex items-center justify-between rounded-2xl surface-token border border-subtle-token p-4">
              <div className="flex items-center gap-3.5">
                <UserAvatar
                  initials={team.lead.initials}
                  image={team.lead.avatar}
                  className="h-11 w-11 type-xs accent-surface-token text-token-accent"
                />
                <div>
                  <p className="type-base weight-bold text-token-primary">
                    {team.lead.name}
                  </p>
                  <p className="type-xs weight-medium text-token-secondary">
                    {team.lead.role}
                  </p>
                </div>
              </div>
              <div className="text-right type-xs weight-medium text-token-secondary">
                <p className="mt-0.5 type-11 text-token-muted">
                  {team.lead.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="type-xs weight-bold uppercase tracking-wider text-token-muted">
                Team Members ({team.members.length})
              </h3>
              {isLead && (
                <button
                  type="button"
                  onClick={() => onAddMember(team)}
                  className="type-xs weight-bold text-token-accent"
                >
                  + Add member
                </button>
              )}
            </div>
            <div className="mt-3 space-y-2">
              {team.members.map((member) => (
                <div
                  key={member.id || `${member.name}-${member.phone}`}
                  className="flex items-center justify-between rounded-2xl surface-token border border-subtle-token p-3.5 type-xs transition-colors hover:field-token"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <UserAvatar
                      initials={member.initials}
                      image={member.avatar}
                      className="h-9 w-9 type-10 accent-surface-token text-token-accent"
                    />
                    <div className="min-w-0">
                      <p className="type-sm weight-bold text-token-primary truncate">
                        {member.name}
                      </p>
                      <p className="type-xs weight-medium text-token-muted truncate">
                        {member.role} · {member.accessLevel === "lead" ? "Lead Organizer" : "Member"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 weight-medium text-token-secondary">
                    <p className="type-11 text-token-muted">{member.phone}</p>
                  </div>
                  {isLead && (
                    <>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditMember(member);
                        }}
                        className="ml-3 type-xs weight-bold text-token-accent"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onViewKey(member);
                        }}
                        className="ml-2 type-xs weight-bold text-token-accent"
                      >
                        <KeyRound size={13} className="mr-1 inline-block" />
                        View Key
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRemoveMember(member);
                        }}
                        className="ml-2 type-xs weight-bold text-token-error"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Responsibilities */}
          {team.responsibilities && team.responsibilities.length > 0 && (
            <div>
              <h3 className="type-xs weight-bold uppercase tracking-wider text-token-muted">
                Responsibilities
              </h3>
              <div className="mt-3 space-y-2">
                {team.responsibilities.map((resp, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-2xl surface-token border border-subtle-token px-4 py-2.5 type-xs weight-semibold text-token-primary"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-token-success shrink-0"
                    />
                    <span>{resp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer CTA */}
        <div className="border-t border-subtle-token pt-5">
          <GlassButton
            onClick={handleNavigateToTasks}
            variant="primary"
            icon={<LayoutList size={16} />}
            className="w-full h-10 type-xs justify-center weight-bold rounded-full"
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
  const [members, setMembers] = useState([
    { name: "", phone: "", role: "member" },
  ]);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    setMembers((current) => {
      const sanitized = current.map((member) => ({
        ...member,
        phone: member.phone.replace(/\D/g, "").slice(0, 10),
      }));
      return sanitized.every(
        (member, index) => member.phone === current[index].phone,
      )
        ? current
        : sanitized;
    });
  }, [members]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (
      members.some(
        (member) => member.name.trim() && !/^\d{10}$/.test(member.phone),
      )
    ) {
      setPhoneError("Every added member must have a 10-digit phone number.");
      return;
    }
    setPhoneError("");

    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    const newTeam = {
      id: `team-${Date.now()}`,
      slug,
      name: name.trim(),
      iconName: "Users",
      members: members.filter((member) => member.name.trim()),
      responsibilities: ["Operational management and team oversight"],
    };

    const created = await onCreateTeam({ ...newTeam, members });
    if (!created) return;
    setName("");
    setMembers([{ name: "", phone: "", role: "member" }]);
    setPhoneError("");
    onClose();
  };

  return (
    <GlassModal
      open={open}
      className="w-[min(680px,calc(100vw-32px))] max-w-none surface-card-token border border-token rounded-3xl p-6 text-token-primary"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="type-xl weight-bold text-token-primary">Create Team</h2>
          <p className="mt-1 type-xs weight-medium text-token-secondary">
            Add a new organizing team to the directory.
          </p>
        </div>

        <button
          className="flex h-8 w-8 min-h-0 items-center justify-center rounded-full field-token text-token-secondary hover:hover-token hover:text-token-primary"
          onClick={onClose}
          aria-label="Close create team modal"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="type-xs weight-semibold text-token-muted">
            Team Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Design Team"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-10 w-full rounded-full field-token border border-token px-4 type-xs weight-semibold text-token-primary outline-none placeholder:text-token-muted"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="type-xs weight-semibold text-token-muted">
              Team Members
            </label>
            <button
              type="button"
              onClick={() =>
                setMembers((current) => [
                  ...current,
                  { name: "", phone: "", role: "member" },
                ])
              }
              className="flex items-center gap-1 type-xs weight-bold text-token-accent"
            >
              <Plus size={14} /> Add member
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {members.map((member, index) => (
              <div
                key={index}
                className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_128px_32px] items-center gap-2"
              >
                <input
                  required={index === 0}
                  placeholder="Name"
                  value={member.name}
                  onChange={(e) =>
                    setMembers((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, name: e.target.value } : item,
                      ),
                    )
                  }
                  className="h-9 min-w-0 rounded-full field-token border border-token px-3 type-xs outline-none"
                />
                <input
                  placeholder="Phone"
                  value={member.phone}
                  onChange={(e) =>
                    setMembers((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, phone: e.target.value } : item,
                      ),
                    )
                  }
                  className="h-9 min-w-0 rounded-full field-token border border-token px-3 type-xs outline-none"
                />
                <div className="relative min-w-0">
                  <select
                    value={member.role}
                    onChange={(e) =>
                      setMembers((current) =>
                        current.map((item, i) =>
                          i === index
                            ? { ...item, role: e.target.value }
                            : item,
                        ),
                      )
                    }
                    className="h-9 w-full appearance-none rounded-full field-token border border-token pl-3 pr-8 type-xs outline-none"
                  >
                    <option value="leader">Leader</option>
                    <option value="co-leader">Co-leader</option>
                    <option value="member">Member</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setMembers((current) =>
                      current.filter((_, i) => i !== index),
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full text-token-muted hover:error-surface-token hover:text-token-error"
                  aria-label="Remove member"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {phoneError && (
          <p className="-mt-2 type-xs weight-semibold text-token-error">
            {phoneError}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3 pt-2">
          <GlassButton
            type="button"
            onClick={onClose}
            className="h-9 type-xs rounded-full"
          >
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            icon={<Plus size={15} />}
            className="h-9 type-xs rounded-full"
          >
            Create Team
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}

function InviteKeyModal({ member, onClose, onRegenerate }) {
  if (!member) return null;
  return (
    <GlassModal open={Boolean(member)} onClose={onClose} title="Event Invite Key">
      <div className="space-y-5">
        <p className="type-sm text-token-secondary">Share this key with {member.name}. They must enter it during registration to join this event.</p>
        <div className="rounded-2xl border border-token-accent/20 accent-surface-token px-5 py-6 text-center">
          <p className="type-10 weight-bold uppercase tracking-widest text-token-secondary">Invite key</p>
          <p className="mt-2 font-mono type-2xl weight-extrabold tracking-[0.2em] text-token-accent-dark">{member.inviteKey || "Unavailable"}</p>
        </div>
        <div className="flex justify-end gap-3">
          <GlassButton type="button" onClick={onClose} className="h-9 rounded-full type-xs">Close</GlassButton>
          <GlassButton type="button" variant="primary" icon={<RefreshCw size={14} />} onClick={() => onRegenerate(member)} className="h-9 rounded-full type-xs">Regenerate</GlassButton>
        </div>
      </div>
    </GlassModal>
  );
}

function EditMemberModal({ member, teams, onClose, onSave }) {
  const [name, setName] = useState(member?.name || "");
  const [phone, setPhone] = useState(member?.phone || "");
  const [role, setRole] = useState(member?.role || "member");
  const [accessLevel, setAccessLevel] = useState(member?.accessLevel || "member");
  const [teamId, setTeamId] = useState(member?.orgTeamId || "");
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (!member) return;
    setName(member.name || "");
    setPhone(member.phone || "");
    setRole((member.role || "member").toLowerCase().replace(" ", "-"));
    setAccessLevel(member.accessLevel === "lead" ? "lead" : "member");
    setTeamId(member.orgTeamId || "");
    setErrors({});
  }, [member]);
  if (!member) return null;
  return (
    <GlassModal
      open={Boolean(member)}
      className="w-[min(520px,calc(100vw-32px))] max-w-none rounded-3xl surface-card-token p-6 text-token-primary"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="type-xl weight-bold">Edit Team Member</h2>
          <p className="mt-1 type-xs text-token-secondary">
            Update member details and assignment.
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full field-token"
        >
          <X size={16} />
        </button>
      </div>
      <form
        className="mt-5 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const nextErrors = {
            ...(name.trim() ? {} : { name: "Name is required." }),
            ...(phone.match(/^\d{10}$/)
              ? {}
              : { phone: "Phone number is 10 digits." }),
            ...(role ? {} : { role: "Role is required." }),
            ...(accessLevel ? {} : { accessLevel: "Organizer access is required." }),
            ...(teamId ? {} : { team: "Team is required." }),
          };
          setErrors(nextErrors);
          if (!Object.keys(nextErrors).length)
            onSave({ name, phone, role, accessLevel, orgTeamId: teamId });
        }}
      >
        <div>
          <input
            value={name}
            onChange={(event) => { setName(event.target.value); setErrors((current) => ({ ...current, name: "" })); }}
            placeholder="Name"
            className="h-10 w-full rounded-full field-token px-4 type-xs outline-none"
          />
          {errors.name && (
            <p className="mt-1 type-11 text-token-error">{errors.name}</p>
          )}
        </div>
        <div>
          <input
            pattern="\d{10}"
            maxLength={10}
            inputMode="numeric"
            value={phone}
            onChange={(event) => { setPhone(event.target.value.replace(/\D/g, "").slice(0, 10)); setErrors((current) => ({ ...current, phone: "" })); }}
            placeholder="10-digit phone number"
            className="h-10 w-full rounded-full field-token px-4 type-xs outline-none"
          />
          {errors.phone && (
            <p className="mt-1 type-11 text-token-error">{errors.phone}</p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block type-10 weight-bold uppercase tracking-wide text-token-muted">Team role</label>
            <div className="relative"><select
              value={role}
              onChange={(event) => { setRole(event.target.value); setErrors((current) => ({ ...current, role: "" })); }}
              className="h-10 w-full appearance-none rounded-full field-token pl-3 pr-8 type-xs outline-none"
            >
              <option value="">Select role</option>
              <option value="leader">Leader</option>
              <option value="co-leader">Co-leader</option>
              <option value="member">Member</option>
            </select></div>
            {errors.role && (
              <p className="mt-1 type-11 text-token-error">{errors.role}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block type-10 weight-bold uppercase tracking-wide text-token-muted">Event access</label>
            <div className="relative"><select
              value={accessLevel}
              onChange={(event) => { setAccessLevel(event.target.value); setErrors((current) => ({ ...current, accessLevel: "" })); }}
              className="h-10 w-full appearance-none rounded-full field-token pl-3 pr-8 type-xs outline-none"
            >
              <option value="">Select access</option>
              <option value="lead">Lead Organizer</option>
              <option value="member">Member</option>
            </select></div>
            {errors.accessLevel && (
              <p className="mt-1 type-11 text-token-error">{errors.accessLevel}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block type-10 weight-bold uppercase tracking-wide text-token-muted">Team</label>
            <div className="relative"><select
              value={teamId}
              onChange={(event) => { setTeamId(event.target.value); setErrors((current) => ({ ...current, team: "" })); }}
              className="h-10 w-full appearance-none rounded-full field-token pl-3 pr-8 type-xs outline-none"
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select></div>
            {errors.team && (
              <p className="mt-1 type-11 text-token-error">{errors.team}</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <GlassButton
            type="button"
            onClick={onClose}
            className="h-9 rounded-full type-xs"
          >
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            className="h-9 rounded-full type-xs"
          >
            Save changes
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}

export function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [leadFilter, setLeadFilter] = useState("All Leads");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingMember, setEditingMember] = useState(null);
  const [addingMember, setAddingMember] = useState(null);
  const [viewingMemberKey, setViewingMemberKey] = useState(null);

  const role = useAppStore((state) => state.role);
  const isLead = role === "lead";
  const activeEvent = useAppStore((state) => state.activeEvent);
  const eventsHydrated = useAppStore((state) => state.eventsHydrated);

  useEffect(() => {
    if (!activeEvent?.id) {
      if (eventsHydrated) setLoading(false);
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("convene_token");
    fetch(`${API_BASE}/events/${activeEvent.id}/organizing-teams`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) setTeams((data.teams || []).map(formatTeam));
      })
      .finally(() => setLoading(false));
  }, [activeEvent?.id, eventsHydrated]);

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

      const matchesLead =
        leadFilter === "All Leads" || team.lead.name === leadFilter;

      return matchesSearch && matchesLead;
    });
  }, [isLead, leadFilter, search, teams]);

  const handleCreateTeam = async (newTeam) => {
    if (!activeEvent?.id) {
      setError("No active event selected.");
      return false;
    }
    const token = localStorage.getItem("convene_token");
    const res = await fetch(
      `${API_BASE}/events/${activeEvent.id}/organizing-teams`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newTeam.name,
          members: newTeam.members || [],
        }),
      },
    );
    const data = await res.json();
    if (res.ok) {
      setTeams((prev) => [formatTeam(data.team), ...prev]);
      return true;
    }
    setError(data.error || "Failed to create team.");
    return false;
  };

  const handleAddMember = async (team) => {
    setAddingMember({
      name: "",
      phone: "",
      role: "member",
      accessLevel: "member",
      orgTeamId: team.id,
    });
  };

  const handleSaveNewMember = async ({ name, phone, role, accessLevel }) => {
    const token = localStorage.getItem("convene_token");
    const res = await fetch(
      `${API_BASE}/events/${activeEvent.id}/organizing-teams/${addingMember.orgTeamId}/members`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone, role, accessLevel }),
      },
    );
    if (!res.ok) return;
    const data = await res.json();
    const updated = teams.find((item) => item.id === addingMember.orgTeamId);
    const nextTeam = formatTeam({
      ...updated,
      members: [...(updated?.members || []), data.member],
    });
    setTeams((prev) =>
      prev.map((item) =>
        item.id === addingMember.orgTeamId ? nextTeam : item,
      ),
    );
    setSelectedTeam(nextTeam);
    setAddingMember(null);
  };

  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Remove ${member.name} from this team?`)) return;
    const token = localStorage.getItem("convene_token");
    const res = await fetch(
      `${API_BASE}/events/${activeEvent.id}/organizing-teams/${selectedTeam.id}/members/${member.id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
    if (res.ok) {
      const nextTeams = teams.map((team) =>
        team.id === selectedTeam.id
          ? formatTeam({
              ...team,
              members: team.members.filter((item) => item.id !== member.id),
            })
          : team,
      );
      setTeams(nextTeams);
      setSelectedTeam(
        nextTeams.find((team) => team.id === selectedTeam.id) || null,
      );
    }
  };

  const handleEditMember = (member) =>
    setEditingMember({ ...member, orgTeamId: selectedTeam.id });

  const handleRegenerateKey = async (member) => {
    setError("");
    const token = localStorage.getItem("convene_token");
    const res = await fetch(`${API_BASE}/events/${activeEvent.id}/organizing-teams/${selectedTeam.id}/members/${member.id}/key`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not regenerate the invite key.");
      return;
    }
    const nextTeams = teams.map((team) => team.id === selectedTeam.id
      ? formatTeam({ ...team, members: team.members.map((item) => item.id === member.id ? { ...item, inviteKey: data.inviteKey } : item) })
      : team);
    setTeams(nextTeams);
    const nextTeam = nextTeams.find((team) => team.id === selectedTeam.id);
    setSelectedTeam(nextTeam);
    setViewingMemberKey(nextTeam.members.find((item) => item.id === member.id));
  };

  const handleSaveMember = async ({ name, phone, role, accessLevel, orgTeamId }) => {
    const token = localStorage.getItem("convene_token");
    const res = await fetch(
      `${API_BASE}/events/${activeEvent.id}/organizing-teams/${editingMember.orgTeamId}/members/${editingMember.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), phone, role, accessLevel, orgTeamId }),
      },
    );
    if (res.ok) {
      const moved = teams
        .map((team) =>
          team.id === editingMember.orgTeamId
            ? {
                ...team,
                members: team.members.filter(
                  (item) => item.id !== editingMember.id,
                ),
              }
            : team,
        )
        .map((team) =>
          team.id === orgTeamId
            ? {
                ...team,
                members: [
                  ...team.members,
                  {
                    ...editingMember,
                    name: name.trim(),
                    phone,
                    role,
                    accessLevel,
                    orgTeamId,
                  },
                ],
              }
            : team,
        )
        .map(formatTeam);
      setTeams(moved);
      setSelectedTeam(moved.find((team) => team.id === orgTeamId) || null);
      setEditingMember(null);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1">
      {error && (
        <div className="rounded-2xl border border-token-error-light error-surface-token px-4 py-3 type-sm weight-semibold text-token-error">
          {error}
        </div>
      )}
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="type-2xl weight-bold tracking-tight text-token-primary md:type-3xl">
            Teams
          </h1>
          <p className="mt-1 type-sm text-token-secondary weight-medium">
            Coordinate organizing teams and monitor responsibilities.
          </p>
        </div>
        {isLead && (
          <div className="flex items-center gap-3">
            <GlassButton
              variant="primary"
              icon={<Plus size={16} strokeWidth={2} />}
              onClick={() => setCreateModalOpen(true)}
              className="rounded-full"
            >
              Create Team
            </GlassButton>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
        <div className="flex h-9 min-w-[240px] flex-1 items-center gap-2 rounded-full field-token border border-token px-3.5 type-xs weight-medium text-token-primary focus-within:ring-1 focus-within:ring-token-accent">
          <Search
            size={15}
            strokeWidth={2}
            className="text-token-muted shrink-0"
          />
          <input
            type="text"
            placeholder="Search by team name, lead, or member name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none type-xs weight-medium text-token-primary placeholder:text-token-muted"
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
        <div className="p-10 text-center rounded-2xl border border-token surface-card-token">
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
                className="group relative flex flex-col justify-between h-full rounded-3xl surface-card-token border border-token p-6 transition-colors hover-surface-token cursor-pointer shadow-token-card"
                onClick={() => setSelectedTeam(team)}
              >
                {/* Team Icon & Name */}
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl accent-surface-token text-token-accent">
                    <TeamIcon size={20} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="type-base weight-bold text-token-primary truncate">
                      {team.name}
                    </h3>
                    <p className="type-xs weight-semibold text-token-muted truncate mt-0.5">
                      Lead:{" "}
                      <span className="text-token-secondary">{team.lead.name}</span>
                    </p>
                  </div>
                </div>

                {/* Member Avatar Stack */}
                <div className="mt-8 flex items-center justify-between border-t border-subtle-token pt-4">
                  <span className="type-xs weight-semibold text-token-muted">
                    Members ({team.members.length})
                  </span>
                  <div className="flex items-center -space-x-2">
                    {visibleMembers.map((m) => (
                      <div
                        key={m.id || `${m.name}-${m.phone}`}
                        className="ring-2 ring-token-inverse rounded-full"
                        title={`${m.name} (${m.role})`}
                      >
                        <UserAvatar
                          initials={m.initials}
                          image={m.avatar}
                          className="h-7 w-7 type-10 accent-surface-token text-token-accent"
                        />
                      </div>
                    ))}
                    {remainingCount > 0 && (
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full accent-surface-token type-10 weight-bold text-token-accent ring-2 ring-token-inverse"
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
      <TeamDrawer
        team={selectedTeam}
        onClose={() => setSelectedTeam(null)}
        onEditMember={handleEditMember}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
        onViewKey={setViewingMemberKey}
        isLead={isLead}
      />
      <InviteKeyModal member={isLead ? viewingMemberKey : null} onClose={() => setViewingMemberKey(null)} onRegenerate={handleRegenerateKey} />
      <EditMemberModal
        member={isLead ? editingMember : null}
        teams={teams}
        onClose={() => setEditingMember(null)}
        onSave={handleSaveMember}
      />
      <EditMemberModal
        member={isLead ? addingMember : null}
        teams={teams}
        onClose={() => setAddingMember(null)}
        onSave={handleSaveNewMember}
      />

      {/* Create Team Modal */}
      <CreateTeamModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreateTeam={handleCreateTeam}
      />
    </div>
  );
}
