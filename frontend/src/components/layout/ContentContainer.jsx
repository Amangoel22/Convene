// Purpose: ContentContainer implements this source module.
import { cn } from "@/lib/utils";

export function ContentContainer({ className, children }) {
  return <div className={cn("app-content-container space-y-6", className)}>{children}</div>;
}
