import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function GlassTooltip({ className, children, ...props }) {
  return (
    <motion.div
      className={cn("glass-surface rounded-xl px-3 py-2 text-xs font-semibold text-[#111827]", className)}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
