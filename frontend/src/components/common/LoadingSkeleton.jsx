// Purpose: LoadingSkeleton preserves content space while data is loading.
import { cn } from "@/lib/utils";

// Purpose: render an accessible animated loading buffer with the requested shape.
export function LoadingSkeleton({ className }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      className={cn("loading-skeleton rounded-2xl", className)}
    />
  );
}
