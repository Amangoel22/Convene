// Purpose: ContentContainer implements this source module.
import { cn } from "@/lib/utils";

// Constrains page content to the shared application width.
export function ContentContainer({ className, children }) {
  return (
    <div className={cn("app-content-container space-y-6", className)}>
      {children}
    </div>
  );
}
