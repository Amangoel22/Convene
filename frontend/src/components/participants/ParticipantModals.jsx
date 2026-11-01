// Purpose: ParticipantModals implements this source module.
import { FileUp, Plus, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassModal } from "@/components/glass/GlassModal";
import { cn } from "@/lib/utils";

import { getApiBase } from "@/lib/api";
const API_BASE = getApiBase();
const MAX_IMPORT_SIZE = 5 * 1024 * 1024;

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
      <div className="grid grid-cols-3 gap-1 rounded-2xl hover-token p-1.5 border border-subtle-token mb-6">
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
              "px-2 py-2 type-xs weight-bold rounded-xl transition-all text-center",
              mode === mKey
                ? "surface-card-token text-token-accent shadow-sm border border-token-light weight-extrabold"
                : "text-token-secondary hover:text-token-primary weight-semibold",
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
              <label className="type-xs weight-bold text-token-primary">
                Team Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CyberKnights"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl field-token border border-token px-3.5 type-xs weight-semibold text-token-primary outline-none"
              />
            </div>
            <div>
              <label className="type-xs weight-bold text-token-primary">
                College / Organization
              </label>
              <input
                type="text"
                required
                placeholder="e.g. IIT Bombay"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl field-token border border-token px-3.5 type-xs weight-semibold text-token-primary outline-none"
              />
            </div>

            <div className="pt-2 border-t border-subtle-token space-y-3">
              <div className="flex items-center justify-between">
                <span className="type-11 weight-bold uppercase tracking-wider text-token-accent">
                  Team Members ({teamMembers.length}/4)
                </span>
                {teamMembers.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="inline-flex items-center gap-1 type-xs weight-bold text-token-accent hover:text-token-accent-dark transition-colors"
                  >
                    <Plus size={14} /> Add Teammate
                  </button>
                )}
              </div>

              {teamMembers.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl surface-token border border-subtle-token space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="type-11 weight-bold text-token-primary">
                      {idx === 0
                        ? "Member 1 (Team Leader - Mandatory)"
                        : `Member ${idx + 1}`}
                    </span>
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="type-xs weight-bold text-token-error hover:underline"
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
                      className="h-9 rounded-xl surface-card-token border border-token px-3 type-xs weight-semibold text-token-primary outline-none"
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
                      className="h-9 rounded-xl surface-card-token border border-token px-3 type-xs weight-semibold text-token-primary outline-none"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={m.email}
                    onChange={(e) =>
                      handleMemberChange(idx, "email", e.target.value)
                    }
                    className="h-9 w-full rounded-xl surface-card-token border border-token px-3 type-xs weight-semibold text-token-primary outline-none"
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {mode === "existingTeam" && (
          <>
            <div>
              <label className="type-xs weight-bold text-token-primary">
                Select Existing Target Team
              </label>
              <select
                value={targetTeamId}
                onChange={(e) => setTargetTeamId(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl field-token border border-token px-3 type-xs weight-semibold text-token-primary outline-none cursor-pointer"
              >
                {teams.map((t) => (
                  <option
                    key={t.id}
                    value={t.id}
                    className="surface-card-token text-token-primary"
                  >
                    {t.team}: {t.teamName} ({t.college})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="type-xs weight-bold text-token-primary">
                New Teammate Name
              </label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl field-token border border-token px-3.5 type-xs weight-semibold text-token-primary outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="email"
                required
                placeholder="Email Address"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="h-10 rounded-2xl field-token border border-token px-3 type-xs weight-semibold text-token-primary outline-none"
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
                className="h-10 rounded-2xl field-token border border-token px-3 type-xs weight-semibold text-token-primary outline-none"
              />
            </div>
          </>
        )}

        {mode === "individual" && (
          <>
            <div>
              <label className="type-xs weight-bold text-token-primary">
                Individual Participant Name
              </label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl field-token border border-token px-3.5 type-xs weight-semibold text-token-primary outline-none"
              />
            </div>
            <div>
              <label className="type-xs weight-bold text-token-primary">
                College / Organization
              </label>
              <input
                type="text"
                placeholder="e.g. Stanford University"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl field-token border border-token px-3.5 type-xs weight-semibold text-token-primary outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="email"
                required
                placeholder="Email Address"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="h-10 rounded-2xl field-token border border-token px-3 type-xs weight-semibold text-token-primary outline-none"
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
                className="h-10 rounded-2xl field-token border border-token px-3 type-xs weight-semibold text-token-primary outline-none"
              />
            </div>
          </>
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
            Save Participant
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}

// Purpose: upload a normalized one-sheet participant workbook to the event importer.
export function ImportModal({ open, onClose, eventId, onImported }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setError("");
    setMessage("");
    if (!nextFile) return;
    if (nextFile.size > MAX_IMPORT_SIZE) {
      setFile(null);
      setError("The workbook must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }
    setFile(nextFile);
  };

  const handleImport = async () => {
    if (!file || !eventId) return;
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(
        `${API_BASE}/participants/${eventId}/participants/import`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("convene_token")}`,
          },
          body: form,
        },
      );
      const payload = await response.json();
      if (!response.ok) {
        setError(
          payload.errors?.join(" ") ||
            payload.error ||
            "Unable to import participants.",
        );
        return;
      }
      setMessage(
        `${payload.participants} participants imported across ${payload.teams} teams.`,
      );
      await onImported?.();
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (uploadError) {
      setError(uploadError.message || "Unable to import participants.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      className="w-[min(720px,calc(100vw-32px))] max-w-none surface-card-token border border-token rounded-3xl p-6 text-token-primary"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="type-xl weight-bold text-token-primary">
            Import participants
          </h2>
          <p className="mt-1 type-xs weight-medium text-token-secondary">
            Upload the single-sheet workbook exported by your registration
            platform.
          </p>
        </div>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full field-token text-token-secondary hover:hover-token hover:text-token-primary"
          onClick={onClose}
          aria-label="Close import modal"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>
      <div className="mt-6 rounded-2xl border-2 border-dashed border-token-medium surface-token p-8 text-center">
        <Upload
          className="mx-auto text-token-accent"
          size={30}
          strokeWidth={2}
        />
        <p className="mt-3 type-sm weight-bold text-token-primary">
          Choose one workbook
        </p>
        <p className="mt-1 type-xs weight-medium text-token-muted">
          XLSX, XLS, or CSV · maximum 5 MB · one row per participant
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="sr-only"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-full field-token border border-token px-4 type-xs weight-bold text-token-primary hover:hover-token"
        >
          <FileUp size={15} /> Choose file
        </button>
        {file && (
          <div className="mx-auto mt-4 flex max-w-md items-center justify-between gap-3 rounded-xl surface-card-token px-3 py-2 text-left">
            <span className="min-w-0 truncate type-xs weight-semibold text-token-primary">
              {file.name}
            </span>
            <button
              type="button"
              className="shrink-0 type-11 weight-bold text-token-error"
              onClick={() => {
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              Remove
            </button>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-4 type-xs weight-semibold text-token-error">{error}</p>
      )}
      {message && (
        <p className="mt-4 type-xs weight-semibold text-token-success">
          {message}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <GlassButton onClick={onClose} className="rounded-full">
          Cancel
        </GlassButton>
        <GlassButton
          variant="primary"
          icon={<FileUp size={16} strokeWidth={2} />}
          className="rounded-full"
          onClick={handleImport}
          disabled={!file || uploading}
        >
          {uploading ? "Importing..." : "Import workbook"}
        </GlassButton>
      </div>
    </GlassModal>
  );
}
