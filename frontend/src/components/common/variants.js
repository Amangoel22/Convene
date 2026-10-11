// Purpose: variants implements this source module.
import { cva } from "class-variance-authority";

export const badgeVariants = cva("inline-flex whitespace-nowrap min-h-6 items-center rounded-full border px-2.5 type-xs weight-semibold", {
  variants: {
    tone: {
      gold: "border-token-gold/50 bg-token-gold/20 text-token-gold",
      info: "border-token-info/35 bg-token-info/18 text-token-info",
      success: "border-token-success/35 bg-token-success/18 text-token-success-light",
      warning: "border-token-warning/35 bg-token-warning/18 text-token-warning",
      error: "border-token-error/35 bg-token-error/18 text-token-error",
      neutral: "border-token-inverse/20 surface-card-token/10 text-token-inverse-muted"
    }
  },
  defaultVariants: {
    tone: "neutral"
  }
});
