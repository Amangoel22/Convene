import { FileUp, Plus, Upload, X } from "lucide-react";
import { useState } from "react";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassModal } from "@/components/glass/GlassModal";
import { cn } from "@/lib/utils";

export function CreateParticipantModal({ open, onClose, onSubmit, teams }) {
  const [mode, setMode] = useState("newTeam"); // "newTeam" | "existingTeam" | "individual"
  const [teamName, setTeamName] = useState("");
  const [college, setCollege] = useState("");
  const [teamMembers, setTeamMembers] = useState([
    { name: "", email: "", phone: "" },
  ]);
  const [targetTeamId, setTargetTeamId] = useState(teams[0]?.id || "");
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPhone, setMemberPhone] = useState("");

  const handleAddMember = () => {
    if (teamMembers.length < 4) {
      setTeamMembers((prev) => [...prev, { name: "", email: "", phone: "" }]);
    }
  };

  const handleRemoveMember = (idx) => {
    if (teamMembers.length > 1) {
      setTeamMembers((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleMemberChange = (idx, field, value) => {
    setTeamMembers((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      mode,
      teamName,
      college,
      teamMembers,
      leaderName: teamMembers[0]?.name || "",
      leaderEmail: teamMembers[0]?.email || "",
      leaderPhone: teamMembers[0]?.phone || "",
      targetTeamId,
      memberName,
      memberEmail,
      memberPhone,
    });
  };

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      title="Create Participant / Registration"
    >
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-[#E8ECF1] p-1.5 border border-[rgba(0,0,0,0.06)] mb-6">
        {[
          ["newTeam", "Create Whole Team"],
          ["existingTeam", "Add to Existing Team"],
          ["individual", "Register Individual"],
        ].map(([mKey, label]) => (
          <button
            key={mKey}
            type="button"
            onClick={() => setMode(mKey)}
            className={cn(
              "px-2 py-2 text-xs font-bold rounded-xl transition-all text-center",
              mode === mKey
                ? "bg-white text-[#3B6FD4] shadow-sm border border-[rgba(0,0,0,0.04)] font-extrabold"
                : "text-[#5A6577] hover:text-[#1A1D23] font-semibold",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
      >
        {mode === "newTeam" && (
          <>
            <div>
              <label className="text-xs font-bold text-[#1A1D23]">
                Team Name
              </label>
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
              <label className="text-xs font-bold text-[#1A1D23]">
                College / Organization
              </label>
              <input
                type="text"
                required
                placeholder="e.g. IIT Bombay"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-semibold text-[#1A1D23] outline-none"
              />
            </div>

            <div className="pt-2 border-t border-[rgba(0,0,0,0.06)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B6FD4]">
                  Team Members ({teamMembers.length}/4)
                </span>
                {teamMembers.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#3B6FD4] hover:text-[#2a54a7] transition-colors"
                  >
                    <Plus size={14} /> Add Teammate
                  </button>
                )}
              </div>

              {teamMembers.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#1A1D23]">
                      {idx === 0
                        ? "Member 1 (Team Leader - Mandatory)"
                        : `Member ${idx + 1}`}
                    </span>
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="text-xs font-bold text-[#D6453D] hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      required={idx === 0}
                      placeholder={
                        idx === 0 ? "Leader Full Name *" : "Teammate Full Name"
                      }
                      value={m.name}
                      onChange={(e) =>
                        handleMemberChange(idx, "name", e.target.value)
                      }
                      className="h-9 rounded-xl bg-white border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
                    />
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="Phone Number (10 digits)"
                      value={m.phone}
                      onChange={(e) =>
                        handleMemberChange(
                          idx,
                          "phone",
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      className="h-9 rounded-xl bg-white border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={m.email}
                    onChange={(e) =>
                      handleMemberChange(idx, "email", e.target.value)
                    }
                    className="h-9 w-full rounded-xl bg-white border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {mode === "existingTeam" && (
          <>
            <div>
              <label className="text-xs font-bold text-[#1A1D23]">
                Select Existing Target Team
              </label>
              <select
                value={targetTeamId}
                onChange={(e) => setTargetTeamId(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none cursor-pointer"
              >
                {teams.map((t) => (
                  <option
                    key={t.id}
                    value={t.id}
                    className="bg-white text-[#1A1D23]"
                  >
                    {t.team}: {t.teamName} ({t.college})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#1A1D23]">
                New Teammate Name
              </label>
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
                maxLength={10}
                placeholder="Phone Number (10 digits)"
                value={memberPhone}
                onChange={(e) =>
                  setMemberPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="h-10 rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
              />
            </div>
          </>
        )}

        {mode === "individual" && (
          <>
            <div>
              <label className="text-xs font-bold text-[#1A1D23]">
                Individual Participant Name
              </label>
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
              <label className="text-xs font-bold text-[#1A1D23]">
                College / Organization
              </label>
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
                maxLength={10}
                placeholder="Phone Number (10 digits)"
                value={memberPhone}
                onChange={(e) =>
                  setMemberPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="h-10 rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none"
              />
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end gap-3 pt-2">
          <GlassButton
            type="button"
            onClick={onClose}
            className="h-9 text-xs rounded-full"
          >
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            icon={<Plus size={15} />}
            className="h-9 text-xs rounded-full"
          >
            Save Participant
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}

export function ImportModal({ open, onClose }) {
  const previewRows = [];
  return (
    <GlassModal
      open={open}
      className="w-[min(720px,calc(100vw-32px))] max-w-none bg-white border border-[rgba(0,0,0,0.08)] rounded-3xl p-6 text-[#1A1D23]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1A1D23]">
            Import participants
          </h2>
          <p className="mt-1 text-xs font-medium text-[#5A6577]">
            Upload a CSV exported from your registration platform.
          </p>
        </div>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23]"
          onClick={onClose}
          aria-label="Close import modal"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>
      <div className="mt-6 rounded-2xl border-2 border-dashed border-[rgba(0,0,0,0.12)] bg-[#F7F8FA] p-8 text-center">
        <Upload className="mx-auto text-[#3B6FD4]" size={30} strokeWidth={2} />
        <p className="mt-3 text-sm font-bold text-[#1A1D23]">Drop CSV here</p>
        <p className="mt-1 text-xs font-medium text-[#8E99A8]">
          Team, leader, college, and members columns supported.
        </p>
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)]">
        {previewRows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[1fr_1fr_0.8fr] gap-3 border-b border-[rgba(0,0,0,0.06)] px-4 py-3 text-xs last:border-b-0"
          >
            <span className="truncate font-semibold text-[#1A1D23]">
              {row.team}: {row.teamName}
            </span>
            <span className="truncate text-[#5A6577]">{row.college}</span>
            <span className="truncate text-[#8E99A8]">
              {row.members.length} members
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <GlassButton onClick={onClose} className="rounded-full">
          Cancel
        </GlassButton>
        <GlassButton
          variant="primary"
          icon={<FileUp size={16} strokeWidth={2} />}
          className="rounded-full"
        >
          Import CSV
        </GlassButton>
      </div>
    </GlassModal>
  );
}
