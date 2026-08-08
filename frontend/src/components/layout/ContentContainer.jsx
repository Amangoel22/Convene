import { cn } from "@/lib/utils";

export function ContentContainer({ className, children }) {
  return <div className={cn("space-y-6", className)}>{children}</div>;
}
