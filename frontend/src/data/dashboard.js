import {
  AlertTriangle,
  ClipboardCheck,
  LayoutDashboard,
  Users,
  Waypoints
} from "lucide-react";

export const eventSummary = {
  name: "HackFest 2026",
  stage: "Mentoring",
  date: "Tuesday, August 4",
  countdown: "03:42:18",
  progress: 62
};

export const timelineStages = [
  { label: "Registration", status: "complete" },
  { label: "Opening", status: "complete" },
  { label: "Hackathon", status: "complete" },
  { label: "Mentoring", status: "current" },
  { label: "Judging", status: "upcoming" },
  { label: "Closing", status: "upcoming" }
];

export const metrics = [
  { label: "Participants", value: "428", detail: "106 teams checked in", icon: Users, tone: "info" },
  { label: "Pending Tasks", value: "18", detail: "6 due before lunch", icon: ClipboardCheck, tone: "gold" },
  { label: "Open Issues", value: "4", detail: "1 needs immediate owner", icon: AlertTriangle, tone: "warning" },
  { label: "Departments", value: "9", detail: "All teams active", icon: Waypoints, tone: "success" }
];

export const todayTasks = [
  {
    id: "task-1",
    title: "Confirm mentor room signage",
    department: "Operations",
    priority: "High",
    status: "In Progress",
    assignee: "AK",
    dueTime: "10:30"
  },
  {
    id: "task-2",
    title: "Move spare extension boards to Lab C",
    department: "Inventory",
    priority: "Medium",
    status: "Todo",
    assignee: "MS",
    dueTime: "11:00"
  },
  {
    id: "task-3",
    title: "Publish judging rubric in resource vault",
    department: "Content",
    priority: "High",
    status: "Blocked",
    assignee: "PN",
    dueTime: "11:20"
  },
  {
    id: "task-4",
    title: "Check food token count for dinner",
    department: "Hospitality",
    priority: "Low",
    status: "Todo",
    assignee: "RS",
    dueTime: "12:00"
  }
];

export const leaderboard = [
  { name: "Aarav Kumar", initials: "AK", avatar: "https://i.pravatar.cc/96?img=12", role: "Ops Lead", xp: 2840, completed: 31, reliability: "98%", badge: "Steady Hand" },
  { name: "Meera Shah", initials: "MS", avatar: "https://i.pravatar.cc/96?img=47", role: "Inventory", xp: 2520, completed: 27, reliability: "96%", badge: "Fast Closer" },
  { name: "Prisha Nair", initials: "PN", avatar: "https://i.pravatar.cc/96?img=32", role: "Content", xp: 2310, completed: 24, reliability: "94%", badge: "Clear Signal" },
  { name: "Rohan Sethi", initials: "RS", avatar: "https://i.pravatar.cc/96?img=15", role: "Hospitality", xp: 2190, completed: 22, reliability: "92%", badge: "On Time" },
  { name: "Tara Bose", initials: "TB", avatar: "https://i.pravatar.cc/96?img=5", role: "Volunteers", xp: 2030, completed: 20, reliability: "91%", badge: "Anchor" }
];

export const schedule = [
  { time: "09:00", title: "Mentor orientation", location: "Auditorium", status: "complete" },
  { time: "10:00", title: "Mentoring round one", location: "Labs A-D", status: "current" },
  { time: "12:30", title: "Lunch service", location: "Cafeteria", status: "upcoming" },
  { time: "15:00", title: "Submission checkpoint", location: "Online", status: "upcoming" }
];

export const quickActions = [
  { label: "Import Participants", icon: Users },
  { label: "Create Task", icon: ClipboardCheck },
  { label: "Assign Duty", icon: LayoutDashboard },
  { label: "Report Issue", icon: AlertTriangle }
];
