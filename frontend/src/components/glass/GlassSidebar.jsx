// Purpose: GlassSidebar implements this source module.
import { cn } from "@/lib/utils";

export function GlassSidebar({ className, expanded, children, ...props }) {
  return (
    <aside
      className={cn("sticky top-4 hidden h-[calc(100vh-32px)] w-60 shrink-0 overflow-y-auto surface-card-token border-r border-token py-2 px-1 lg:flex lg:flex-col", className)}
      aria-label="Primary navigation"
      {...props}
    >
      {children}
    </aside>
  );
}
