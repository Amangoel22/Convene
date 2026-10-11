// Purpose: GlassDropdown implements this source module.
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function GlassDropdown({ className, children, ...props }) {
  return (
    <motion.div
      className={cn("glass-surface rounded-[20px] p-2 shadow-token-dropdown", className)}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
