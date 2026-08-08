import { motion } from "framer-motion";
import { sidebarAnimation } from "@/motion";
import { cn } from "@/lib/utils";

export function GlassSidebar({ className, expanded, children, ...props }) {
  return (
    <aside
      className={cn("sticky top-4 hidden h-[calc(100vh-32px)] w-60 shrink-0 overflow-y-auto bg-[#F1F5FB] py-2 px-1 lg:flex lg:flex-col", className)}
      aria-label="Primary navigation"
      {...props}
    >
      {children}
    </aside>
  );
}
