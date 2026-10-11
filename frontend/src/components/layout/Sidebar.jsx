// Purpose: Sidebar implements this source module.
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
  const currentUser = useAppStore((state) => state.currentUser);
  const clearSession = useAppStore((state) => state.clearSession);
  const isLead = role === "lead";

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col surface-card-token border-r border-token px-5 py-6 font-sans lg:flex">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-token-accent text-token-inverse shadow-md">
          <Flag size={18} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="type-lg weight-extrabold tracking-tight text-token-primary leading-none">Convene</h1>
          <p className="type-10 weight-medium text-token-muted mt-0.5">Event Command Portal</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-4 type-10 weight-bold uppercase tracking-wider text-token-muted mb-2">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex h-10 items-center gap-3.5 rounded-full px-4 type-xs weight-semibold transition-colors duration-150",
                      isActive
                        ? "accent-surface-token text-token-accent weight-bold"
                        : "text-token-secondary hover:field-token hover:text-token-primary"
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
      <div className="pt-4 border-t border-token space-y-2">
        <div className="flex items-center justify-between gap-2 rounded-2xl px-2 py-1.5 hover:field-token transition-colors">
          <div className="flex items-center gap-2.5 min-w-0" title="Your access for the selected event">
            <UserAvatar
              name={currentUser?.name}
              initials={currentUser?.name ? currentUser.name.split(" ").map(n => n[0]).join("") : (isLead ? "AG" : "TM")}
              className="h-8 w-8 type-xs accent-surface-token text-token-accent shrink-0"
            />
            <div className="min-w-0">
              <p className="truncate type-xs weight-bold text-token-primary">{currentUser?.name || (isLead ? "Aman Goel" : "Team Member")}</p>
              <p className="truncate type-10 weight-medium text-token-muted">{isLead ? "Lead Organizer" : "Team Member"}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full field-token text-token-secondary hover:bg-token-error/10 hover:text-token-error transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
