import { cva } from "class-variance-authority";

export const badgeVariants = cva("inline-flex whitespace-nowrap min-h-6 items-center rounded-full border px-2.5 text-xs font-semibold", {
  variants: {
    tone: {
      gold: "border-[#F6C445]/50 bg-[#F6C445]/20 text-[#f6c445]",
      info: "border-[#007AFF]/35 bg-[#007AFF]/18 text-[#38bdf8]",
      success: "border-[#34C759]/35 bg-[#34C759]/18 text-[#4ade80]",
      warning: "border-[#FF9F0A]/35 bg-[#FF9F0A]/18 text-[#fbbf24]",
      error: "border-[#FF453A]/35 bg-[#FF453A]/18 text-[#f87171]",
      neutral: "border-white/20 bg-white/10 text-[#cbd5e1]"
    }
  },
  defaultVariants: {
    tone: "neutral"
  }
});
