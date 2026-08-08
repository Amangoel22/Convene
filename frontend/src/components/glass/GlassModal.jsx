import { AnimatePresence, motion } from "framer-motion";
import { modalAnimation } from "@/motion";
import { cn } from "@/lib/utils";

export function GlassModal({ open, className, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 grid place-items-center bg-white/20 p-6 backdrop-blur-sm" {...modalAnimation}>
          <div className={cn("glass-surface max-w-lg rounded-[32px] p-6", className)}>{children}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
