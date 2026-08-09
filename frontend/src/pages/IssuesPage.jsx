import { useState } from "react";
import { AlertCircle, CheckCircle2, Plus, X, MessageSquare } from "lucide-react";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassModal } from "@/components/glass/GlassModal";
import { cn } from "@/lib/utils";

const initialIssues = [
  { id: "iss-1", title: "Main Hall Wi-Fi Speed Drop", priority: "High", status: "In Progress", reporter: "Tech Team", notes: "Latency spiking in Lab C.", resolutionFeedback: "" },
  { id: "iss-2", title: "Lab 3 Projector HDMI Flicker", priority: "Medium", status: "Open", reporter: "Stage Team", notes: "Requires replacement adapter.", resolutionFeedback: "" },
  { id: "iss-3", title: "Team 42 Badge Re-print Requested", priority: "Low", status: "Resolved", reporter: "Registration", notes: "Original lanyard damaged.", resolutionFeedback: "Re-printed badge at desk 2." }
];

export function IssuesPage() {
  const [issues, setIssues] = useState(initialIssues);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [targetIssue, setTargetIssue] = useState(null);

  // New Issue State
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newReporter, setNewReporter] = useState("Organizing Team");
  const [newNotes, setNewNotes] = useState("");

  // Resolution Feedback State (Mandatory)
  const [feedback, setFeedback] = useState("");

  const handleCreateIssue = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newObj = {
      id: `iss-${Date.now()}`,
      title: newTitle.trim(),
      priority: newPriority,
      status: "Open",
      reporter: newReporter.trim(),
      notes: newNotes.trim(),
      resolutionFeedback: ""
    };

    setIssues([newObj, ...issues]);
    setCreateModalOpen(false);
    setNewTitle("");
    setNewNotes("");
  };

  const handleOpenResolve = (iss) => {
    setTargetIssue(iss);
    setFeedback("");
    setResolveModalOpen(true);
  };

  const handleConfirmResolve = (e) => {
    e.preventDefault();
    if (!feedback.trim() || !targetIssue) return;

    setIssues((prev) =>
      prev.map((i) =>
        i.id === targetIssue.id
          ? { ...i, status: "Resolved", resolutionFeedback: feedback.trim() }
          : i
      )
    );
    setResolveModalOpen(false);
    setTargetIssue(null);
    setFeedback("");
  };

  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1 text-[#1A1D23]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1D23] md:text-3xl">Operational Issues</h1>
          <p className="mt-1 text-sm text-[#5A6577] font-medium">
            Log operational issues. Anyone can report an incident or resolve an issue with mandatory feedback.
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

      <div className="space-y-3">
        {issues.map((iss) => (
          <div
            key={iss.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-start gap-4 min-w-0">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                  iss.status === "Resolved"
                    ? "bg-[#22A65E]/10 text-[#22A65E]"
                    : "bg-[#D6453D]/10 text-[#D6453D]"
                )}
              >
                {iss.status === "Resolved" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#1A1D23] truncate">{iss.title}</h4>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#F0F2F5] text-[#5A6577]">
                    {iss.priority}
                  </span>
                </div>
                <p className="text-xs font-medium text-[#8E99A8]">
                  Reported by <span className="font-bold text-[#1A1D23]">{iss.reporter}</span>
                </p>
                {iss.resolutionFeedback && (
                  <p className="text-xs font-medium text-[#22A65E] bg-[#22A65E]/10 p-2 rounded-xl mt-1">
                    <span className="font-bold">Resolution Note:</span> {iss.resolutionFeedback}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold border",
                  iss.status === "Resolved"
                    ? "bg-[#22A65E]/10 text-[#22A65E] border-[#22A65E]/20"
                    : "bg-[#F0F2F5] text-[#1A1D23] border-[rgba(0,0,0,0.08)]"
                )}
              >
                {iss.status}
              </span>

              {iss.status !== "Resolved" && (
                <GlassButton
                  variant="success"
                  icon={<CheckCircle2 size={14} />}
                  onClick={() => handleOpenResolve(iss)}
                  className="h-8 px-3.5 text-xs font-bold rounded-full min-h-0"
                >
                  Resolve
                </GlassButton>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE ISSUE MODAL */}
      <GlassModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Report Operational Issue">
        <form onSubmit={handleCreateIssue} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-[#1A1D23]">Issue Summary / Title</label>
            <input
              type="text"
              required
              placeholder="e.g. WiFi latency drop in Lab C"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mt-1 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-semibold text-[#1A1D23] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#1A1D23]">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none cursor-pointer"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1A1D23]">Reporting Team / Member</label>
              <input
                type="text"
                placeholder="e.g. Tech Team"
                value={newReporter}
                onChange={(e) => setNewReporter(e.target.value)}
                className="mt-1 h-10 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-semibold text-[#1A1D23] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1A1D23]">Incident Details / Notes</label>
            <textarea
              rows={3}
              placeholder="Describe what happened and affected venue location..."
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
              Submit Issue
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* MANDATORY RESOLUTION FEEDBACK MODAL */}
      <GlassModal open={resolveModalOpen} onClose={() => setResolveModalOpen(false)} title="Close Issue & Submit Feedback">
        <form onSubmit={handleConfirmResolve} className="space-y-4 pt-2">
          <p className="text-xs font-medium text-[#5A6577]">
            Please enter mandatory resolution feedback explaining how <span className="font-bold text-[#1A1D23]">"{targetIssue?.title}"</span> was fixed.
          </p>

          <div>
            <label className="text-xs font-bold text-[#1A1D23]">Resolution Feedback (Mandatory)</label>
            <textarea
              rows={4}
              required
              placeholder="e.g. Replaced router power cord and reset Access Point 3."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-1 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] p-3.5 text-xs font-medium text-[#1A1D23] outline-none resize-none"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <GlassButton type="button" onClick={() => setResolveModalOpen(false)} className="h-9 text-xs rounded-full">
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="success" icon={<CheckCircle2 size={15} />} className="h-9 text-xs rounded-full">
              Resolve Issue
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
