import { cn } from "@/lib/utils";

export function GlassNavbar({ className, scrolled = false, children, ...props }) {
  return (
    <div className={cn("glass-navbar flex min-h-[72px] items-center gap-4 rounded-[26px] px-5 py-3 transition-all duration-250 md:px-7", scrolled && "is-scrolled", className)} {...props}>
      {children}
    </div>
  );
}
