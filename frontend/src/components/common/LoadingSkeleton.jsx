// Purpose: LoadingSkeleton implements this source module.
import { cn } from "@/lib/utils";

export function LoadingSkeleton({ className }) {
  return <div className={cn("rounded-2xl surface-card-token/45", className)} />;
}
