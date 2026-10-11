// Purpose: Navbar implements this source module.
import { Bell, ChevronDown, Menu, Plus, Search, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { GlassButton } from "@/components/glass/GlassButton";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const role = useAppStore((state) => state.role);
  const events = useAppStore((state) => state.events);
  const activeEvent = useAppStore((state) => state.activeEvent);
  const setActiveEvent = useAppStore((state) => state.setActiveEvent);
  const isLead = role === "lead";

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 8);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 surface-token py-2 border-b border-subtle-token">
      <div className="flex h-12 items-center px-1">
        <GlassButton className="flex lg:hidden h-8 w-8 min-h-0 p-0" icon={<Menu size={18} strokeWidth={1.75} />} aria-label="Open navigation" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 type-xs weight-semibold text-token-secondary">
          <span className="hover:text-token-primary cursor-pointer">Convene</span>
          <span className="text-token-muted">/</span>
          <span className="text-token-primary weight-bold">Mission Control</span>
        </div>

        <div className="flex-1" />

        {/* Right Section Controls */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="hidden sm:flex items-center gap-2.5 h-9 rounded-full field-token border border-token px-3.5 type-xs weight-medium text-token-primary focus-within:ring-1 focus-within:ring-token-accent transition-all w-52 lg:w-64">
            <Search size={15} className="text-token-muted shrink-0" />
            <input
              type="text"
              placeholder="Search event..."
              className="bg-transparent outline-none w-full text-token-primary placeholder:text-token-muted type-xs weight-medium"
            />
          </div>

          {/* Current Event Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="hidden md:flex items-center gap-2 h-9 rounded-full field-token border border-token px-3.5 type-xs weight-bold text-token-primary hover:hover-token cursor-pointer transition-colors"
            >
              <span>{activeEvent?.name || "Select Event"}</span>
              <ChevronDown size={13} className={cn("text-token-muted shrink-0 transition-transform", dropdownOpen && "rotate-180")} />
            </button>

            {/* Event Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl surface-card-token border border-token p-2 shadow-xl z-50">
                <p className="px-3 py-1.5 type-10 weight-bold uppercase tracking-wider text-token-muted">Your Events</p>
                {events.length === 0 ? (
                  <p className="px-3 py-2 type-xs weight-medium text-token-muted">No events found</p>
                ) : (
                  events.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => {
                        setActiveEvent(evt);
                        setDropdownOpen(false);
                      }}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2 type-xs weight-semibold cursor-pointer transition-colors",
                        evt.id === activeEvent?.id ? "accent-surface-token text-token-accent" : "text-token-secondary hover:field-token"
                      )}
                    >
                      <span className="truncate">{evt.name}</span>
                      <span className="type-10 text-token-muted weight-normal">{evt.type}</span>
                    </div>
                  ))
                )}
                <div className="mt-2 pt-2 border-t border-subtle-token space-y-1">
                  <Link
                    to="/onboarding"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-1.5 type-xs weight-bold text-token-accent hover:accent-surface-token transition-colors"
                  >
                    <Plus size={14} /> Create New Event
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle
            compact
            className="h-9 w-9 min-h-0 px-0 text-token-secondary hover:text-token-primary"
          />

          {/* Notifications */}
          <button className="flex h-9 w-9 min-h-0 items-center justify-center rounded-full field-token border border-token text-token-secondary hover:hover-token hover:text-token-primary transition-colors">
            <Bell size={16} />
          </button>

          {/* Actual event access */}
          <div
            className="flex items-center gap-1.5 h-9 rounded-full accent-surface-token border border-token-accent/20 px-3 type-xs weight-bold text-token-accent"
            title="Your access for the selected event"
          >
            <ShieldCheck size={14} />
            <span>{isLead ? "Lead Organizer" : "Team Member"}</span>
          </div>

          {/* Profile Avatar */}
          <UserAvatar initials={isLead ? "AG" : "TM"} className="h-8 w-8 type-xs accent-surface-token text-token-accent" />
        </div>
      </div>
    </header>
  );
}
