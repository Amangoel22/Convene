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
  "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B6FD4] disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[#3B6FD4] text-white hover:bg-[#2F5BB8] border border-[#3B6FD4] shadow-sm",
        secondary: "bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23] border border-[rgba(0,0,0,0.08)]",
        info: "bg-[#3B6FD4] text-white hover:bg-[#2F5BB8]",
        success: "bg-[#22A65E] text-white hover:bg-[#1B8F50] font-bold",
        ghost: "bg-transparent text-[#5A6577] hover:bg-[#F0F2F5] hover:text-[#1A1D23]"
      }
    },
    defaultVariants: {
      variant: "secondary"
    }
  }
);
