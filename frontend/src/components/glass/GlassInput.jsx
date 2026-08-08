import { cn } from "@/lib/utils";

export function GlassInput({ className, leftIcon, rightSlot, ...props }) {
  return (
    <label className={cn("glass-surface flex h-10 min-w-0 flex-1 items-center gap-3 rounded-2xl px-4 text-[#6B7280]", className)}>
      {leftIcon}
      <span className="sr-only">{props["aria-label"] ?? props.placeholder ?? "Input"}</span>
      <input className="w-full border-0 bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF]" {...props} />
      {rightSlot}
    </label>
  );
}
