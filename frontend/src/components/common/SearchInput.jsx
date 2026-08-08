import { GlassInput } from "@/components/glass/GlassInput";

export function SearchInput({ icon, placeholder = "Search tasks, teams, participants...", className }) {
  return (
    <GlassInput
      className={className ?? "h-10 bg-white/48 lg:max-w-md"}
      leftIcon={icon}
      placeholder={placeholder}
      aria-label="Search"
    />
  );
}
