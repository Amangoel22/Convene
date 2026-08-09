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
  Search,
  Send,
  Users,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassModal } from "@/components/glass/GlassModal";
import { initialTasks } from "@/data/tasks";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAppStore } from "@/store/useAppStore";

const teams = ["All Teams", "Registration", "Hospitality", "Operations", "Tech", "Stage", "Logistics"];
const statuses = ["All Statuses", "Todo", "In Progress", "Blocked", "Completed"];

function SelectFilter({ value, onChange, options, label }) {
  return (
    <label className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#5A6577]">
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
      <ChevronDown size={13} strokeWidth={2} className="shrink-0 text-[#8E99A8]" />
    </label>
  );
}

function TaskDrawer({ task, onClose, onUpdateTask }) {
  const [newNote, setNewNote] = useState("");

  if (!task) return null;

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const noteText = task.notes ? `${task.notes}\n\n[${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}] ${newNote.trim()}` : newNote.trim();
    onUpdateTask({
      ...task,
      notes: noteText,
      activity: [
        { id: `act-${Date.now()}`, user: "Aman Goel", action: "added internal note", timestamp: "Just now" },
        ...task.activity
      ]
    });
    setNewNote("");
  };

  const handleStatusChange = (newStatus) => {
    onUpdateTask({
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
        className="fixed bottom-4 right-4 top-4 z-50 flex w-[min(560px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-6 shadow-xl text-[#1A1D23]"
        initial={{ x: 580, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 580, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(0,0,0,0.06)] pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3B6FD4] bg-[#EBF0FA] px-2.5 py-1 rounded-full">
              {task.department}
            </span>
            <h2 className="mt-2 text-xl font-bold text-[#1A1D23]">{task.title}</h2>
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

          {/* Task Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E99A8]">Description</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5A6577] bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] rounded-2xl p-3.5 font-medium">
              {task.description}
            </p>
          </div>

          {/* Internal Notes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E99A8]">Internal Operational Notes</h3>
            <div className="mt-2 rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3.5">
              {task.notes ? (
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-[#5A6577] font-medium">{task.notes}</p>
              ) : (
                <p className="text-xs text-[#8E99A8] italic">No internal notes added yet.</p>
              )}
              <form onSubmit={handleAddNote} className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Type an internal note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="h-8 flex-1 rounded-full bg-white border border-[rgba(0,0,0,0.08)] px-3.5 text-xs text-[#1A1D23] outline-none placeholder:text-[#8E99A8]"
                />
                <button
                  type="submit"
                  className="flex h-8 px-3 min-h-0 items-center justify-center rounded-full bg-[#3B6FD4] text-xs font-semibold text-white hover:bg-[#2F5BB8]"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="border-t border-[rgba(0,0,0,0.06)] pt-4 flex items-center gap-3">
          <GlassButton
            variant={task.status === "Completed" ? "secondary" : "success"}
            className="flex-1 h-9 text-xs justify-center rounded-full"
            icon={<Check size={15} />}
            onClick={() => handleStatusChange(task.status === "Completed" ? "In Progress" : "Completed")}
          >
            {task.status === "Completed" ? "Reopen Task" : "Mark Completed"}
          </GlassButton>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function NewTaskModal({ open, onClose, onCreateTask }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("Operations");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: `TASK-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      description: description.trim() || "Operational task description pending details.",
      department,
      status: "Todo",
      assignee: {
        name: "Aman Goel",
        initials: "AG",
        avatar: "https://i.pravatar.cc/96?img=33",
        email: "aman.goel@convene.edu"
      },
      completedToday: false,
      checklist: [{ id: "c1", title: "Initial operational setup", completed: false }],
      attachments: [],
      notes: "Newly created event operational task.",
      activity: [{ id: `act-${Date.now()}`, user: "Aman Goel", action: "created task", timestamp: "Just now" }]
    };

    onCreateTask(newTask);
    setTitle("");
    setDescription("");
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
          <label className="text-xs font-semibold text-[#8E99A8]">Team / Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="mt-1 h-9 w-full rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3 text-xs font-semibold text-[#1A1D23] outline-none cursor-pointer"
          >
            {teams.slice(1).map((d) => (
              <option key={d} value={d} className="bg-white text-[#1A1D23]">
                {d}
              </option>
            ))}
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
  const [tasksList, setTasksList] = useState(initialTasks);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Teams");
  const [status, setStatus] = useState("All Statuses");
  const [assignee, setAssignee] = useState("All Assignees");
  const [view, setView] = useState("list");
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [loading] = useState(false);

  const role = useAppStore((state) => state.role);
  const isLead = role === "lead";

  const assigneeOptions = useMemo(() => {
    return ["All Assignees", ...Array.from(new Set(tasksList.map((t) => t.assignee.name)))];
  }, [tasksList]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasksList.filter((task) => {
      // In Team Member view, show tasks assigned to the member account (e.g. Diya Shah / Team Member)
      if (!isLead && task.assignee.name !== "Diya Shah" && task.assignee.name !== "Team Member") {
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
  }, [assignee, department, isLead, search, status, tasksList]);

  const handleToggleComplete = (e, taskId) => {
    e.stopPropagation();
    setTasksList((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === "Completed" ? "In Progress" : "Completed";
          return { ...t, status: nextStatus, completedToday: nextStatus === "Completed" };
        }
        return t;
      })
    );
  };

  const handleUpdateTask = (updatedTask) => {
    setTasksList((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setSelectedTask(updatedTask);
  };

  const handleCreateTask = (newTask) => {
    setTasksList((prev) => [newTask, ...prev]);
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
          <SelectFilter label="Team" value={department} onChange={setDepartment} options={teams} />
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
            <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
              <thead className="sticky top-0 z-10 bg-[#F7F8FA] text-[#5A6577] font-bold text-xs uppercase border-b border-[rgba(0,0,0,0.06)]">
                <tr>
                  <th className="px-4 py-3 text-[11px] tracking-wider w-16 text-center">S.No.</th>
                  <th className="px-4 py-3 text-[11px] tracking-wider">Task Title</th>
                  <th className="px-4 py-3 text-[11px] tracking-wider">Assigned To</th>
                  <th className="px-4 py-3 text-[11px] tracking-wider">Team</th>
                  <th className="px-4 py-3 text-[11px] tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-[11px] tracking-wider">Done</th>
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
                      <p className={cn("text-xs font-bold transition-colors", task.status === "Completed" ? "line-through text-[#8E99A8]" : "text-[#1A1D23]")}>
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
      />

      {/* New Task Modal */}
      <NewTaskModal open={newTaskOpen} onClose={() => setNewTaskOpen(false)} onCreateTask={handleCreateTask} />
    </div>
  );
}

