// Displays persisted shift duties and lets organizing leads assign them.
import { useEffect, useMemo, useState } from "react";
import { Clock, MapPin, Plus, Search, UserCheck, Pencil } from "lucide-react";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassModal } from "@/components/glass/GlassModal";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Builds compact initials for member avatars.
function initials(name = "") {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "TM"
  );
}
// Formats an ISO timestamp as a short local time.
function timeLabel(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Time not set"
    : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
// Extracts the event date used for new duty times.
function datePart(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

// Converts the API duty shape into the card display shape.
function formatDuty(raw) {
  const assignees = (raw.assignments || []).map((assignment) => {
    const member = assignment.orgMember;
    const user = member?.user || assignment.user;
    const name = user?.name || member?.name || "Unassigned";
    return {
      id: member?.id || assignment.userId,
      userId: member?.userId || assignment.userId || null,
      name,
      role: member?.role || "member",
      team: member?.orgTeam?.name || "Organizing Team",
      initials: initials(name),
      phone: user?.phone || member?.phone || "",
    };
  });
  const first = assignees[0];
  return {
    ...raw,
    assignees,
    assignedTo: first?.name || "Unassigned",
    assignedToRole: first?.role || "Team Member",
    assignedToInitials: first?.initials || "TM",
    teamName: first?.team || "Organizing Team",
    location: raw.venue?.name || "Venue not set",
    time: `${timeLabel(raw.startAt)} – ${timeLabel(raw.endAt)}`,
    date: raw.startAt
      ? new Date(raw.startAt).toLocaleDateString()
      : "Date not set",
  };
}

export function DutiesPage() {
  const activeEvent = useAppStore((state) => state.activeEvent);
  const currentUser = useAppStore((state) => state.currentUser);
  const eventsHydrated = useAppStore((state) => state.eventsHydrated);
  const role = useAppStore((state) => state.role);
  const isLead = role === "lead";
  const [duties, setDuties] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewingDuty, setViewingDuty] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("10:00");
  const [newVenueId, setNewVenueId] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [editingDuty, setEditingDuty] = useState(false);

  const loadDuties = async () => {
    if (!activeEvent?.id) {
      if (eventsHydrated) setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    const token = localStorage.getItem("convene_token");
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [dutiesResponse, teamsResponse] = await Promise.all([
        fetch(`${API_BASE}/events/${activeEvent.id}/duties`, { headers }),
        fetch(`${API_BASE}/events/${activeEvent.id}/organizing-teams`, {
          headers,
        }),
      ]);
      if (!dutiesResponse.ok) throw new Error("Failed to load duties.");
      if (!teamsResponse.ok) throw new Error("Failed to load team members.");
      const [dutiesData, teamsData] = await Promise.all([
        dutiesResponse.json(),
        teamsResponse.json(),
      ]);
      setDuties((dutiesData.duties || []).map(formatDuty));
      setMembers(
        (teamsData.teams || []).flatMap((team) =>
          (team.members || []).map((member) => ({
            ...member,
            team: team.name,
            displayName: member.user?.name || member.name,
            initials: initials(member.user?.name || member.name),
          })),
        ),
      );
    } catch (loadError) {
      setError(loadError.message);
      setDuties([]);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDuties();
  }, [activeEvent?.id, eventsHydrated]);

  const teamOptions = useMemo(
    () => [
      "All Teams",
      ...new Set(members.map((member) => member.team).filter(Boolean)),
    ],
    [members],
  );
  const matchingMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();
    return members.filter(
      (member) =>
        !query ||
        `${member.displayName} ${member.role} ${member.team}`
          .toLowerCase()
          .includes(query),
    );
  }, [members, memberSearch]);
  const filteredDuties = useMemo(
    () =>
      duties.filter((duty) => {
        const assignedNames = duty.assignees.map((member) => member.name);
        const assignedToCurrentUser = duty.assignees.some(
          (member) => member.userId === currentUser?.id,
        );
        if (!isLead && !assignedToCurrentUser) return false;
        const query = search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          `${duty.title} ${duty.location} ${duty.teamName} ${assignedNames.join(" ")}`
            .toLowerCase()
            .includes(query);
        return (
          matchesSearch &&
          (teamFilter === "All Teams" || duty.teamName === teamFilter)
        );
      }),
    [duties, currentUser?.id, isLead, search, teamFilter],
  );

  const resetForm = () => {
    setNewTitle("");
    setNewStartTime("09:00");
    setNewEndTime("10:00");
    setNewVenueId("");
    setSelectedAssignees([]);
    setMemberSearch("");
    setNewNotes("");
  };
  const handleCreateDuty = async (event) => {
    event.preventDefault();
    if (!activeEvent?.id || !newTitle.trim()) return;
    const eventDate =
      datePart(activeEvent.startDate) || new Date().toISOString().slice(0, 10);
    const startAt = new Date(`${eventDate}T${newStartTime}:00`);
    const endAt = new Date(`${eventDate}T${newEndTime}:00`);
    if (endAt <= startAt) {
      setError("Duty end time must be after its start time.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE}/events/${activeEvent.id}/duties`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("convene_token")}`,
          },
          body: JSON.stringify({
            title: newTitle.trim(),
            startAt: startAt.toISOString(),
            endAt: endAt.toISOString(),
            venueId: newVenueId || null,
            orgMemberIds: selectedAssignees,
            notes: newNotes.trim() || null,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create duty.");
      setDuties((previous) => [formatDuty(data.duty), ...previous]);
      setCreateModalOpen(false);
      resetForm();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };
  const toggleAssignee = (memberId) =>
    setSelectedAssignees((previous) =>
      previous.includes(memberId)
        ? previous.filter((id) => id !== memberId)
        : [...previous, memberId],
    );

  // Loads the selected duty into the edit form without blank defaults.
  const beginEditDuty = () => {
    const duty = viewingDuty;
    setNewTitle(duty.title);
    setNewStartTime(new Date(duty.startAt).toTimeString().slice(0, 5));
    setNewEndTime(new Date(duty.endAt).toTimeString().slice(0, 5));
    setNewVenueId(duty.venueId || "");
    setSelectedAssignees(
      duty.assignees.map((member) => member.id).filter(Boolean),
    );
    setNewNotes(duty.notes || "");
    setMemberSearch("");
    setEditingDuty(true);
  };

  // Saves edited duty details and refreshes the visible list.
  const handleUpdateDuty = async (event) => {
    event.preventDefault();
    const date =
      datePart(viewingDuty.startAt) || new Date().toISOString().slice(0, 10);
    const startAt = new Date(`${date}T${newStartTime}:00`);
    const endAt = new Date(`${date}T${newEndTime}:00`);
    if (endAt <= startAt)
      return setError("Duty end time must be after its start time.");
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/events/${activeEvent.id}/duties/${viewingDuty.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("convene_token")}`,
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          venueId: newVenueId || null,
          orgMemberIds: selectedAssignees,
          notes: newNotes.trim() || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update duty.");
      const formatted = formatDuty(data.duty);
      setDuties((previous) =>
        previous.map((duty) => (duty.id === formatted.id ? formatted : duty)),
      );
      setViewingDuty(formatted);
      setEditingDuty(false);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1 text-token-primary">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="type-2xl weight-bold tracking-tight md:type-3xl">
            Shift Duties
          </h1>
          <p className="mt-1 type-sm text-token-secondary weight-medium">
            {isLead
              ? "Assign ground shift duties to organizing team members."
              : "View your assigned shift responsibilities and locations."}
          </p>
        </div>
        {isLead && (
          <GlassButton
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setCreateModalOpen(true)}
            className="rounded-full"
          >
            Assign New Duty
          </GlassButton>
        )}
      </div>
      {error && !editingDuty && (
        <div className="rounded-2xl border border-token-error/20 bg-token-error/10 px-4 py-3 type-xs weight-semibold text-token-error">
          {error}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-9 min-w-[240px] flex-1 items-center gap-2 rounded-full field-token border border-token px-3.5 type-xs weight-medium">
          <Search size={15} className="text-token-muted" />
          <input
            placeholder="Search duty title, assigned member, venue..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-transparent outline-none type-xs"
          />
        </div>
        <label className="flex h-9 items-center gap-2 rounded-full field-token border border-token px-3 type-xs weight-semibold text-token-secondary">
          Team:
          <select
            value={teamFilter}
            onChange={(event) => setTeamFilter(event.target.value)}
            className="bg-transparent outline-none type-xs weight-semibold"
          >
            {teamOptions.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <LoadingSkeleton className="h-64 w-full" />
      ) : filteredDuties.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title={isLead ? "No shift duties yet" : "No duties assigned to you"}
          description={
            isLead
              ? "Create a duty and assign it to any pending or registered team member."
              : "Assigned duties will appear here after an organizer assigns them to your team member record."
          }
          actionLabel={isLead ? "Assign New Duty" : undefined}
          onAction={isLead ? () => setCreateModalOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDuties.map((duty) => (
            <button
              type="button"
              key={duty.id}
              onClick={() => setViewingDuty(duty)}
              className="text-left rounded-3xl surface-card-token border border-token p-6 shadow-sm hover:border-token-accent/40 transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="type-11 weight-bold font-mono text-token-secondary flex items-center gap-1">
                  <Clock size={12} className="text-token-accent" />
                  {duty.time}
                </span>
              </div>
              <h3 className="mt-3.5 type-base weight-bold leading-snug">
                {duty.title}
              </h3>
              <p className="mt-2 flex items-center gap-1.5 type-xs weight-semibold text-token-secondary">
                <MapPin size={14} className="text-token-accent" />
                {duty.location}
              </p>
              <p className="mt-1 type-11 weight-semibold text-token-muted">
                {duty.date}
              </p>
              {duty.notes && (
                <div className="mt-3.5 rounded-2xl surface-token p-3 type-xs weight-medium text-token-secondary line-clamp-2">
                  {duty.notes}
                </div>
              )}
              <div className="mt-5 pt-3.5 border-t border-subtle-token flex items-center justify-between">
                <span className="type-11 weight-bold uppercase tracking-wider text-token-muted">
                  {duty.assignees.length} team member
                  {duty.assignees.length === 1 ? "" : "s"}
                </span>
                <span className="type-xs weight-bold">
                  {duty.assignees[0]?.name || "Unassigned"}
                  {duty.assignees.length > 1
                    ? ` +${duty.assignees.length - 1}`
                    : ""}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <GlassModal
        open={Boolean(viewingDuty)}
        className="w-[min(560px,calc(100vw-32px))] max-w-none"
      >
        {viewingDuty &&
          (editingDuty ? (
            <form onSubmit={handleUpdateDuty} className="space-y-4 pt-1">
              <h2 className="type-xl weight-bold">Edit Duty</h2>
              {error && <div role="alert" className="rounded-2xl border border-token-error/30 bg-token-error/10 px-3 py-2 type-xs weight-semibold text-token-error">{error}</div>}
              <input
                required
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                className="h-10 w-full rounded-2xl field-token px-3.5 type-xs weight-semibold outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  required
                  value={newStartTime}
                  onChange={(event) => setNewStartTime(event.target.value)}
                  className="h-10 rounded-2xl field-token px-3.5 type-xs weight-semibold outline-none"
                />
                <input
                  type="time"
                  required
                  value={newEndTime}
                  onChange={(event) => setNewEndTime(event.target.value)}
                  className="h-10 rounded-2xl field-token px-3.5 type-xs weight-semibold outline-none"
                />
              </div>
              <select
                value={newVenueId}
                onChange={(event) => setNewVenueId(event.target.value)}
                className="h-10 w-full rounded-2xl field-token px-3.5 type-xs weight-semibold outline-none"
              >
                <option value="">No venue selected</option>
                {(activeEvent?.venues || []).map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
              <div className="max-h-44 overflow-y-auto rounded-2xl border surface-card-token p-1.5 space-y-1">
                {members.map((member) => {
                  const selected = selectedAssignees.includes(member.id);
                  return (
                    <button
                      type="button"
                      key={member.id}
                      onClick={() => toggleAssignee(member.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left type-xs weight-semibold",
                        selected
                          ? "accent-surface-token text-token-accent"
                          : "hover:field-token",
                      )}
                    >
                      <span>
                        {member.displayName}{" "}
                        <span className="type-10 text-token-muted">
                          · {member.team}
                        </span>
                      </span>
                      <input type="checkbox" readOnly checked={selected} />
                    </button>
                  );
                })}
              </div>
              <textarea
                rows={3}
                value={newNotes}
                onChange={(event) => setNewNotes(event.target.value)}
                placeholder="Optional instructions"
                className="w-full resize-none rounded-2xl field-token p-3 type-xs weight-medium outline-none"
              />
              <div className="flex justify-end gap-3">
                <GlassButton
                  type="button"
                  onClick={() => setEditingDuty(false)}
                  className="h-9 type-xs rounded-full"
                >
                  Cancel
                </GlassButton>
                <GlassButton
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  className="h-9 type-xs rounded-full"
                >
                  {saving ? "Saving..." : "Save changes"}
                </GlassButton>
              </div>
            </form>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <span className="type-xs weight-bold font-mono text-token-accent">
                  {viewingDuty.time}
                </span>
              </div>
              <div>
                <h2 className="type-xl weight-bold">{viewingDuty.title}</h2>
                <p className="mt-1 flex items-center gap-1.5 type-xs weight-bold text-token-secondary">
                  <MapPin size={14} className="text-token-accent" />
                  {viewingDuty.location}
                </p>
              </div>
              <div className="rounded-2xl surface-token p-3.5">
                <p className="type-xs weight-bold uppercase tracking-wider text-token-muted">
                  Instructions / Notes
                </p>
                <p className="mt-1.5 type-xs leading-relaxed weight-medium">
                  {viewingDuty.notes || "No special instructions provided."}
                </p>
              </div>
              <div>
                <p className="type-xs weight-bold uppercase tracking-wider text-token-muted mb-2">
                  Assigned Personnel
                </p>
                <div className="space-y-2">
                  {viewingDuty.assignees.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-2xl surface-token p-3"
                    >
                      <UserAvatar
                        initials={member.initials}
                        className="h-8 w-8 type-xs accent-surface-token text-token-accent"
                      />
                      <div>
                        <p className="type-xs weight-bold">{member.name}</p>
                        <p className="type-10 weight-medium text-token-muted">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                {isLead && (
                  <GlassButton
                    onClick={beginEditDuty}
                    icon={<Pencil size={14} />}
                    className="h-9 type-xs rounded-full"
                  >
                    Edit
                  </GlassButton>
                )}
                <GlassButton
                  onClick={() => {
                    setViewingDuty(null);
                    setEditingDuty(false);
                  }}
                  className="h-9 type-xs rounded-full"
                >
                  Close
                </GlassButton>
              </div>
            </div>
          ))}
      </GlassModal>

      <GlassModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Assign New Shift Duty"
      >
        <form onSubmit={handleCreateDuty} className="space-y-4 pt-2">
          <div>
            <label className="type-xs weight-bold">Duty Title / Task</label>
            <input
              required
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="e.g. Guest Welcome & VIP Escort"
              className="mt-1 h-10 w-full rounded-2xl field-token px-3.5 type-xs weight-semibold outline-none"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="type-xs weight-bold">Start time</label>
              <input
                type="time"
                required
                value={newStartTime}
                onChange={(event) => setNewStartTime(event.target.value)}
                className="mt-1 h-10 w-full rounded-2xl field-token px-3.5 type-xs weight-semibold outline-none"
              />
            </div>
            <div>
              <label className="type-xs weight-bold">End time</label>
              <input
                type="time"
                required
                value={newEndTime}
                onChange={(event) => setNewEndTime(event.target.value)}
                className="mt-1 h-10 w-full rounded-2xl field-token px-3.5 type-xs weight-semibold outline-none"
              />
            </div>
          </div>
          <div>
            <label className="type-xs weight-bold">Venue</label>
            <select
              value={newVenueId}
              onChange={(event) => setNewVenueId(event.target.value)}
              className="mt-1 h-10 w-full rounded-2xl field-token px-3.5 type-xs weight-semibold outline-none"
            >
              <option value="">No venue selected</option>
              {(activeEvent?.venues || []).map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="type-xs weight-bold">
                Assign to team members
              </label>
              <span className="type-11 weight-bold text-token-accent">
                {selectedAssignees.length} selected
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 h-10 rounded-2xl field-token px-3.5">
              <Search size={14} className="text-token-muted" />
              <input
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Filter members or teams"
                className="w-full bg-transparent type-xs outline-none"
              />
            </div>
            <div className="mt-1 max-h-44 overflow-y-auto rounded-2xl border surface-card-token p-1.5 space-y-1">
              {matchingMembers.length === 0 ? (
                <p className="p-3 text-center type-xs text-token-muted">
                  No team members found.
                </p>
              ) : (
                matchingMembers.map((member) => {
                  const selected = selectedAssignees.includes(member.id);
                  return (
                    <button
                      type="button"
                      key={member.id}
                      onClick={() => toggleAssignee(member.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left type-xs weight-semibold",
                        selected
                          ? "accent-surface-token text-token-accent"
                          : "hover:field-token",
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <UserAvatar
                          initials={member.initials}
                          className="h-6 w-6 type-10 field-token text-token-accent"
                        />
                        <span>
                          <span className="block weight-bold">
                            {member.displayName}
                          </span>
                          <span className="block type-10 text-token-muted">
                            {member.role} · {member.team}
                          </span>
                        </span>
                      </span>
                      <input type="checkbox" readOnly checked={selected} />
                    </button>
                  );
                })
              )}
            </div>
          </div>
          <div>
            <label className="type-xs weight-bold">
              Duty Notes / Instructions
            </label>
            <textarea
              rows={3}
              value={newNotes}
              onChange={(event) => setNewNotes(event.target.value)}
              placeholder="Optional instructions"
              className="mt-1 w-full resize-none rounded-2xl field-token p-3 type-xs weight-medium outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <GlassButton
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="h-9 type-xs rounded-full"
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              icon={<Plus size={15} />}
              disabled={saving}
              className="h-9 type-xs rounded-full"
            >
              {saving ? "Saving..." : "Assign Duty"}
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
