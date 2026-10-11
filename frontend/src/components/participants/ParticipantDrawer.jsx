// Purpose: ParticipantDrawer implements this source module.
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Plus, QrCode, X, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { GlassButton } from "@/components/glass/GlassButton";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { StatusPill } from "./ParticipantsComponents";
import { cn } from "@/lib/utils";
import { COLORS } from "@/constants/colors";

function Info({ label, value }) {
  return (
    <div className={`rounded-2xl bg-[${COLORS.cardBg}] border border-subtle-token p-3`}>
      <p className={`type-11 weight-semibold text-[${COLORS.grayMuted}]`}>{label}</p>
      <p className={`mt-0.5 truncate type-sm weight-bold text-[${COLORS.dark}]`}>
        {value || "N/A"}
      </p>
    </div>
  );
}

export function ParticipantDrawer({
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
  const currentStatus = isIndividual
    ? member.status || "Confirmed"
    : team.status || "Confirmed";
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
    await onSaveNotes(
      isIndividual ? "member" : "team",
      team.id,
      member?.id,
      noteText,
    );
    setIsEditingNote(false);
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
        className="fixed bottom-4 right-4 top-4 z-50 w-[min(520px,calc(100vw-32px))] overflow-y-auto rounded-3xl surface-card-token border border-token p-6 shadow-xl text-token-primary"
        initial={{ x: 540, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 540, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <StatusPill status={currentStatus} />
              <span className="type-11 weight-bold uppercase tracking-wider text-token-muted">
                {isIndividual ? "Teammate Profile" : "Team Overview"}
              </span>
            </div>
            <h2 className="mt-1 type-2xl weight-bold text-token-primary">
              {isIndividual ? member.name : `${team.team}: ${team.teamName}`}
            </h2>
            {isIndividual && (
              <p className="mt-0.5 type-xs weight-semibold text-token-secondary">
                {team.team}: {team.teamName} •{" "}
                {member.role === "Leader" ? "Team Leader" : "Team Member"}
              </p>
            )}
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full field-token text-token-secondary hover:hover-token hover:text-token-primary"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {isLead && (
          <div className="mt-5 flex items-center justify-between rounded-2xl accent-surface-token border border-token-accent/20 p-3.5">
            <span className="type-xs weight-bold text-token-accent">
              {isIndividual ? "Update Participant Status" : "Update Team Status"}
            </span>
            <div className="relative inline-flex items-center">
              <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="cursor-pointer appearance-none rounded-full surface-card-token border border-token-accent/30 pl-3 pr-7 py-1 type-xs weight-bold text-token-primary outline-none shadow-sm"
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
            </div>
          </div>
        )}

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
          <h3 className="type-sm weight-bold text-token-primary">
            Team Members ({team.members.length})
          </h3>
          <div className="mt-3 space-y-2">
            {team.members.map((m) => (
              <div
                key={m.id || m.email}
                className={cn(
                  "rounded-2xl border p-3 transition-colors",
                  isIndividual &&
                    (m.id === member.id || m.email === member.email)
                    ? "accent-surface-token border-token-accent/30"
                    : "surface-token border-subtle-token",
                )}
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    initials={m.initials}
                    image={m.avatar}
                    className="accent-surface-token text-token-accent"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate type-sm weight-bold text-token-primary">
                      {m.name}
                    </p>
                    <p className="truncate type-xs weight-medium text-token-muted">
                      {m.email}
                    </p>
                  </div>
                </div>
                <p className="mt-2 type-xs weight-medium text-token-secondary">
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
              className="justify-start rounded-full type-xs"
            >
              Mark Check-In
            </GlassButton>
            {isIndividual ? (
              <GlassButton
                variant="secondary"
                icon={<QrCode size={16} strokeWidth={2} />}
                className="justify-start rounded-full type-xs"
              >
                Generate QR
              </GlassButton>
            ) : (
              <GlassButton
                variant="secondary"
                icon={<Award size={16} strokeWidth={2} />}
                className="justify-start rounded-full type-xs"
              >
                Issue Certificate
              </GlassButton>
            )}
            <GlassButton
              variant="secondary"
              icon={<Plus size={16} strokeWidth={2} />}
              onClick={() => setIsEditingNote(true)}
              className="justify-start rounded-full type-xs"
            >
              {isEditingNote ? "Editing Note..." : "Add Note"}
            </GlassButton>
          </div>
        )}

        <div className="mt-6 rounded-2xl surface-token border border-subtle-token p-4">
          <div className="flex items-center justify-between">
            <p className="type-xs weight-bold uppercase tracking-wider text-token-primary">
              {isIndividual
                ? "Participant Internal Notes"
                : "Team Internal Notes"}
            </p>
            {!isEditingNote && isLead && (
              <button
                onClick={() => setIsEditingNote(true)}
                className="type-xs weight-bold text-token-accent hover:underline"
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
                className="w-full rounded-xl border border-token-medium p-2.5 type-xs weight-semibold text-token-primary outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsEditingNote(false)}
                  className="px-3 py-1 rounded-full type-xs weight-bold text-token-secondary hover-token"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNoteSubmit}
                  className="px-3 py-1 rounded-full type-xs weight-bold text-token-inverse bg-token-accent"
                >
                  Save Note
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1.5 type-sm leading-relaxed text-token-secondary weight-medium">
              {currentNotes ||
                (isIndividual
                  ? "No participant notes added yet."
                  : "No team notes added yet.")}
            </p>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
