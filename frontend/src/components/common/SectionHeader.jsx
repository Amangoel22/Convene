import { GlassButton } from "@/components/glass/GlassButton";
import { cn } from "@/lib/utils";

export function SectionHeader({ title, description, actionLabel, className }) {
  return (
    <div className={cn("mb-5 flex items-center justify-between gap-4", className)}>
      <div>
        <h3 className="text-xl font-semibold text-[#111827]">{title}</h3>
        {description ? <p className="mt-1 text-sm font-medium text-[#6B7280]">{description}</p> : null}
      </div>
      {actionLabel ? <GlassButton variant="ghost">{actionLabel}</GlassButton> : null}
    </div>
  );
}
