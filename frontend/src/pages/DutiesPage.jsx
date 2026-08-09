import { useState, useMemo } from "react";
import { Plus, Search, MapPin, Clock, Users, UserCheck, Shield, ChevronDown } from "lucide-react";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassModal } from "@/components/glass/GlassModal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAppStore } from "@/store/useAppStore";
import { initialTeams } from "@/data/teams";
import { cn } from "@/lib/utils";

// Initial duties seed
const initialDuties = [
  {
    id: "duty-1",
    title: "Guest Welcome & Escort",
    time: "08:30 AM – 10:30 AM",
    location: "Main Gate & VIP Lobby",
    assignedTo: "Team Member",
    assignedToRole: "Organizing Team",
    assignedToInitials: "TM",
    teamName: "Hospitality Team",
    notes: "Receive VIP speakers at main gate and guide to VIP lounge."
  },
  {
    id: "duty-2",
    title: "Registration Desk Scanning Shift 1",
    time: "08:00 AM – 12:00 PM",
    location: "Registration Counter 1",
    assignedTo: "Team Member",
    assignedToRole: "Desk Operator",
    assignedToInitials: "TM",
    teamName: "Registration Team",
    notes: "Scan QR codes and distribute badge lanyards."
  },
  {
    id: "duty-3",
    title: "Main Stage Audio Check & Mic Host",
    time: "09:00 AM – 11:30 AM",
    location: "Main Auditorium Stage",
    assignedTo: "Aarav Kapoor",
    assignedToRole: "Stage Operator",
    assignedToInitials: "AK",
    teamName: "Stage Team",
    notes: "Ensure mic batteries are replaced and podium light is configured."
  },
  {
    id: "duty-4",
    title: "Lunch Catering & Mentor Meal Setup",
    time: "12:30 PM – 02:30 PM",
    location: "Faculty Dining Hall",
    assignedTo: "Meera Menon",
    assignedToRole: "Food Logistics",
    assignedToInitials: "MM",
    teamName: "Hospitality Team",
    notes: "Verify dietary restriction labels and restock water baskets."
  },
  {
    id: "duty-5",
    title: "Lab C WiFi & Power Outlet Monitoring",
    time: "02:00 PM – 06:00 PM",
    location: "Lab C (Floor 2)",
    assignedTo: "Rohan Nair",
    assignedToRole: "Tech Crew",
    assignedToInitials: "RN",
    teamName: "Tech Team",
    notes: "Keep extra ethernet cables and backup routers ready."
  }
];

// Extract available members from initialTeams
const allTeamMembers = initialTeams.flatMap((t) =>
  t.members.map((m) => ({
    name: m.name,
    role: m.role || "Team Member",
    team: t.name,
    initials: m.initials || m.name.substring(0, 2).toUpperCase()
  }))
);

// Ensure generic "Team Member" option is always selectable
const selectableMembers = [
  { name: "Team Member", role: "Organizing Team", team: "All Teams", initials: "TM" },
  ...allTeamMembers.filter((m) => m.name !== "Team Member")
];

