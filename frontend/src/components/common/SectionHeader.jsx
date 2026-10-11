// Purpose: SectionHeader implements this source module.
import { GlassButton } from "@/components/glass/GlassButton";
import { cn } from "@/lib/utils";

export function SectionHeader({ title, description, actionLabel, className }) {
  return (
    <div className={cn("mb-5 flex items-center justify-between gap-4", className)}>
      <div>
        <h3 className="type-xl weight-semibold text-token-primary">{title}</h3>
        {description ? <p className="mt-1 type-sm weight-medium text-token-secondary">{description}</p> : null}
      </div>
      {actionLabel ? <GlassButton variant="ghost">{actionLabel}</GlassButton> : null}
    </div>
  );
}
