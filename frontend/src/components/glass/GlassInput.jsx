// Purpose: GlassInput implements this source module.
import { cn } from "@/lib/utils";

export function GlassInput({ className, leftIcon, rightSlot, ...props }) {
  return (
    <label className={cn("glass-surface flex h-10 min-w-0 flex-1 items-center gap-3 rounded-2xl px-4 text-token-secondary", className)}>
      {leftIcon}
      <span className="sr-only">{props["aria-label"] ?? props.placeholder ?? "Input"}</span>
      <input className="w-full border-0 bg-transparent type-sm text-token-primary outline-none placeholder:text-token-muted" {...props} />
      {rightSlot}
    </label>
  );
}
