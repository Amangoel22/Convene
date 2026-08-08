import { Moon, Sun } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { useAppStore } from "@/store/useAppStore";

export function ThemeToggle({ compact = false, className }) {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const Icon = theme === "dark" ? Sun : Moon;
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <GlassButton className={className} icon={<Icon size={18} strokeWidth={1.75} />} aria-label={label} onClick={toggleTheme}>
      {!compact && (theme === "dark" ? "Light Mode" : "Dark Mode")}
    </GlassButton>
  );
}
