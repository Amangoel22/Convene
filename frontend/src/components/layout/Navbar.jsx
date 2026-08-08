import { Bell, ChevronDown, Menu, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { GlassNavbar } from "@/components/glass/GlassNavbar";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { GlassButton } from "@/components/glass/GlassButton";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 8);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-[#F1F5FB] py-2">
      <div className="flex h-12 items-center px-1">
        <GlassButton className="flex lg:hidden h-8 w-8 min-h-0 p-0" icon={<Menu size={18} strokeWidth={1.75} />} aria-label="Open navigation" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#52657A]">
          <span className="hover:text-[#172B4D] cursor-pointer">Convene</span>
          <span className="text-[#8190A3]">/</span>
          <span className="text-[#172B4D] font-bold">Mission Control</span>
        </div>

        <div className="flex-1" />

        {/* Right Section Controls */}
        <div className="flex items-center gap-3">
          {/* Google Search Style Bar */}
          <div className="hidden sm:flex items-center gap-2.5 h-9 rounded-full bg-[#E5EEF7] px-3.5 text-xs font-medium text-[#172B4D] focus-within:ring-1 focus-within:ring-[#4A7FA7] transition-all w-52 lg:w-64">
            <Search size={15} className="text-[#8190A3] shrink-0" />
            <input
              type="text"
              placeholder="Search event..."
              className="bg-transparent outline-none w-full text-[#172B4D] placeholder:text-[#8190A3] text-xs font-medium"
            />
          </div>

          {/* Current Event Selector */}
          <div className="hidden md:flex items-center gap-2 h-9 rounded-full bg-[#E5EEF7] px-3.5 text-xs font-bold text-[#172B4D] hover:bg-[#D0DFEC] cursor-pointer transition-colors">
            <Sparkles size={14} className="text-[#E5A91A] shrink-0" />
            <span>HackFest 2026</span>
            <ChevronDown size={13} className="text-[#8190A3] shrink-0" />
          </div>

          {/* Notifications */}
          <button className="flex h-9 w-9 min-h-0 items-center justify-center rounded-full bg-[#E5EEF7] text-[#52657A] hover:bg-[#D0DFEC] transition-colors">
            <Bell size={16} />
          </button>

          {/* Profile Avatar */}
          <UserAvatar initials="AG" className="h-8 w-8 text-xs bg-[#1A3D63] text-white" />
        </div>
      </div>
    </header>
  );
}
