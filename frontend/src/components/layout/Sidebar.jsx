import {
  Boxes,
  CalendarClock,
  ClipboardCheck,
  Flag,
  LayoutDashboard,
  Library,
  Settings,
  ShieldAlert,
  UserCheck,
  Users,
  Waypoints
} from "lucide-react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
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
      { label: "Onboarding Flow", href: "/onboarding", icon: Flag },
      { label: "Settings", href: "/settings", icon: Settings }
    ]
  }
];

export function Sidebar() {
  const role = useAppStore((state) => state.role);
  const toggleRole = useAppStore((state) => state.toggleRole);
  const isLead = role === "lead";

  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-32px)] w-60 shrink-0 overflow-y-auto bg-white border-r border-[rgba(0,0,0,0.08)] py-2 px-1 lg:flex lg:flex-col" aria-label="Primary navigation">
      {/* Brand Header */}
      <div className="flex h-14 items-center gap-3 px-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B6FD4] text-white shadow-sm">
          <Flag size={18} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-[#1A1D23]">Convene</h1>
        </div>
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-[#8E99A8]">
              {section.title}
            </p>
            <div className="space-y-0.5">
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

      {/* Footer Profile */}
      <div className="pt-4 border-t border-[rgba(0,0,0,0.08)]">
        <div className="flex h-11 items-center gap-3 rounded-full px-3 hover:bg-[#F0F2F5] transition-colors cursor-pointer" onClick={toggleRole}>
          <UserAvatar initials={isLead ? "AG" : "TM"} className="h-8 w-8 text-xs bg-[#EBF0FA] text-[#3B6FD4]" />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[#1A1D23]">{isLead ? "Aman Goel" : "Team Member"}</p>
            <p className="truncate text-[10px] font-medium text-[#8E99A8]">{isLead ? "Lead Organizer" : "Team Member"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
