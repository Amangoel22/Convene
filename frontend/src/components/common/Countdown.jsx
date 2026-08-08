import { motion } from "framer-motion";

export function Countdown({ label, value, description }) {
  return (
    <motion.div
      className="glass-surface min-w-[210px] rounded-[18px] border-white/60 px-4 py-3.5 shadow-[0_10px_28px_rgba(31,41,55,0.08)]"
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ type: "spring", stiffness: 320, damping: 25 }}
    >
      <p className="text-xs font-semibold text-[#6B7280]">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-[#111827]">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-[#9CA3AF]">{description}</p>
    </motion.div>
  );
}
