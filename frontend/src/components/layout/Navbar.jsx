import { Bell, ChevronDown, Menu, Plus, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { GlassButton } from "@/components/glass/GlassButton";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const role = useAppStore((state) => state.role);
  const toggleRole = useAppStore((state) => state.toggleRole);
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
    <header className="sticky top-0 z-20 bg-[#F7F8FA] py-2 border-b border-[rgba(0,0,0,0.06)]">
      <div className="flex h-12 items-center px-1">
        <GlassButton className="flex lg:hidden h-8 w-8 min-h-0 p-0" icon={<Menu size={18} strokeWidth={1.75} />} aria-label="Open navigation" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A6577]">
          <span className="hover:text-[#1A1D23] cursor-pointer">Convene</span>
          <span className="text-[#8E99A8]">/</span>
          <span className="text-[#1A1D23] font-bold">Mission Control</span>
        </div>

        <div className="flex-1" />

        {/* Right Section Controls */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="hidden sm:flex items-center gap-2.5 h-9 rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-medium text-[#1A1D23] focus-within:ring-1 focus-within:ring-[#3B6FD4] transition-all w-52 lg:w-64">
            <Search size={15} className="text-[#8E99A8] shrink-0" />
            <input
              type="text"
              placeholder="Search event..."
              className="bg-transparent outline-none w-full text-[#1A1D23] placeholder:text-[#8E99A8] text-xs font-medium"
            />
          </div>

          {/* Current Event Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="hidden md:flex items-center gap-2 h-9 rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-bold text-[#1A1D23] hover:bg-[#E8ECF1] cursor-pointer transition-colors"
            >
              <span>{activeEvent?.name || "Select Event"}</span>
              <ChevronDown size={13} className={cn("text-[#8E99A8] shrink-0 transition-transform", dropdownOpen && "rotate-180")} />
            </button>

            {/* Event Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] p-2 shadow-xl z-50">
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8E99A8]">Your Events</p>
                {events.length === 0 ? (
                  <p className="px-3 py-2 text-xs font-medium text-[#8E99A8]">No events found</p>
                ) : (
                  events.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => {
                        setActiveEvent(evt);
                        setDropdownOpen(false);
                      }}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer transition-colors",
                        evt.id === activeEvent?.id ? "bg-[#EBF0FA] text-[#3B6FD4]" : "text-[#5A6577] hover:bg-[#F0F2F5]"
                      )}
                    >
                      <span className="truncate">{evt.name}</span>
                      <span className="text-[10px] text-[#8E99A8] font-normal">{evt.type}</span>
                    </div>
                  ))
                )}
                <div className="mt-2 pt-2 border-t border-[rgba(0,0,0,0.06)] space-y-1">
                  <Link
                    to="/onboarding"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-[#3B6FD4] hover:bg-[#EBF0FA] transition-colors"
                  >
                    <Plus size={14} /> Create New Event
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="flex h-9 w-9 min-h-0 items-center justify-center rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23] transition-colors">
            <Bell size={16} />
          </button>

          {/* Role Switcher */}
          <button
            onClick={toggleRole}
            className="flex items-center gap-1.5 h-9 rounded-full bg-[#EBF0FA] border border-[#3B6FD4]/20 px-3 text-xs font-bold text-[#3B6FD4] hover:bg-[#3B6FD4] hover:text-white transition-colors cursor-pointer"
            title="Click to toggle between Lead Organizer and Team Member view"
          >
            <ShieldCheck size={14} />
            <span>{isLead ? "Lead Organizer" : "Team Member"}</span>
          </button>

          {/* Profile Avatar */}
          <UserAvatar initials={isLead ? "AG" : "TM"} className="h-8 w-8 text-xs bg-[#EBF0FA] text-[#3B6FD4]" />
        </div>
      </div>
    </header>
  );
}
