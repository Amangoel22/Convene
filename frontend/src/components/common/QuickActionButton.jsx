import { GlassButton } from "@/components/glass/GlassButton";

export function QuickActionButton({ action, primary = false }) {
  return (
    <GlassButton
      variant={primary ? "primary" : "secondary"}
      icon={<action.icon size={18} strokeWidth={1.75} />}
      className="h-14 justify-start"
    >
      {action.label}
    </GlassButton>
  );
}
