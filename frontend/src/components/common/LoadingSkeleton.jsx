import { cn } from "@/lib/utils";

export function LoadingSkeleton({ className }) {
  return <div className={cn("rounded-2xl bg-white/45", className)} />;
}
