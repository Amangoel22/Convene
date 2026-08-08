import { Bell, ChevronDown, Menu, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { GlassButton } from "@/components/glass/GlassButton";
import { useAppStore } from "@/store/useAppStore";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const role = useAppStore((state) => state.role);
  const toggleRole = useAppStore((state) => state.toggleRole);
  const isLead = role === "lead";

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 8);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
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
          <div className="hidden md:flex items-center gap-2 h-9 rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-3.5 text-xs font-bold text-[#1A1D23] hover:bg-[#E8ECF1] cursor-pointer transition-colors">
            <Sparkles size={14} className="text-[#D4930E] shrink-0" />
            <span>HackFest 2026</span>
            <ChevronDown size={13} className="text-[#8E99A8] shrink-0" />
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
          <UserAvatar initials={isLead ? "AG" : "DS"} className="h-8 w-8 text-xs bg-[#EBF0FA] text-[#3B6FD4]" />
        </div>
      </div>
    </header>
  );
}
