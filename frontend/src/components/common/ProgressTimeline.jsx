import { motion } from "framer-motion";

export function ProgressTimeline({ progress, stages }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-[#111827]">Run of Show Progress</p>
        <p className="text-sm font-semibold text-[#6B7280]">{progress}% complete</p>
      </div>
      <div className="relative h-2 rounded-full bg-white/55">
        <motion.div
          className="h-2 rounded-full bg-[#F6C445]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        {stages.map((stage) => (
          <div key={stage.label} className="min-w-0">
            <div
              className={
                stage.status === "current"
                  ? "gold-glow rounded-xl border border-[#F6C445]/60 bg-[#F6C445]/24 px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
                  : "rounded-xl border border-white/45 bg-white/30 px-2.5 py-1.5"
              }
            >
              <p className="truncate text-xs font-semibold text-[#111827]">{stage.label}</p>
              <p className="mt-0.5 text-[11px] font-medium capitalize text-[#6B7280]">{stage.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
