import { GlassButton } from "@/components/glass/GlassButton";

export function EmptyState({ title, description, actionLabel, onAction, icon: Icon }) {
  return (
    <div className="glass-surface rounded-[20px] p-8 text-center flex flex-col items-center justify-center">
      {Icon ? (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#EBF0FA] text-[#3B6FD4]">
          <Icon size={24} strokeWidth={2} />
        </div>
      ) : (
        <div className="mx-auto mb-4 h-14 w-14 rounded-[20px] bg-white/45" />
      )}
      <h3 className="text-lg font-semibold text-[#111827]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#6B7280]">{description}</p>
      {actionLabel ? (
        <GlassButton className="mt-5" variant="primary" onClick={onAction}>
          {actionLabel}
        </GlassButton>
      ) : null}
    </div>
  );
}
