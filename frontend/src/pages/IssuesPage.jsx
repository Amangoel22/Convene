// Purpose: IssuesPage implements this source module.
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  X,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassModal } from "@/components/glass/GlassModal";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [targetIssue, setTargetIssue] = useState(null);

  // New Issue State
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newNotes, setNewNotes] = useState("");
  const [error, setError] = useState("");
  const token = useAppStore((state) => state.token);
  const activeEvent = useAppStore((state) => state.activeEvent);

  // Loads persisted issues for the active event.
  useEffect(() => {
    if (!activeEvent?.id || !token) return;
    fetch(`${API_BASE}/events/${activeEvent.id}/issues`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error);
        return payload;
      })
      .then((payload) =>
        setIssues(
          (payload.issues || []).sort(
            (a, b) =>
              Number(a.status === "Resolved") - Number(b.status === "Resolved"),
          ),
        ),
      )
      .catch((loadError) => setError(loadError.message));
  }, [activeEvent?.id, token]);

  // Resolution Feedback State (Mandatory)
  const [feedback, setFeedback] = useState("");
  // Opens read-only details for a resolved issue.
  const handleOpenView = (issue) => {
    setTargetIssue(issue);
    setViewModalOpen(true);
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const response = await fetch(
      `${API_BASE}/events/${activeEvent.id}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          priority: newPriority,
          description: newNotes,
        }),
      },
    );
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Failed to report issue.");
      return;
    }
    setIssues((previous) => [payload.issue, ...previous]);
    setCreateModalOpen(false);
    setNewTitle("");
    setNewNotes("");
    setError("");
  };

  const handleOpenResolve = (iss) => {
    setTargetIssue(iss);
    setFeedback("");
    setResolveModalOpen(true);
  };

  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    if (!feedback.trim() || !targetIssue) return;

    const response = await fetch(
      `${API_BASE}/events/${activeEvent.id}/issues/${targetIssue.id}/close`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback }),
      },
    );
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Failed to close issue.");
      return;
    }
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === targetIssue.id ? payload.issue : issue,
      ),
    );
    setResolveModalOpen(false);
    setTargetIssue(null);
    setFeedback("");
  };

  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1 text-token-primary">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="type-2xl weight-bold tracking-tight text-token-primary md:type-3xl">
            Operational Issues
          </h1>
          <p className="mt-1 type-sm text-token-secondary weight-medium">
            Log operational issues. Anyone can report an incident or resolve an
            issue with mandatory feedback.
          </p>
        </div>
        <GlassButton
          variant="primary"
          icon={<Plus size={16} strokeWidth={2} />}
          onClick={() => setCreateModalOpen(true)}
          className="rounded-full"
        >
          Report Issue
        </GlassButton>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-token-error/20 bg-token-error/10 px-4 py-3 type-xs weight-semibold text-token-error"
        >
          {error}
        </div>
      )}

      {issues.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No operational issues reported"
          description="Log equipment glitches, power drops, or floor incidents. Anyone can report an incident."
          actionLabel="Report Issue"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {issues.map((iss) => (
            <div
              key={iss.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl surface-card-token border border-token p-5 shadow-token-card"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                    iss.status === "Resolved"
                      ? "bg-token-success/10 text-token-success"
                      : "bg-token-error/10 text-token-error",
                  )}
                >
                  {iss.status === "Resolved" ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="type-sm weight-bold text-token-primary truncate">
                      {iss.title}
                    </h4>
                    <span className="type-10 weight-extrabold uppercase px-2 py-0.5 rounded-full field-token text-token-secondary">
                      {iss.priority}
                    </span>
                  </div>
                  <p className="type-xs weight-medium text-token-muted">
                    Reported by{" "}
                    <span className="weight-bold text-token-primary">
                      {iss.reporterUser?.name || "Unknown user"}
                    </span>
                  </p>
                  <p className="type-xs weight-medium text-token-secondary italic">
                    {iss.description || "No notes provided."}
                  </p>
                  {iss.status === "Resolved" &&
                    iss.mandatoryResolutionFeedback && (
                      <p className="type-xs weight-medium text-token-success bg-token-success/10 p-2 rounded-xl mt-1">
                        <span className="weight-bold">Resolution Note:</span>{" "}
                        {iss.mandatoryResolutionFeedback}
                      </p>
                    )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 type-xs weight-bold border",
                    iss.status === "Resolved"
                      ? "bg-token-success/10 text-token-success border-token-success/20"
                      : "field-token text-token-primary border-token",
                  )}
                >
                  {iss.status}
                </span>

                {iss.status === "Resolved" && (
                  <GlassButton
                    type="button"
                    onClick={() => handleOpenView(iss)}
                    className="h-8 px-3.5 type-xs weight-bold rounded-full min-h-0"
                  >
                    View
                  </GlassButton>
                )}
                {iss.status !== "Resolved" && (
                  <>
                    <GlassButton
                      variant="success"
                      icon={<CheckCircle2 size={14} />}
                      onClick={() => handleOpenResolve(iss)}
                      className="h-8 px-3.5 type-xs weight-bold rounded-full min-h-0"
                    >
                      Resolve
                    </GlassButton>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE ISSUE MODAL */}
      <GlassModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Report Operational Issue"
      >
        <form onSubmit={handleCreateIssue} className="space-y-4 pt-2">
          <div>
            <label className="type-xs weight-bold text-token-primary">
              Issue Summary / Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. WiFi latency drop in Lab C"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mt-1 h-10 w-full rounded-2xl field-token border border-token px-3.5 type-xs weight-semibold text-token-primary outline-none"
            />
          </div>

          <div>
            <div>
              <label className="type-xs weight-bold text-token-primary">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl field-token border border-token px-3 type-xs weight-semibold text-token-primary outline-none cursor-pointer"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="type-xs weight-bold text-token-primary">
              Incident Details / Notes
            </label>
            <textarea
              rows={3}
              placeholder="Describe what happened and affected venue location..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="mt-1 w-full rounded-2xl field-token border border-token p-3 type-xs weight-medium text-token-primary outline-none resize-none"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
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
              className="h-9 type-xs rounded-full"
            >
              Submit Issue
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* RESOLVED ISSUE DETAILS MODAL */}
      <GlassModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Issue Details"
        className="w-full max-w-xl"
      >
        <div className="space-y-5 pt-2">
          <div className="border-b border-token pb-4">
            <p className="type-xl weight-bold text-token-primary">Issue details</p>
            <p className="mt-1 type-xs text-token-muted">Read-only information for this resolved issue.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl field-token p-4">
            <p className="type-11 weight-medium text-token-muted">Title</p>
            <p className="mt-1 type-sm weight-bold text-token-primary">
              {targetIssue?.title}
            </p>
          </div>
          <div className="rounded-2xl field-token p-4">
            <p className="type-11 weight-medium text-token-muted">Priority</p>
            <p className="mt-1 type-sm weight-bold text-token-primary">
              {targetIssue?.priority}
            </p>
          </div>
          <div className="rounded-2xl field-token p-4">
            <p className="type-11 weight-medium text-token-muted">Reported by</p>
            <p className="mt-1 type-sm weight-bold text-token-primary">
              {targetIssue?.reporterUser?.name || "Unknown user"}
            </p>
          </div>
          </div>
          <div className="rounded-2xl field-token p-4">
            <p className="type-11 weight-medium text-token-muted">Notes</p>
            <p className="mt-1 type-sm text-token-secondary">
              {targetIssue?.description || "No notes provided."}
            </p>
          </div>
          <div className="rounded-2xl field-token p-4">
            <p className="type-11 weight-medium text-token-muted">
              Resolution feedback
            </p>
            <p className="mt-1 type-sm text-token-primary">
              {targetIssue?.mandatoryResolutionFeedback ||
                "No feedback provided."}
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <GlassButton
              type="button"
              onClick={() => setViewModalOpen(false)}
              className="h-9 type-xs rounded-full"
            >
              Close
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* MANDATORY RESOLUTION FEEDBACK MODAL */}
      <GlassModal
        open={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Close Issue & Submit Feedback"
      >
        <form onSubmit={handleConfirmResolve} className="space-y-4 pt-2">
          <p className="type-xs weight-medium text-token-secondary">
            Please enter mandatory resolution feedback explaining how{" "}
            <span className="weight-bold text-token-primary">
              "{targetIssue?.title}"
            </span>{" "}
            was fixed.
          </p>

          <div>
            <label className="type-xs weight-bold text-token-primary">
              Resolution Feedback (Mandatory)
            </label>
            <textarea
              rows={4}
              required
              placeholder="e.g. Replaced router power cord and reset Access Point 3."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-1 w-full rounded-2xl field-token border border-token p-3.5 type-xs weight-medium text-token-primary outline-none resize-none"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <GlassButton
              type="button"
              onClick={() => setResolveModalOpen(false)}
              className="h-9 type-xs rounded-full"
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="success"
              icon={<CheckCircle2 size={15} />}
              className="h-9 type-xs rounded-full"
            >
              Resolve Issue
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
