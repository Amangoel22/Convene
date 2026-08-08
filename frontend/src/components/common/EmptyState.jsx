import { GlassButton } from "@/components/glass/GlassButton";

export function EmptyState({ title, description, actionLabel }) {
  return (
    <div className="glass-surface rounded-[20px] p-8 text-center">
      <div className="mx-auto mb-4 h-14 w-14 rounded-[20px] bg-white/45" />
      <h3 className="text-lg font-semibold text-[#111827]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#6B7280]">{description}</p>
      {actionLabel ? <GlassButton className="mt-5" variant="primary">{actionLabel}</GlassButton> : null}
    </div>
  );
}
