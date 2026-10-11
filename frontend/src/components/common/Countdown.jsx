// Purpose: Countdown implements this source module.
import { motion } from "framer-motion";

export function Countdown({ label, value, description }) {
  return (
    <motion.div
      className="glass-surface min-w-[210px] rounded-[18px] border-token-inverse/60 px-4 py-3.5 shadow-token-float"
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ type: "spring", stiffness: 320, damping: 25 }}
    >
      <p className="type-xs weight-semibold text-token-secondary">{label}</p>
      <p className="mt-1 type-2xl weight-bold tabular-nums text-token-primary">{value}</p>
      <p className="mt-0.5 type-xs weight-medium text-token-muted">{description}</p>
    </motion.div>
  );
}
