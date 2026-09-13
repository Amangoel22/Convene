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
    <div className={`rounded-2xl bg-[${COLORS.cardBg}] border border-[rgba(0,0,0,0.06)] p-3`}>
      <p className={`text-[11px] font-semibold text-[${COLORS.grayMuted}]`}>{label}</p>
      <p className={`mt-0.5 truncate text-sm font-bold text-[${COLORS.dark}]`}>
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
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
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
              <StatusPill status={currentStatus} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E99A8]">
                {isIndividual ? "Teammate Profile" : "Team Overview"}
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-[#1A1D23]">
              {isIndividual ? member.name : `${team.team}: ${team.teamName}`}
            </h2>
            {isIndividual && (
              <p className="mt-0.5 text-xs font-semibold text-[#5A6577]">
                {team.team}: {team.teamName} •{" "}
                {member.role === "Leader" ? "Team Leader" : "Team Member"}
              </p>
            )}
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23]"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {isLead && (
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#EBF0FA] border border-[#3B6FD4]/20 p-3.5">
            <span className="text-xs font-bold text-[#3B6FD4]">
              {isIndividual ? "Update Participant Status" : "Update Team Status"}
            </span>
            <div className="relative inline-flex items-center">
              <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="cursor-pointer appearance-none rounded-full bg-white border border-[#3B6FD4]/30 pl-3 pr-7 py-1 text-xs font-bold text-[#1A1D23] outline-none shadow-sm"
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
              <ChevronDown
                size={13}
                strokeWidth={2}
                className="absolute right-2.5 text-[#8E99A8] pointer-events-none"
              />
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
          <h3 className="text-sm font-bold text-[#1A1D23]">
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
                    ? "bg-[#EBF0FA] border-[#3B6FD4]/30"
                    : "bg-[#F7F8FA] border-[rgba(0,0,0,0.06)]",
                )}
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    initials={m.initials}
                    image={m.avatar}
                    className="bg-[#EBF0FA] text-[#3B6FD4]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#1A1D23]">
                      {m.name}
                    </p>
                    <p className="truncate text-xs font-medium text-[#8E99A8]">
                      {m.email}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs font-medium text-[#5A6577]">
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
              className="justify-start rounded-full text-xs"
            >
              Mark Check-In
            </GlassButton>
            {isIndividual ? (
              <GlassButton
                variant="secondary"
                icon={<QrCode size={16} strokeWidth={2} />}
                className="justify-start rounded-full text-xs"
              >
                Generate QR
              </GlassButton>
            ) : (
              <GlassButton
                variant="secondary"
                icon={<Award size={16} strokeWidth={2} />}
                className="justify-start rounded-full text-xs"
              >
                Issue Certificate
              </GlassButton>
            )}
            <GlassButton
              variant="secondary"
              icon={<Plus size={16} strokeWidth={2} />}
              onClick={() => setIsEditingNote(true)}
              className="justify-start rounded-full text-xs"
            >
              {isEditingNote ? "Editing Note..." : "Add Note"}
            </GlassButton>
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-[#1A1D23]">
              {isIndividual
                ? "Participant Internal Notes"
                : "Team Internal Notes"}
            </p>
            {!isEditingNote && isLead && (
              <button
                onClick={() => setIsEditingNote(true)}
                className="text-xs font-bold text-[#3B6FD4] hover:underline"
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
                className="w-full rounded-xl border border-[rgba(0,0,0,0.12)] p-2.5 text-xs font-semibold text-[#1A1D23] outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsEditingNote(false)}
                  className="px-3 py-1 rounded-full text-xs font-bold text-[#5A6577] bg-[#E8ECF1]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNoteSubmit}
                  className="px-3 py-1 rounded-full text-xs font-bold text-white bg-[#3B6FD4]"
                >
                  Save Note
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1.5 text-sm leading-relaxed text-[#5A6577] font-medium">
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
