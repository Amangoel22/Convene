// Purpose: PageTransition implements this source module.
import { motion } from "framer-motion";
import { pageTransition } from "@/motion";

export function PageTransition({ children }) {
  return (
    <motion.main key="mission-control" className="pb-8" {...pageTransition}>
      {children}
    </motion.main>
  );
}
