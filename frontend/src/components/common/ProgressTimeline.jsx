// Purpose: ProgressTimeline implements this source module.
import { motion } from "framer-motion";

export function ProgressTimeline({ progress, stages }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="type-sm weight-semibold text-token-primary">Run of Show Progress</p>
        <p className="type-sm weight-semibold text-token-secondary">{progress}% complete</p>
      </div>
      <div className="relative h-2 rounded-full surface-card-token/55">
        <motion.div
          className="h-2 rounded-full bg-token-gold"
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
                  ? "gold-glow rounded-xl border border-token-gold/60 bg-token-gold/24 px-2.5 py-1.5 shadow-token-inset"
                  : "rounded-xl border border-token-inverse/45 surface-card-token/30 px-2.5 py-1.5"
              }
            >
              <p className="truncate type-xs weight-semibold text-token-primary">{stage.label}</p>
              <p className="mt-0.5 type-11 weight-medium capitalize text-token-secondary">{stage.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
