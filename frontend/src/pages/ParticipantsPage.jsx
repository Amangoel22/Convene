import { FileDown, FileUp, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { GlassButton } from "@/components/glass/GlassButton";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAppStore } from "@/store/useAppStore";
import { ParticipantDrawer } from "@/components/participants/ParticipantDrawer";
import {
  CreateParticipantModal,
  ImportModal,
} from "@/components/participants/ParticipantModals";
import {
  MiniBadge,
  ParticipantStatusSelect,
  SelectFilter,
  StatusPill,
} from "@/components/participants/ParticipantsComponents";

function useDebouncedValue(value, delay = 180) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
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
        if (activeEvent?.teams) setTeams(activeEvent.teams);
        return;
      }

      const res = await fetch(`http://localhost:8000/api/events/${eventId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        const rawTeams = data.event?.participantTeams || [];
        const rawParticipants = data.event?.participants || [];

        const participantStatusMap = {};
        const participantNotesMap = {};
        rawParticipants.forEach((ep) => {
          const uId = ep.userId || ep.user?.id;
          if (uId) {
            let st = ep.checkInStatus || "Confirmed";
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
            const memberStatus =
              (userId && participantStatusMap[userId]) || "Confirmed";
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
            notes: t.internalNotes || "",
            leader,
            members,
          };
        });

        const teamUserIds = new Set(
          mappedTeams.flatMap((t) => t.members.map((m) => m.id)),
        );

        rawParticipants.forEach((ep) => {
          if (ep.user && !teamUserIds.has(ep.user.id)) {
            let memberStatus = ep.checkInStatus || "Confirmed";
            if (memberStatus === "Checked_In") memberStatus = "Checked In";
            const pNotes = ep.internalNotes || "";

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

    if (activeEvent?.teams) setTeams(activeEvent.teams);
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
      await fetch(
        `http://localhost:8000/api/participants/teams/${teamId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
    } catch (err) {
      console.warn("Failed to update team status on backend:", err.message);
    }
  };

  const handleUpdateMemberStatus = async (teamId, memberId, newStatus) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          const updatedMembers = t.members.map((m) =>
            m.id === memberId ? { ...m, status: newStatus } : m,
          );
          return { ...t, members: updatedMembers };
        }
        return t;
      }),
    );
    setSelectedMember((prev) =>
      prev && prev.id === memberId ? { ...prev, status: newStatus } : prev,
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
        leader: leaderInfo,
        members: validMembers,
        notes: "Manually registered whole team.",
      };
      setTeams((prev) => [newTeamObj, ...prev]);
    }

    setCreateModalOpen(false);

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
        if (res.ok) await loadEventTeams();
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
              m.id === memberId ? { ...m, notes: noteText } : m,
            );
            return { ...t, members: updatedMembers };
          }
          return t;
        }),
      );
      setSelectedMember((prev) =>
        prev && prev.id === memberId ? { ...prev, notes: noteText } : prev,
      );

      try {
        await fetch(
          `http://localhost:8000/api/participants/${memberId}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              checkInStatus: selectedMember?.status || "Confirmed",
              internalNotes: noteText,
            }),
          },
        );
      } catch (err) {
        console.warn("Failed to update participant notes:", err.message);
      }
    } else {
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, notes: noteText } : t)),
      );
      setSelectedTeam((prev) =>
        prev && prev.id === teamId ? { ...prev, notes: noteText } : prev,
      );

      try {
        await fetch(
          `http://localhost:8000/api/participants/teams/${teamId}/notes`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ internalNotes: noteText }),
          },
        );
      } catch (err) {
        console.warn("Failed to update team notes:", err.message);
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

      {/* Overview Banner */}
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

      {/* Search & Filters */}
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

      {/* Grouped Participant Teams List */}
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

              <div className="hidden sm:grid grid-cols-[200px_1fr_130px_150px_130px_80px] items-center gap-3 bg-[#FAFAFC] px-6 py-2 border-b border-[rgba(0,0,0,0.04)] text-[10px] font-bold uppercase tracking-wider text-[#8E99A8]">
                <span>Participant</span>
                <span>Email</span>
                <span>Phone</span>
                <span>College / Org</span>
                <span>Status</span>
                <span className="text-right">Role</span>
              </div>

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

                      <div className="min-w-0 truncate">
                        <span className="font-medium text-[#5A6577] truncate">
                          {member.email}
                        </span>
                      </div>

                      <div className="min-w-0 shrink-0">
                        <span className="font-medium text-[#5A6577]">
                          {member.phone}
                        </span>
                      </div>

                      <div className="min-w-0 truncate">
                        <span className="font-semibold text-[#1A1D23] truncate">
                          {member.college || team.college || "Convene Campus"}
                        </span>
                      </div>

                      <div
                        className="shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ParticipantStatusSelect
                          status={member.status || "Confirmed"}
                          isLead={isLead}
                          onChange={(newStatus) =>
                            handleUpdateMemberStatus(
                              team.id,
                              member.id,
                              newStatus,
                            )
                          }
                        />
                      </div>

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
