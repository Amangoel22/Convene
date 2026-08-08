import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Download,
  FileText,
  Filter,
  Kanban,
  LayoutList,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Send,
  Sparkles,
  UserCheck,
  Users,
  X,
  Zap
} from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassModal } from "@/components/glass/GlassModal";
import { initialTasks } from "@/data/tasks";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";

const departments = ["All Departments", "Registration", "Hospitality", "Operations", "Tech", "Stage", "Logistics"];
const priorities = ["All Priorities", "Critical", "High", "Medium", "Low"];
const statuses = ["All Statuses", "Todo", "In Progress", "Blocked", "Completed"];

function SelectFilter({ value, onChange, options, label }) {
  return (
    <label className="glass-surface flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold text-[#6B7280]">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="cursor-pointer bg-transparent text-xs font-medium text-[#111827] outline-none"
      >
        {options.map((option) => (
          <option key={option} className="bg-[#111827] text-white">
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={13} strokeWidth={1.75} className="shrink-0 text-[#9CA3AF]" />
    </label>
  );
}

function TaskDrawer({ task, onClose, onUpdateTask, onDuplicateTask, onArchiveTask }) {
  const [newSubtask, setNewSubtask] = useState("");
  const [newNote, setNewNote] = useState("");

  if (!task) return null;

  const toggleChecklist = (checkId) => {
    const updatedChecklist = task.checklist.map((item) =>
      item.id === checkId ? { ...item, completed: !item.completed } : item
    );
    const completedCount = updatedChecklist.filter((c) => c.completed).length;
    const activityMsg = `updated checklist (${completedCount}/${updatedChecklist.length} completed)`;
    
    onUpdateTask({
      ...task,
      checklist: updatedChecklist,
      activity: [
        { id: `act-${Date.now()}`, user: "Aman Goel", action: activityMsg, timestamp: "Just now" },
        ...task.activity
      ]
    });
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    const newItem = { id: `c-${Date.now()}`, title: newSubtask.trim(), completed: false };
    onUpdateTask({
      ...task,
      checklist: [...task.checklist, newItem],
      activity: [
        { id: `act-${Date.now()}`, user: "Aman Goel", action: `added subtask "${newSubtask.trim()}"`, timestamp: "Just now" },
        ...task.activity
      ]
    });
    setNewSubtask("");
  };

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

  const handlePriorityChange = (newPriority) => {
    onUpdateTask({
      ...task,
      priority: newPriority,
      activity: [
        { id: `act-${Date.now()}`, user: "Aman Goel", action: `changed priority to ${newPriority}`, timestamp: "Just now" },
        ...task.activity
      ]
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 bg-[#111827]/15 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        className="glass-surface fixed bottom-4 right-4 top-4 z-50 flex w-[min(560px,calc(100vw-32px))] flex-col overflow-hidden rounded-[32px] p-6 shadow-[0_24px_70px_rgba(31,41,55,0.22)]"
        initial={{ x: 580, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 580, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-[#9CA3AF]">{task.id}</span>
              <PriorityBadge priority={task.priority} />
            </div>
            <h2 className="mt-2 text-xl font-bold text-[#111827]">{task.title}</h2>
          </div>
          <button
            className="flex h-9 w-9 min-h-0 items-center justify-center rounded-xl bg-white/45 text-[#6B7280] hover:bg-white/70"
            onClick={onClose}
            aria-label="Close task drawer"
          >
            <X size={17} strokeWidth={1.75} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          {/* Status & Properties Matrix */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/35 bg-white/25 p-3">
              <p className="text-[11px] font-semibold text-[#9CA3AF]">Status</p>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="mt-1 w-full bg-transparent text-xs font-bold text-[#111827] outline-none cursor-pointer"
              >
                {statuses.slice(1).map((s) => (
                  <option key={s} value={s} className="bg-[#111827] text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-2xl border border-white/35 bg-white/25 p-3">
              <p className="text-[11px] font-semibold text-[#9CA3AF]">Priority</p>
              <select
                value={task.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="mt-1 w-full bg-transparent text-xs font-bold text-[#111827] outline-none cursor-pointer"
              >
                {priorities.slice(1).map((p) => (
                  <option key={p} value={p} className="bg-[#111827] text-white">
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-2xl border border-white/35 bg-white/25 p-3">
              <p className="text-[11px] font-semibold text-[#9CA3AF]">Department</p>
              <p className="mt-1 text-xs font-bold text-[#111827] truncate">{task.department}</p>
            </div>
            <div className="rounded-2xl border border-white/35 bg-white/25 p-3">
              <p className="text-[11px] font-semibold text-[#9CA3AF]">Due Time</p>
              <p className="mt-1 text-xs font-bold text-[#111827] truncate">{task.dueDate}</p>
            </div>
          </div>

          {/* Assignee Box */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/35 bg-white/30 p-3.5">
            <UserAvatar initials={task.assignee.initials} image={task.assignee.avatar} className="h-9 w-9 text-xs" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#9CA3AF]">Assigned Member</p>
              <p className="text-sm font-bold text-[#111827] truncate">{task.assignee.name}</p>
            </div>
            <span className="text-xs font-medium text-[#6B7280]">{task.assignee.email}</span>
          </div>

          {/* Task Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Description</h3>
            <p className="mt-2 text-sm leading-6 text-[#111827] bg-white/20 rounded-2xl border border-white/30 p-3.5">
              {task.description}
            </p>
          </div>

          {/* Subtask Checklist */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Checklist Subtasks</h3>
              <span className="text-xs font-semibold text-[#6B7280]">
                {task.checklist.filter((c) => c.completed).length} / {task.checklist.length} completed
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {task.checklist.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-white/35 bg-white/30 px-3.5 py-2.5 transition-colors cursor-pointer hover:bg-white/45"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklist(item.id)}
                    className="h-4 w-4 rounded accent-[#34C759] cursor-pointer"
                  />
                  <span
                    className={cn(
                      "text-xs font-semibold transition-all",
                      item.completed ? "line-through text-[#9CA3AF]" : "text-[#111827]"
                    )}
                  >
                    {item.title}
                  </span>
                </label>
              ))}
            </div>
            <form onSubmit={handleAddSubtask} className="mt-2.5 flex items-center gap-2">
              <input
                type="text"
                placeholder="Add new subtask item..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                className="h-9 flex-1 rounded-xl border border-white/35 bg-white/25 px-3 text-xs font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF]"
              />
              <button
                type="submit"
                className="flex h-9 px-3.5 min-h-0 items-center gap-1.5 rounded-xl bg-white/50 text-xs font-semibold text-[#111827] hover:bg-white/80"
              >
                <Plus size={14} /> Add
              </button>
            </form>
          </div>

          {/* Attachments */}
          {task.attachments.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Attachments</h3>
              <div className="mt-2.5 space-y-2">
                {task.attachments.map((att) => (
                  <div
                    key={att.name}
                    className="flex items-center justify-between rounded-xl border border-white/35 bg-white/30 px-3.5 py-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip size={14} className="text-[#9CA3AF] shrink-0" />
                      <span className="font-semibold text-[#111827] truncate">{att.name}</span>
                      <span className="text-[#9CA3AF] text-[11px] shrink-0">({att.size})</span>
                    </div>
                    <button className="flex h-7 w-7 min-h-0 items-center justify-center rounded-lg bg-white/40 text-[#6B7280] hover:bg-white/70">
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internal Notes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Internal Operational Notes</h3>
            <div className="mt-2 rounded-2xl border border-white/35 bg-white/25 p-3.5">
              {task.notes ? (
                <p className="whitespace-pre-wrap text-xs leading-5 text-[#6B7280] font-medium">{task.notes}</p>
              ) : (
                <p className="text-xs text-[#9CA3AF] italic">No internal notes added yet.</p>
              )}
              <form onSubmit={handleAddNote} className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Type an internal note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="h-8 flex-1 rounded-xl border border-white/35 bg-white/30 px-3 text-xs text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                />
                <button
                  type="submit"
                  className="flex h-8 px-3 min-h-0 items-center justify-center rounded-xl bg-white/60 text-xs font-semibold text-[#111827] hover:bg-white"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
          </div>

          {/* Activity Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Activity Timeline</h3>
            <div className="mt-3 space-y-3 pl-1">
              {task.activity.map((act) => (
                <div key={act.id} className="relative flex items-start gap-3 pl-3 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-[#F6C445]">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#111827]">
                      <span className="font-bold text-[#111827]">{act.user}</span> {act.action}
                    </p>
                    <p className="text-[11px] font-medium text-[#9CA3AF]">{act.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="border-t border-white/20 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <GlassButton
            variant={task.status === "Completed" ? "secondary" : "success"}
            className="h-9 text-xs justify-center"
            icon={<Check size={15} />}
            onClick={() => handleStatusChange(task.status === "Completed" ? "In Progress" : "Completed")}
          >
            {task.status === "Completed" ? "Reopen" : "Complete"}
          </GlassButton>

          <GlassButton
            variant="secondary"
            className="h-9 text-xs justify-center"
            icon={<Copy size={14} />}
            onClick={() => onDuplicateTask(task)}
          >
            Duplicate
          </GlassButton>

          <GlassButton
            variant="secondary"
            className="h-9 text-xs justify-center"
            icon={<Users size={14} />}
            onClick={() => alert("Assignee transfer dialog invoked.")}
          >
            Reassign
          </GlassButton>

          <GlassButton
            variant="secondary"
            className="h-9 text-xs justify-center text-rose-500 hover:text-rose-600"
            icon={<Archive size={14} />}
            onClick={() => onArchiveTask(task.id)}
          >
            Archive
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
  const [priority, setPriority] = useState("High");
  const [dueDate, setDueDate] = useState("Today, 04:00 PM");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: `TASK-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      description: description.trim() || "Operational task description pending details.",
      department,
      priority,
      status: "Todo",
      assignee: {
        name: "Aman Goel",
        initials: "AG",
        avatar: "https://i.pravatar.cc/96?img=33",
        email: "aman.goel@convene.edu"
      },
      dueDate: dueDate.trim() || "Today, 05:00 PM",
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
    <GlassModal open={open} className="w-[min(540px,calc(100vw-32px))] max-w-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Create Operational Task</h2>
          <p className="mt-1 text-xs font-medium text-[#6B7280]">Assign a new duty allocation for team execution.</p>
        </div>
        <button
          className="flex h-8 w-8 min-h-0 items-center justify-center rounded-xl bg-white/45 text-[#6B7280] hover:bg-white/70"
          onClick={onClose}
          aria-label="Close new task modal"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-[#9CA3AF]">Task Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Setup VIP Lounge & Stage Monitors"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-white/35 bg-white/30 px-3.5 text-xs font-semibold text-[#111827] outline-none placeholder:text-[#9CA3AF]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#9CA3AF]">Description</label>
          <textarea
            rows={3}
            placeholder="Task scope details, location and deliverables..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/35 bg-white/30 p-3 text-xs font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF]"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#9CA3AF]">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 h-9 w-full rounded-xl border border-white/35 bg-white/30 px-2.5 text-xs font-semibold text-[#111827] outline-none cursor-pointer"
            >
              {departments.slice(1).map((d) => (
                <option key={d} value={d} className="bg-[#111827] text-white">
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#9CA3AF]">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="mt-1 h-9 w-full rounded-xl border border-white/35 bg-white/30 px-2.5 text-xs font-semibold text-[#111827] outline-none cursor-pointer"
            >
              {priorities.slice(1).map((p) => (
                <option key={p} value={p} className="bg-[#111827] text-white">
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#9CA3AF]">Due Time</label>
            <input
              type="text"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 h-9 w-full rounded-xl border border-white/35 bg-white/30 px-2.5 text-xs font-semibold text-[#111827] outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-2">
          <GlassButton type="button" onClick={onClose} className="h-9 text-xs">
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" icon={<Plus size={15} />} className="h-9 text-xs">
            Create Task
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}

export function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [priority, setPriority] = useState("All Priorities");
  const [status, setStatus] = useState("All Statuses");
  const [assignee, setAssignee] = useState("All Assignees");
  const [view, setView] = useState("list"); // "list" | "board"
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [loading] = useState(false);

  const assigneeOptions = useMemo(() => {
    return ["All Assignees", ...Array.from(new Set(tasks.map((t) => t.assignee.name)))];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.department.toLowerCase().includes(query) ||
        task.assignee.name.toLowerCase().includes(query) ||
        task.id.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (department === "All Departments" || task.department === department) &&
        (priority === "All Priorities" || task.priority === priority) &&
        (status === "All Statuses" || task.status === status) &&
        (assignee === "All Assignees" || task.assignee.name === assignee)
      );
    });
  }, [assignee, department, priority, search, status, tasks]);

  const totalTasks = tasks.length;
  const completedToday = tasks.filter((t) => t.completedToday || t.status === "Completed").length;
  const overdueTasks = tasks.filter((t) => t.status === "Blocked" || t.priority === "Critical").length;
  const highPriorityTasks = tasks.filter((t) => t.priority === "Critical" || t.priority === "High").length;

  const metrics = [
    { label: "Total Tasks", value: String(totalTasks), detail: "Active operational workload", icon: Users, tone: "info" },
    { label: "Completed Today", value: String(completedToday), detail: "High execution rate", icon: CheckCircle2, tone: "success" },
    { label: "Overdue / Critical", value: String(overdueTasks), detail: "Requires immediate focus", icon: AlertTriangle, tone: "error" },
    { label: "High Priority", value: String(highPriorityTasks), detail: "Key event deliverables", icon: Zap, tone: "gold" }
  ];

  const handleToggleComplete = (e, taskId) => {
    e.stopPropagation();
    setTasks((prev) =>
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
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setSelectedTask(updatedTask);
  };

  const handleCreateTask = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleDuplicateTask = (taskToDup) => {
    const duplicated = {
      ...taskToDup,
      id: `TASK-${Math.floor(100 + Math.random() * 900)}`,
      title: `${taskToDup.title} (Copy)`,
      status: "Todo",
      completedToday: false,
      activity: [{ id: `act-${Date.now()}`, user: "Aman Goel", action: "duplicated task", timestamp: "Just now" }]
    };
    setTasks((prev) => [duplicated, ...prev]);
    setSelectedTask(duplicated);
  };

  const handleArchiveTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <PageHeader title="Tasks" description="Assign, monitor and complete operational work." />
        <div className="flex flex-wrap items-center gap-3">
          <GlassButton variant="success" icon={<Plus size={17} strokeWidth={1.75} />} onClick={() => setNewTaskOpen(true)}>
            New Task
          </GlassButton>
          <GlassButton icon={<Users size={17} strokeWidth={1.75} />}>Bulk Assign</GlassButton>
          <GlassButton icon={<Download size={17} strokeWidth={1.75} />}>Export</GlassButton>
        </div>
      </div>

      {/* Metrics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Task metrics">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      {/* Toolbar */}
      <GlassCard className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            <GlassInput
              className="h-9 min-w-[220px] max-w-sm flex-1 bg-white/48 text-xs"
              leftIcon={<Search size={15} strokeWidth={1.75} />}
              placeholder="Search by task title, department, assignee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search tasks"
            />
            <SelectFilter label="Department" value={department} onChange={setDepartment} options={departments} />
            <SelectFilter label="Priority" value={priority} onChange={setPriority} options={priorities} />
            <SelectFilter label="Status" value={status} onChange={setStatus} options={statuses} />
            <SelectFilter label="Assignee" value={assignee} onChange={setAssignee} options={assigneeOptions} />
          </div>

          {/* View Toggle */}
          <div className="glass-surface flex items-center rounded-xl border border-white/20 p-1 shrink-0">
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all min-h-0 cursor-pointer",
                view === "list"
                  ? "bg-[#F6C445] text-[#111827] shadow-[0_4px_14px_rgba(246,196,69,0.3)]"
                  : "text-[#6B7280] hover:text-[#111827] hover:bg-white/20"
              )}
            >
              <LayoutList size={14} /> List
            </button>
            <button
              onClick={() => setView("board")}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all min-h-0 cursor-pointer",
                view === "board"
                  ? "bg-[#F6C445] text-[#111827] shadow-[0_4px_14px_rgba(246,196,69,0.3)]"
                  : "text-[#6B7280] hover:text-[#111827] hover:bg-white/20"
              )}
            >
              <Kanban size={14} /> Board
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Task Workspace (List / Board) */}
      <GlassCard padding="none" className="overflow-hidden min-h-[500px]">
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
          /* Linear-inspired List View */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left">
              <thead className="sticky top-0 z-10 bg-slate-900/90 text-[#9CA3AF] border-b border-white/10 backdrop-blur-2xl">
                <tr className="text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Task Title</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Due Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Done</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task, index) => (
                  <motion.tr
                    key={task.id}
                    className="group cursor-pointer border-b border-white/35 transition-all hover:bg-white/45 hover:shadow-sm"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.015, type: "spring", stiffness: 300, damping: 28 }}
                    whileHover={{ y: -1, scale: 1.002 }}
                    onClick={() => setSelectedTask(task)}
                  >
                    {/* Priority */}
                    <td className="border-b border-white/35 px-4 py-3">
                      <PriorityBadge priority={task.priority} />
                    </td>

                    {/* Task Title */}
                    <td className="border-b border-white/35 px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-mono font-semibold text-[#9CA3AF] shrink-0">{task.id}</span>
                        <p className={cn("text-xs font-bold transition-colors", task.status === "Completed" ? "line-through text-[#9CA3AF]" : "text-[#111827]")}>
                          {task.title}
                        </p>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="border-b border-white/35 px-4 py-3">
                      <span className="inline-flex rounded-full border border-white/30 bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#6B7280]">
                        {task.department}
                      </span>
                    </td>

                    {/* Assignee */}
                    <td className="border-b border-white/35 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <UserAvatar initials={task.assignee.initials} image={task.assignee.avatar} className="h-6 w-6 text-[10px]" />
                        <span className="text-xs font-semibold text-[#111827]">{task.assignee.name}</span>
                      </div>
                    </td>

                    {/* Due Time */}
                    <td className="border-b border-white/35 px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B7280]">
                        <Clock size={13} strokeWidth={1.75} className="text-[#9CA3AF]" />
                        {task.dueDate}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="border-b border-white/35 px-4 py-3">
                      <StatusBadge status={task.status} />
                    </td>

                    {/* Quick Complete */}
                    <td className="border-b border-white/35 px-4 py-3 text-right">
                      <motion.button
                        className={cn(
                          "inline-flex h-6 w-6 min-h-0 items-center justify-center rounded-full transition-colors",
                          task.status === "Completed"
                            ? "bg-[#34C759] text-white"
                            : "bg-white/60 text-[#34C759] hover:bg-white border border-white/50"
                        )}
                        onClick={(e) => handleToggleComplete(e, task.id)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Toggle complete ${task.title}`}
                      >
                        <Check size={13} strokeWidth={2.2} />
                      </motion.button>
                    </td>
                  </motion.tr>
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
                <div key={columnStatus} className="glass-surface rounded-2xl border border-white/30 p-3.5 flex flex-col min-h-[480px]">
                  {/* Column Header */}
                  <div className="mb-3 flex items-center justify-between border-b border-white/20 pb-2.5 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#111827]">{columnStatus}</span>
                    <span className="inline-flex h-5 px-2 items-center justify-center rounded-full bg-white/30 text-[11px] font-bold text-[#111827] border border-white/30">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Column Task Cards */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5">
                    {columnTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        className="group cursor-pointer rounded-xl border border-white/45 bg-white/45 p-3.5 shadow-sm transition-all hover:border-white/70 hover:bg-white/65 hover:shadow-md"
                        whileHover={{ y: -2, scale: 1.01 }}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <PriorityBadge priority={task.priority} />
                          <span className="text-[10px] font-mono font-semibold text-[#9CA3AF]">{task.id}</span>
                        </div>
                        <p className="mt-2 text-xs font-bold text-[#111827] line-clamp-2">{task.title}</p>
                        <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-2 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <UserAvatar initials={task.assignee.initials} image={task.assignee.avatar} className="h-5 w-5 text-[9px]" />
                            <span className="font-semibold text-[#6B7280] truncate max-w-[90px]">{task.assignee.name}</span>
                          </div>
                          <motion.button
                            className={cn(
                              "flex h-5 w-5 min-h-0 items-center justify-center rounded-full transition-colors",
                              task.status === "Completed" ? "bg-[#34C759] text-white" : "bg-white/70 text-[#34C759] hover:bg-white"
                            )}
                            onClick={(e) => handleToggleComplete(e, task.id)}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Check size={11} strokeWidth={2} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Task Drawer */}
      <TaskDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        onDuplicateTask={handleDuplicateTask}
        onArchiveTask={handleArchiveTask}
      />

      {/* New Task Modal */}
      <NewTaskModal open={newTaskOpen} onClose={() => setNewTaskOpen(false)} onCreateTask={handleCreateTask} />
    </div>
  );
}
