import { badgeVariants } from "@/components/common/variants";
import { cn } from "@/lib/utils";

export function Badge({ children, tone = "neutral", className }) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>;
}
