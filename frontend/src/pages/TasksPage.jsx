import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  Check,
  ChevronDown,
  Copy,
  Download,
  Kanban,
  LayoutList,
  Plus,
  RotateCcw,
  Save,
  Search,
  Users,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassModal } from "@/components/glass/GlassModal";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAppStore } from "@/store/useAppStore";

const statuses = ["All Statuses", "Todo", "In Progress", "Blocked", "Completed"];
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function formatTask(task) {
  const member = task.assignedOrgMember;
  const team = task.orgTeam;
  const name = member?.user?.name || member?.name || "Unassigned";
  return {
    ...task,
    status: task.status === "In_Progress" ? "In Progress" : task.status,
    department: team?.name || "Unassigned",
    assignee: { name, initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), avatar: member?.user?.avatarUrl, email: member?.user?.email, phone: member?.user?.phone || member?.phone },
    activity: [],
    checklist: [],
    attachments: [],
    notes: ""
    ,lastUpdatedAt: task.updatedAt,
    lastUpdatedBy: task.lastUpdatedByName || "Unknown"
  };
}

function SelectFilter({ value, onChange, options, label }) {
  return (
    <label className="filter-chip flex h-9 shrink-0 items-center rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] pl-3 text-xs font-semibold text-[#5A6577]">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="cursor-pointer bg-transparent text-xs font-semibold text-[#1A1D23] outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-white text-[#1A1D23]">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TaskDrawer({ task: initialTask, onClose, onUpdateTask, teams, members, isLead }) {
  const [draftTask, setDraftTask] = useState(null);
  useEffect(() => setDraftTask(null), [initialTask?.id, initialTask?.updatedAt]);
  const task = draftTask || initialTask;
  if (!task) return null;

  const handleStatusChange = (newStatus) => {
    setDraftTask({
      ...task,
      status: newStatus,
      completedToday: newStatus === "Completed",
      activity: [
        { id: `act-${Date.now()}`, user: "Aman Goel", action: `changed status to ${newStatus}`, timestamp: "Just now" },
        ...task.activity
      ]
    });
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
        className="fixed bottom-2 right-4 top-2 z-50 flex max-h-[calc(100vh-1rem)] w-[min(560px,calc(100vw-32px))] min-h-0 flex-col overflow-hidden rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-6 shadow-xl text-[#1A1D23]"
        initial={{ x: 580, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 580, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(0,0,0,0.06)] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1A1D23]">{task.title}</h2>
          </div>
          <button
            className="flex h-9 w-9 min-h-0 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23]"
            onClick={onClose}
            aria-label="Close task drawer"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          {/* Status & Team Matrix */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-[#F7F8FA] p-3 border border-[rgba(0,0,0,0.06)]">
              <p className="text-[11px] font-semibold text-[#8E99A8]">Status</p>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={task.status === "Completed"}
                className="mt-1 w-full bg-transparent text-xs font-bold text-[#1A1D23] outline-none cursor-pointer"
              >
                {statuses.slice(1).map((s) => (
                  <option key={s} value={s} className="bg-white text-[#1A1D23]">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-2xl bg-[#F7F8FA] p-3 border border-[rgba(0,0,0,0.06)]">
              <p className="text-[11px] font-semibold text-[#8E99A8]">Department / Team</p>
              <p className="mt-1 text-xs font-bold text-[#1A1D23] truncate">{task.department}</p>
            </div>
          </div>

          {/* Assignee Box */}
          <div className="flex items-center gap-3 rounded-2xl bg-[#F7F8FA] p-3.5 border border-[rgba(0,0,0,0.06)]">
            <UserAvatar initials={task.assignee.initials} image={task.assignee.avatar} className="h-9 w-9 text-xs bg-[#EBF0FA] text-[#3B6FD4]" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-[#8E99A8]">Assigned Member</p>
              <p className="text-sm font-bold text-[#1A1D23] truncate">{task.assignee.name}</p>
            </div>
            <span className="text-xs font-bold text-[#3B6FD4] font-mono">{task.assignee.phone || "+91 98765 40012"}</span>
          </div>

          {isLead && <label className="block rounded-2xl bg-[#F7F8FA] p-3 text-[11px] font-semibold text-[#8E99A8]">Assigned To
            <select value={task.assignedOrgMemberId || ""} onChange={(event) => { const member = members.find((item) => item.id === event.target.value); setDraftTask({ ...task, assignedOrgMemberId: event.target.value || null, orgTeamId: member?.orgTeamId || null, department: member?.teamName || "Unassigned", assignee: member ? { ...task.assignee, name: member.name, initials: member.initials, phone: member.phone } : { name: "Unassigned", initials: "U", phone: "" } }); }} className="mt-1 h-9 w-full rounded-full bg-white px-3 pr-9 text-xs text-[#1A1D23] outline-none">
              <option value="">Unassigned</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name} — {member.teamName}</option>)}
            </select>
            {task.assignedOrgMemberId && <span className="mt-2 block text-[11px] font-semibold text-[#5A6577]">Team: {task.department}</span>}
          </label>}

          {/* Task Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E99A8]">Description</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5A6577] bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] rounded-2xl p-3.5 font-medium">
              {task.description}
            </p>
          </div>

          <div className="border-t border-[rgba(0,0,0,0.06)] pt-4 text-xs text-[#8E99A8]">
            Last updated by <span className="font-bold text-[#5A6577]">{task.lastUpdatedBy}</span> at {task.lastUpdatedAt ? new Date(task.lastUpdatedAt).toLocaleString() : "—"}
          </div>
        </div>

        {/* Save changes footer */}
        <div className="shrink-0 border-t border-[rgba(0,0,0,0.06)] pt-4 flex items-center gap-3">
          <GlassButton
            variant="primary"
            className="flex-1 h-9 text-xs justify-center rounded-full"
            icon={task.status === "Completed" ? <RotateCcw size={15} /> : <Save size={15} />}
            onClick={async () => {
              if (task.status === "Completed") {
                setDraftTask({ ...task, status: "Todo", completedToday: false });
                return;
              }
              await onUpdateTask(task);
              onClose();
            }}
          >
            {task.status === "Completed" ? "Reopen Task" : "Save Changes"}
          </GlassButton>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function NewTaskModal({ open, onClose, onCreateTask, teams, members }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState(teams[0]?.id || "");
  const [assignedOrgMemberId, setAssignedOrgMemberId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedMember = members.find((member) => member.id === assignedOrgMemberId);
    onCreateTask({ title: title.trim(), description: description.trim(), orgTeamId: selectedMember?.orgTeamId || null, assignedOrgMemberId: assignedOrgMemberId || null });
    setTitle("");
    setDescription("");
    setAssignedOrgMemberId("");
    onClose();
  };

  return (
    <GlassModal open={open} className="w-[min(540px,calc(100vw-32px))] max-w-none bg-white border border-[rgba(0,0,0,0.08)] rounded-3xl p-6 text-[#1A1D23]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1A1D23]">Create Operational Task</h2>
          <p className="mt-1 text-xs font-medium text-[#5A6577]">Assign a new duty allocation for team execution.</p>
        </div>
        <button
          className="flex h-8 w-8 min-h-0 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23]"
          onClick={onClose}
          aria-label="Close new task modal"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-[#8E99A8]">Task Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Setup VIP Lounge & Stage Monitors"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 h-10 w-full rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-4 text-xs font-semibold text-[#1A1D23] outline-none placeholder:text-[#8E99A8]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#8E99A8]">Description</label>
          <textarea
            rows={3}
            placeholder="Task scope details, location and deliverables..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-2xl bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] p-3.5 text-xs font-medium text-[#1A1D23] outline-none placeholder:text-[#8E99A8]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#8E99A8]">Assign To</label>
          <select value={assignedOrgMemberId} onChange={(e) => setAssignedOrgMemberId(e.target.value)} className="mt-1 h-9 w-full rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none cursor-pointer">
            <option value="">Unassigned</option>
            {members.map((member) => <option key={member.id} value={member.id}>{member.name} — {member.teamName}</option>)}
          </select>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-2">
          <GlassButton type="button" onClick={onClose} className="h-9 text-xs rounded-full">
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" icon={<Plus size={15} />} className="h-9 text-xs rounded-full">
            Create Task
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}

export function TasksPage() {
  const [tasksList, setTasksList] = useState([]);
  const [teamsList, setTeamsList] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Teams");
  const [status, setStatus] = useState("All Statuses");
  const [assignee, setAssignee] = useState("All Assignees");
  const [view, setView] = useState("list");
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();

  const role = useAppStore((state) => state.role);
  const currentUser = useAppStore((state) => state.currentUser);
  const activeEvent = useAppStore((state) => state.activeEvent);
  const isLead = role === "lead";

  useEffect(() => {
    if (!activeEvent?.id) return;
    const token = localStorage.getItem("convene_token");
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/events/${activeEvent.id}/tasks`, { headers }).then((res) => res.ok ? res.json() : Promise.reject(new Error("Failed to fetch tasks."))),
      fetch(`${API_BASE}/events/${activeEvent.id}/organizing-teams`, { headers }).then((res) => res.ok ? res.json() : Promise.reject(new Error("Failed to fetch organizing teams.")))
    ]).then(([taskData, teamData]) => {
      setTasksList((taskData.tasks || []).map(formatTask));
      const teams = teamData.teams || [];
      setTeamsList(teams);
      setMembersList(teams.flatMap((team) => team.members.map((member) => ({ ...member, orgTeamId: team.id, teamName: team.name }))));
    }).catch((fetchError) => setError(fetchError.message)).finally(() => setLoading(false));
  }, [activeEvent?.id]);

  const teamOptions = useMemo(() => ["All Teams", ...teamsList.map((team) => team.name)], [teamsList]);

  useEffect(() => {
    const teamSlug = searchParams.get("team");
    if (!teamSlug) return;
    const team = teamsList.find((item) => item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === teamSlug);
    if (team) setDepartment(team.name);
  }, [searchParams, teamsList]);

  const assigneeOptions = useMemo(() => {
    return ["All Assignees", ...Array.from(new Set(tasksList.map((t) => t.assignee?.name).filter(Boolean)))];
  }, [tasksList]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasksList.filter((task) => {
      // Members only see tasks assigned to their linked organization member record.
      if (!isLead && task.assignedOrgMember?.userId !== currentUser?.id) {
        return false;
      }

      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.department.toLowerCase().includes(query) ||
        task.assignee.name.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (department === "All Teams" || task.department === department) &&
        (status === "All Statuses" || task.status === status) &&
        (assignee === "All Assignees" || task.assignee.name === assignee)
      );
    }).sort((a, b) => {
      // Completed tasks grouped at the bottom
      if (a.status === "Completed" && b.status !== "Completed") return 1;
      if (a.status !== "Completed" && b.status === "Completed") return -1;
      return 0;
    });
  }, [assignee, currentUser?.id, department, isLead, search, status, tasksList]);

  const handleToggleComplete = (e, taskId) => {
    e.stopPropagation();
    const task = tasksList.find((item) => item.id === taskId);
    if (!task) return;
    const nextStatus = task.status === "Completed" ? "In Progress" : "Completed";
    handleUpdateTask({ ...task, status: nextStatus, completedToday: nextStatus === "Completed" });
  };

  const handleUpdateTask = async (updatedTask) => {
    const existingTask = tasksList.find((task) => task.id === updatedTask.id);
    const token = localStorage.getItem("convene_token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    let serverTask = null;
    if (updatedTask.status !== existingTask?.status) {
      const res = await fetch(`${API_BASE}/tasks/${updatedTask.id}/status`, { method: "PATCH", headers, body: JSON.stringify({ status: updatedTask.status }) });
      if (!res.ok) { const data = await res.json().catch(() => ({})); setError(data.error || "Failed to update task status."); return; }
      serverTask = (await res.json()).task;
    }
    if (updatedTask.assignedOrgMemberId !== existingTask?.assignedOrgMemberId || updatedTask.orgTeamId !== existingTask?.orgTeamId) {
      const res = await fetch(`${API_BASE}/tasks/${updatedTask.id}`, { method: "PATCH", headers, body: JSON.stringify({ assignedOrgMemberId: updatedTask.assignedOrgMemberId || null }) });
      if (!res.ok) { const data = await res.json().catch(() => ({})); setError(data.error || "Failed to update task assignment."); return; }
      serverTask = (await res.json()).task;
    }
    const nextTask = serverTask ? formatTask(serverTask) : updatedTask;
    setTasksList((prev) => prev.map((t) => (t.id === updatedTask.id ? nextTask : t)));
    setSelectedTask(nextTask);
  };

  const handleCreateTask = async (newTask) => {
    if (!activeEvent?.id) return;
    const token = localStorage.getItem("convene_token");
    const res = await fetch(`${API_BASE}/events/${activeEvent.id}/tasks`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(newTask) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to create task."); return; }
    setTasksList((prev) => [formatTask(data.task), ...prev]);
    setNewTaskOpen(false);
  };

  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1D23] md:text-3xl">Tasks</h1>
          <p className="mt-1 text-sm text-[#5A6577] font-medium">Assign, monitor and complete operational work.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {isLead && (
            <GlassButton variant="primary" icon={<Plus size={16} strokeWidth={2} />} onClick={() => setNewTaskOpen(true)} className="rounded-full">
              New Task
            </GlassButton>
          )}
          <GlassButton variant="secondary" icon={<Download size={16} strokeWidth={2} />} className="rounded-full">Export</GlassButton>
        </div>
      </div>

      {/* Onboarding-style Task Metric Overview Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E99A8]">Total Assigned</p>
          <p className="mt-1 text-2xl font-extrabold text-[#1A1D23] font-mono">{filteredTasks.length}</p>
          <span className="text-[11px] font-medium text-[#5A6577]">Active operational items</span>
        </div>

        <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#3B6FD4]">In Progress</p>
          <p className="mt-1 text-2xl font-extrabold text-[#3B6FD4] font-mono">
            {filteredTasks.filter((t) => t.status === "In Progress").length}
          </p>
          <span className="text-[11px] font-medium text-[#5A6577]">Currently being executed</span>
        </div>

        <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E99A8]">Todo</p>
          <p className="mt-1 text-2xl font-extrabold text-[#5A6577] font-mono">
            {filteredTasks.filter((t) => t.status === "Todo").length}
          </p>
          <span className="text-[11px] font-medium text-[#5A6577]">Awaiting execution</span>
        </div>

        <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#D6453D]">Blocked / Impended</p>
          <p className="mt-1 text-2xl font-extrabold text-[#D6453D] font-mono">
            {filteredTasks.filter((t) => t.status === "Blocked").length}
          </p>
          <span className="text-[11px] font-medium text-[#5A6577]">Requires resolution</span>
        </div>

        <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#22A65E]">Resolved / Done</p>
          <p className="mt-1 text-2xl font-extrabold text-[#22A65E] font-mono">
            {filteredTasks.filter((t) => t.status === "Completed").length}
          </p>
          <span className="text-[11px] font-medium text-[#5A6577]">Successfully completed</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          <div className="flex h-9 min-w-[220px] max-w-sm flex-1 items-center gap-2 rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-medium text-[#1A1D23] focus-within:ring-1 focus-within:ring-[#3B6FD4]">
            <Search size={15} strokeWidth={2} className="text-[#8E99A8] shrink-0" />
            <input
              type="text"
              placeholder="Search tasks by title, team, assignee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-xs font-medium text-[#1A1D23] placeholder:text-[#8E99A8]"
              aria-label="Search tasks"
            />
          </div>
          <SelectFilter label="Team" value={department} onChange={setDepartment} options={teamOptions} />
          <SelectFilter label="Status" value={status} onChange={setStatus} options={statuses} />
          <SelectFilter label="Assigned To" value={assignee} onChange={setAssignee} options={assigneeOptions} />
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] p-1 shrink-0">
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-all min-h-0 cursor-pointer",
              view === "list"
                ? "bg-[#3B6FD4] text-white font-bold"
                : "text-[#5A6577] hover:text-[#1A1D23]"
            )}
          >
            <LayoutList size={14} /> List
          </button>
          <button
            onClick={() => setView("board")}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-all min-h-0 cursor-pointer",
              view === "board"
                ? "bg-[#3B6FD4] text-white font-bold"
                : "text-[#5A6577] hover:text-[#1A1D23]"
            )}
          >
            <Kanban size={14} /> Board
          </button>
        </div>
      </div>

      {/* Task Workspace (List / Board) */}
      <div className="overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white min-h-[500px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-12" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No tasks yet."
              description="No operational tasks match your filters. Create a new task or adjust your search criteria."
              actionLabel="Create your first task"
              onAction={() => setNewTaskOpen(true)}
            />
          </div>
        ) : view === "list" ? (
          /* List View */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] table-fixed border-separate border-spacing-0 text-left">
              <thead className="sticky top-0 z-10 bg-[#F7F8FA] text-[#5A6577] font-bold text-xs uppercase border-b border-[rgba(0,0,0,0.06)]">
                <tr>
                  <th className="w-[8%] px-4 py-3 text-[11px] tracking-wider text-center">S.No.</th>
                  <th className="w-[30%] px-4 py-3 text-[11px] tracking-wider">Task Title</th>
                  <th className="w-[24%] px-4 py-3 text-[11px] tracking-wider">Assigned To</th>
                  <th className="w-[18%] px-4 py-3 text-[11px] tracking-wider">Team</th>
                  <th className="w-[14%] px-4 py-3 text-[11px] tracking-wider">Status</th>
                  <th className="w-[6%] px-4 py-3 text-right text-[11px] tracking-wider">Done</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,0,0,0.05)]">
                {filteredTasks.map((task, idx) => (
                  <tr
                    key={task.id}
                    className="group cursor-pointer transition-colors hover:bg-[#F7F8FA]"
                    onClick={() => setSelectedTask(task)}
                  >
                    <td className="px-4 py-3 text-center text-xs font-mono font-bold text-[#8E99A8]">
                      {idx + 1}
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-[#1A1D23] transition-colors">
                        {task.title}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <UserAvatar initials={task.assignee.initials} image={task.assignee.avatar} className="h-6 w-6 text-[10px] bg-[#EBF0FA] text-[#3B6FD4]" />
                        <span className="text-xs font-semibold text-[#1A1D23]">{task.assignee.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-[#5A6577]">
                        {task.department}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={task.status} />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        className={cn(
                          "inline-flex h-6 w-6 min-h-0 items-center justify-center rounded-full transition-colors",
                          task.status === "Completed"
                            ? "bg-[#22A65E] text-white"
                            : "bg-[#F0F2F5] text-[#22A65E] hover:bg-[#E8ECF1]"
                        )}
                        onClick={(e) => handleToggleComplete(e, task.id)}
                        aria-label={`Toggle complete ${task.title}`}
                      >
                        <Check size={13} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Kanban Board View */
          <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4 overflow-x-auto">
            {["Todo", "In Progress", "Blocked", "Completed"].map((columnStatus) => {
              const columnTasks = filteredTasks.filter((t) => t.status === columnStatus);
              return (
                <div key={columnStatus} className="rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3.5 flex flex-col min-h-[480px]">
                  {/* Column Header */}
                  <div className="mb-3 flex items-center justify-between border-b border-[rgba(0,0,0,0.06)] pb-2.5 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1A1D23]">{columnStatus}</span>
                    <span className="inline-flex h-5 px-2 items-center justify-center rounded-full bg-[#E8ECF1] text-[11px] font-bold text-[#1A1D23]">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Column Task Cards */}
                  <div className="flex-1 space-y-2 overflow-y-auto pr-0.5">
                    {columnTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group cursor-pointer rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] p-3.5 transition-all hover:border-[rgba(0,0,0,0.15)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                        onClick={() => setSelectedTask(task)}
                      >
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3B6FD4] bg-[#EBF0FA] px-2 py-0.5 rounded-full">
                          {task.department}
                        </span>
                        <p className="mt-2 text-xs font-bold text-[#1A1D23] line-clamp-2">{task.title}</p>
                        <div className="mt-3 flex items-center justify-between border-t border-[rgba(0,0,0,0.06)] pt-2 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <UserAvatar initials={task.assignee.initials} image={task.assignee.avatar} className="h-5 w-5 text-[9px] bg-[#EBF0FA] text-[#3B6FD4]" />
                            <span className="font-semibold text-[#5A6577] truncate max-w-[90px]">{task.assignee.name}</span>
                          </div>
                          <button
                            className={cn(
                              "flex h-5 w-5 min-h-0 items-center justify-center rounded-full transition-colors",
                              task.status === "Completed" ? "bg-[#22A65E] text-white" : "bg-[#F0F2F5] text-[#22A65E] hover:bg-[#E8ECF1]"
                            )}
                            onClick={(e) => handleToggleComplete(e, task.id)}
                          >
                            <Check size={11} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Drawer */}
      <TaskDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        teams={teamsList}
        members={membersList}
        isLead={isLead}
      />

      {/* New Task Modal */}
      {error && <p className="text-sm font-semibold text-[#D6453D]">{error}</p>}
      <NewTaskModal open={newTaskOpen} onClose={() => setNewTaskOpen(false)} onCreateTask={handleCreateTask} teams={teamsList} members={membersList} />
    </div>
  );
}

