import { motion } from "framer-motion";
import { buttonAnimation } from "@/motion";
import { glassButtonVariants } from "@/components/glass/variants";
import { cn } from "@/lib/utils";

export function GlassButton({ className, icon, children, variant = "secondary", ...props }) {
  return (
    <motion.button
      className={cn(glassButtonVariants({ variant }), className)}
      whileHover={buttonAnimation.whileHover}
      whileTap={buttonAnimation.whileTap}
      transition={buttonAnimation.transition}
      {...props}
    >
      {icon}
      {children}
    </motion.button>
  );
}
