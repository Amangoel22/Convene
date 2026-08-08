import { motion } from "framer-motion";
import { cardAnimation } from "@/motion";
import { glassCardVariants } from "@/components/glass/variants";
import { cn } from "@/lib/utils";

export function GlassCard({ className, interactive = false, elevation = "main", padding = "md", children, ...props }) {
  return (
    <motion.section
      className={cn(glassCardVariants({ elevation, padding, interactive }), className)}
      whileHover={interactive ? cardAnimation.whileHover : undefined}
      transition={cardAnimation.transition}
      {...props}
    >
      {children}
    </motion.section>
  );
}
