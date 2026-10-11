// Purpose: SearchInput implements this source module.
import { GlassInput } from "@/components/glass/GlassInput";

export function SearchInput({ icon, placeholder = "Search tasks, teams, participants...", className }) {
  return (
    <GlassInput
      className={className ?? "h-10 surface-card-token/48 lg:max-w-md"}
      leftIcon={icon}
      placeholder={placeholder}
      aria-label="Search"
    />
  );
}
