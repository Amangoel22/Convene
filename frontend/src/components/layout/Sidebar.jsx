import {
  Boxes,
  CalendarClock,
  ClipboardCheck,
  Flag,
  LayoutDashboard,
  Library,
  LogOut,
  Settings,
  ShieldAlert,
  UserCheck,
  Users,
  Waypoints
} from "lucide-react";
import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const navSections = [
  {
    title: "HOME",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }
    ]
  },
  {
    title: "EVENT",
    items: [
      { label: "Participants", href: "/participants", icon: Users },
      { label: "Tasks", href: "/tasks", icon: ClipboardCheck },
      { label: "Duties", href: "/duties", icon: UserCheck },
      { label: "Teams", href: "/teams", icon: Waypoints },
      { label: "Run of Show", href: "/run-of-show", icon: CalendarClock }
    ]
  },
  {
    title: "OPERATIONS",
    items: [
      { label: "Inventory", href: "/inventory", icon: Boxes },
      { label: "Resources", href: "/resources", icon: Library },
      { label: "Issues", href: "/issues", icon: ShieldAlert }
    ]
  },
  {
    title: "SETUP",
    items: [
      { label: "Settings", href: "/settings", icon: Settings }
    ]
  }
];

export function Sidebar() {
  const navigate = useNavigate();
  const role = useAppStore((state) => state.role);
  const toggleRole = useAppStore((state) => state.toggleRole);
  const currentUser = useAppStore((state) => state.currentUser);
  const clearSession = useAppStore((state) => state.clearSession);
  const isLead = role === "lead";

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col bg-white border-r border-[rgba(0,0,0,0.08)] px-5 py-6 font-sans lg:flex">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#3B6FD4] text-white shadow-md">
          <Flag size={18} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-[#1A1D23] leading-none">Convene</h1>
          <p className="text-[10px] font-medium text-[#8E99A8] mt-0.5">Event Command Portal</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-[#8E99A8] mb-2">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex h-10 items-center gap-3.5 rounded-full px-4 text-xs font-semibold transition-colors duration-150",
                      isActive
                        ? "bg-[#EBF0FA] text-[#3B6FD4] font-bold"
                        : "text-[#5A6577] hover:bg-[#F0F2F5] hover:text-[#1A1D23]"
                    )
                  }
                  aria-label={item.label}
                >
                  <item.icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span className="truncate whitespace-nowrap">
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="pt-4 border-t border-[rgba(0,0,0,0.08)] space-y-2">
        <div className="flex items-center justify-between gap-2 rounded-2xl px-2 py-1.5 hover:bg-[#F0F2F5] transition-colors">
          <div className="flex items-center gap-2.5 min-w-0 cursor-pointer" onClick={toggleRole} title="Click to switch role view">
            <UserAvatar
              name={currentUser?.name}
              initials={currentUser?.name ? currentUser.name.split(" ").map(n => n[0]).join("") : (isLead ? "AG" : "TM")}
              className="h-8 w-8 text-xs bg-[#EBF0FA] text-[#3B6FD4] shrink-0"
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[#1A1D23]">{currentUser?.name || (isLead ? "Aman Goel" : "Team Member")}</p>
              <p className="truncate text-[10px] font-medium text-[#8E99A8]">{isLead ? "Lead Organizer" : "Team Member"}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#D6453D]/10 hover:text-[#D6453D] transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
