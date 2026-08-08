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
  "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A7FA7]",
  {
    variants: {
      variant: {
        primary: "bg-[#1A3D63] text-[#F1F5FB] hover:bg-[#172B4D]",
        secondary: "bg-[#E5EEF7] text-[#172B4D] hover:bg-[#D0DFEC]",
        info: "bg-[#B9DDF5] text-[#0B3555] hover:bg-[#9ACBEB]",
        success: "bg-[#2E7D5B] text-[#F1F5FB] hover:bg-[#25664A]",
        ghost: "bg-transparent text-[#52657A] hover:bg-[#E3EDF5] hover:text-[#172B4D]"
      }
    },
    defaultVariants: {
      variant: "secondary"
    }
  }
);
