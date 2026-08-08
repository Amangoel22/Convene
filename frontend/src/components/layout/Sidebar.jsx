import {
  Boxes,
  CalendarClock,
  ClipboardCheck,
  Flag,
  LayoutDashboard,
  Library,
  Settings,
  ShieldAlert,
  Users,
  Waypoints
} from "lucide-react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { GlassSidebar } from "@/components/glass/GlassSidebar";
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
    title: "SETTINGS",
    items: [
      { label: "Settings", href: "/settings", icon: Settings }
    ]
  }
];

export function Sidebar() {
  return (
    <GlassSidebar expanded={true}>
      {/* Brand Header */}
      <div className="flex h-14 items-center gap-3 px-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A3D63] text-white">
          <Flag size={18} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-[#172B4D]">Convene</h1>
        </div>
      </div>

      {/* Nav Sections - Google Photos Style */}
      <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-[#8190A3]">
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
                        ? "bg-[#B9DDF5] text-[#0B3555] font-bold"
                        : "text-[#52657A] hover:bg-[#E3EDF5] hover:text-[#172B4D]"
                    )
                  }
                  aria-label={item.label}
                >
                  <item.icon className="h-4 w-4 shrink-0 text-[#1A3D63]" strokeWidth={2} />
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
      <div className="pt-4 border-t border-[#D0DFEC]/40">
        <div className="flex h-11 items-center gap-3 rounded-full px-3 hover:bg-[#E3EDF5] transition-colors cursor-pointer">
          <UserAvatar initials="AG" className="h-8 w-8 text-xs bg-[#1A3D63] text-white" />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[#172B4D]">Aman Goel</p>
            <p className="truncate text-[10px] font-medium text-[#52657A]">Lead Organizer</p>
          </div>
        </div>
      </div>
    </GlassSidebar>
  );
}
