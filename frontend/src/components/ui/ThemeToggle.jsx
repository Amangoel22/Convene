import { Moon, Sun } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { useAppStore } from "@/store/useAppStore";

export function ThemeToggle({ compact = false, className }) {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const Icon = theme === "dark" ? Sun : Moon;
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <GlassButton className={className} icon={<span key={theme} className="theme-toggle-icon"><Icon size={18} strokeWidth={1.75} /></span>} aria-label={label} title={label} onClick={toggleTheme}>
      {!compact && (theme === "dark" ? "Light Mode" : "Dark Mode")}
    </GlassButton>
  );
}