export function DutiesPage() {
  const [duties, setDuties] = useState(initialDuties);
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form State for Creating Duty
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState([selectableMembers[0].name]);
  const [memberSearch, setMemberSearch] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [viewingDuty, setViewingDuty] = useState(null);

  const role = useAppStore((state) => state.role);
  const isLead = role === "lead";

  const matchingMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return selectableMembers;
    return selectableMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.team.toLowerCase().includes(q)
    );
  }, [memberSearch]);

  const toggleAssignee = (memberName) => {
    setSelectedAssignees((prev) =>
      prev.includes(memberName) ? prev.filter((n) => n !== memberName) : [...prev, memberName]
    );
  };

  const teamOptions = useMemo(() => {
    return ["All Teams", ...Array.from(new Set(initialTeams.map((t) => t.name)))];
  }, []);

  const filteredDuties = useMemo(() => {
    const query = search.trim().toLowerCase();
    return duties.filter((d) => {
      // In Team Member view, show duties assigned to "Team Member"
      const assignedNames = Array.isArray(d.assignees) ? d.assignees.map((a) => a.name) : [d.assignedTo];
      if (!isLead && !assignedNames.includes("Team Member")) {
        return false;
      }

      const matchesSearch =
        !query ||
        d.title.toLowerCase().includes(query) ||
        d.location.toLowerCase().includes(query) ||
        assignedNames.some((n) => n.toLowerCase().includes(query)) ||
        d.teamName.toLowerCase().includes(query);

      const matchesTeam = teamFilter === "All Teams" || d.teamName === teamFilter;

      return matchesSearch && matchesTeam;
    });
  }, [duties, isLead, search, teamFilter]);

  const handleCreateDuty = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLocation.trim()) return;

    const assignedObjects = selectableMembers.filter((m) => selectedAssignees.includes(m.name));
    const primaryObj = assignedObjects[0] || selectableMembers[0];

    const newDutyObj = {
      id: `duty-${Date.now()}`,
      title: newTitle.trim(),
      time: newTime.trim() || "09:00 AM – 05:00 PM",
      location: newLocation.trim(),
      assignees: assignedObjects.length > 0 ? assignedObjects : [primaryObj],
      assignedTo: primaryObj.name,
      assignedToRole: primaryObj.role,
      assignedToInitials: primaryObj.initials,
      teamName: primaryObj.team === "All Teams" ? "Organizing Team" : primaryObj.team,
      notes: newNotes.trim() || "Assigned shift duty."
    };

    setDuties([newDutyObj, ...duties]);
    setCreateModalOpen(false);

    // Reset Form
    setNewTitle("");
    setNewTime("");
    setNewLocation("");
    setSelectedAssignees([selectableMembers[0].name]);
    setNewNotes("");
  };

  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1 text-[#1A1D23]">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1D23] md:text-3xl">Shift Duties</h1>
          <p className="mt-1 text-sm text-[#5A6577] font-medium">
            {isLead
              ? "Assign ground shift duties (e.g. Guest Welcome, Desk Duty) to team members."
              : "View your assigned shift responsibilities and locations for the event."}
          </p>
        </div>
        {isLead && (
          <GlassButton
            variant="primary"
            icon={<Plus size={16} strokeWidth={2} />}
            onClick={() => setCreateModalOpen(true)}
            className="rounded-full"
          >
            Assign New Duty
          </GlassButton>
        )}
      </div>

      {/* Toolbar & Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-9 min-w-[240px] flex-1 items-center gap-2 rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-medium text-[#1A1D23] focus-within:ring-1 focus-within:ring-[#3B6FD4]">
          <Search size={15} strokeWidth={2} className="text-[#8E99A8] shrink-0" />
          <input
            type="text"
            placeholder="Search duty title, assigned member, venue location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-xs font-medium text-[#1A1D23] placeholder:text-[#8E99A8]"
          />
        </div>

        <label className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#5A6577]">
          <span>Team:</span>
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="cursor-pointer bg-transparent text-xs font-semibold text-[#1A1D23] outline-none"
          >
            {teamOptions.map((t) => (
              <option key={t} value={t} className="bg-white text-[#1A1D23]">
                {t}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className="text-[#8E99A8]" />
        </label>
      </div>

      {/* Duties Display Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDuties.map((duty) => {
          const assigneesList = Array.isArray(duty.assignees) ? duty.assignees : [{ name: duty.assignedTo, role: duty.assignedToRole, initials: duty.assignedToInitials }];

          return (
            <div
              key={duty.id}
              onClick={() => setViewingDuty(duty)}
              className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#3B6FD4]/40 transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Header Badge & Team */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3B6FD4] bg-[#EBF0FA] px-2.5 py-1 rounded-full">
                    {duty.teamName}
                  </span>
                  <span className="text-[11px] font-bold font-mono text-[#5A6577] flex items-center gap-1">
                    <Clock size={12} className="text-[#3B6FD4]" /> {duty.time}
                  </span>
                </div>

                {/* Duty Title */}
                <h3 className="mt-3.5 text-base font-bold text-[#1A1D23] leading-snug group-hover:text-[#3B6FD4] transition-colors">{duty.title}</h3>

                {/* Location Venue */}
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#5A6577]">
                  <MapPin size={14} className="text-[#3B6FD4] shrink-0" />
                  <span className="truncate">{duty.location}</span>
                </div>

                {/* Notes */}
                {duty.notes && (
                  <div className="mt-3.5 rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3 text-xs font-medium text-[#5A6577] line-clamp-2">
                    {duty.notes}
                  </div>
                )}
              </div>

              {/* Assigned Members Pill (Multi-assignee Support) */}
              <div className="mt-5 pt-3.5 border-t border-[rgba(0,0,0,0.06)] flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E99A8]">
                  {assigneesList.length > 1 ? `${assigneesList.length} Assigned` : "Assigned To"}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-2">
                    {assigneesList.slice(0, 3).map((a, idx) => (
                      <UserAvatar key={idx} initials={a.initials || a.name.substring(0, 2).toUpperCase()} className="h-7 w-7 text-[10px] bg-[#EBF0FA] text-[#3B6FD4] ring-2 ring-white" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#1A1D23]">
                    {assigneesList.length === 1 ? assigneesList[0].name : `${assigneesList[0].name} +${assigneesList.length - 1}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* VIEW DUTY DETAIL MODAL */}
      <GlassModal open={Boolean(viewingDuty)} onClose={() => setViewingDuty(null)} title="Duty Information">
        {viewingDuty && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3B6FD4] bg-[#EBF0FA] px-3 py-1 rounded-full">
                {viewingDuty.teamName}
              </span>
              <span className="text-xs font-bold font-mono text-[#3B6FD4] bg-[#EBF0FA] px-3 py-1 rounded-full flex items-center gap-1.5">
                <Clock size={13} /> {viewingDuty.time}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1A1D23]">{viewingDuty.title}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[#5A6577]">
                <MapPin size={14} className="text-[#3B6FD4]" /> {viewingDuty.location}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3.5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8E99A8]">Instructions / Notes</p>
              <p className="mt-1.5 text-xs leading-relaxed font-medium text-[#1A1D23]">
                {viewingDuty.notes || "No special instructions provided."}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#8E99A8] mb-2">Assigned Personnel</p>
              <div className="space-y-2">
                {(Array.isArray(viewingDuty.assignees) ? viewingDuty.assignees : [{ name: viewingDuty.assignedTo, role: viewingDuty.assignedToRole, initials: viewingDuty.assignedToInitials }]).map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar initials={m.initials || m.name.substring(0, 2).toUpperCase()} className="h-8 w-8 text-xs bg-[#EBF0FA] text-[#3B6FD4]" />
                      <div>
                        <p className="text-xs font-bold text-[#1A1D23]">{m.name}</p>
                        <p className="text-[10px] font-medium text-[#8E99A8]">{m.role || "Team Member"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <GlassButton onClick={() => setViewingDuty(null)} className="h-9 text-xs rounded-full">
                Close
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>

      {/* CREATE DUTY MODAL */}
      <GlassModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Assign New Shift Duty">
        <form onSubmit={handleCreateDuty} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-[#1A1D23]">Duty Title / Task</label>
            <input
              type="text"
              required
              placeholder="e.g. Guest Welcome & VIP Escort"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mt-1 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-semibold text-[#1A1D23] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#1A1D23]">Location / Venue</label>
              <input
                type="text"
                required
                placeholder="e.g. Main Gate Lobby"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-semibold text-[#1A1D23] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1A1D23]">Shift Timings</label>
              <input
                type="text"
                placeholder="e.g. 08:30 AM – 10:30 AM"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-semibold text-[#1A1D23] outline-none"
              />
            </div>
          </div>

          {/* Searchable Multi-Member Picker */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1A1D23]">Assign To Team Members (Multi-select)</label>
              <span className="text-[11px] font-bold text-[#3B6FD4]">{selectedAssignees.length} selected</span>
            </div>
            <div className="mt-1 space-y-1.5">
              <div className="flex items-center gap-2 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 focus-within:ring-1 focus-within:ring-[#3B6FD4]">
                <Search size={14} className="text-[#8E99A8] shrink-0" />
                <input
                  type="text"
                  placeholder="Type name, role, or team to filter..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-[#1A1D23] outline-none placeholder:text-[#8E99A8]"
                />
              </div>

              {/* Filtered Members List Multi-Select Box */}
              <div className="max-h-44 overflow-y-auto rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white p-1.5 space-y-1 shadow-inner">
                {matchingMembers.length === 0 ? (
                  <p className="p-3 text-center text-xs font-medium text-[#8E99A8]">No matching team members found.</p>
                ) : (
                  matchingMembers.map((m) => {
                    const isSelected = selectedAssignees.includes(m.name);
                    return (
                      <div
                        key={`${m.name}-${m.team}`}
                        onClick={() => toggleAssignee(m.name)}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer transition-colors",
                          isSelected
                            ? "bg-[#EBF0FA] text-[#3B6FD4] border border-[#3B6FD4]/30"
                            : "text-[#1A1D23] hover:bg-[#F0F2F5]"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar initials={m.initials} className="h-6 w-6 text-[10px] bg-[#F0F2F5] text-[#3B6FD4]" />
                          <div className="min-w-0">
                            <p className="font-bold truncate">{m.name}</p>
                            <p className="text-[10px] font-medium text-[#8E99A8] truncate">{m.role} • {m.team}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4 w-4 rounded accent-[#3B6FD4] pointer-events-none"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1A1D23]">Duty Notes / Instructions</label>
            <textarea
              rows={3}
              placeholder="e.g. Receive VIP speakers at main entrance and guide to lounge."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="mt-1 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] p-3 text-xs font-medium text-[#1A1D23] outline-none resize-none"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <GlassButton type="button" onClick={() => setCreateModalOpen(false)} className="h-9 text-xs rounded-full">
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" icon={<Plus size={15} />} className="h-9 text-xs rounded-full">
              Assign Duty
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
