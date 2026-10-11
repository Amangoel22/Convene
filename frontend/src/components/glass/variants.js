// Purpose: variants implements this source module.
import { cva } from "class-variance-authority";

export const glassCardVariants = cva("glass-surface rounded-[20px]", {
  variants: {
    elevation: {
      hero: "glass-elevation-hero",
      main: "glass-elevation-main",
      metric: "glass-elevation-metric"
    },
    padding: {
      none: "p-0",
      sm: "p-5",
      md: "p-6",
      lg: "p-8"
    },
    interactive: {
      true: "cursor-pointer",
      false: ""
    }
  },
  defaultVariants: {
    elevation: "main",
    padding: "md",
    interactive: false
  }
});

export const glassButtonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 type-xs weight-semibold transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B6FD4] disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-token-accent text-token-inverse hover:bg-token-accent-dark border border-token-accent shadow-sm",
        secondary: "field-token text-token-secondary hover:hover-token hover:text-token-primary border border-token",
        info: "bg-token-accent text-token-inverse hover:bg-token-accent-dark",
        success: "bg-token-success text-token-inverse hover:bg-token-success-dark weight-bold",
        ghost: "bg-transparent text-token-secondary hover:field-token hover:text-token-primary"
      }
    },
    defaultVariants: {
      variant: "secondary"
    }
  }
);
