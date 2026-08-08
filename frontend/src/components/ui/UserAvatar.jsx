import { cn } from "@/lib/utils";

export function UserAvatar({ initials, image, className }) {
  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/60 bg-white/60 text-sm font-bold text-[#111827] shadow-sm",
        className
      )}
    >
      {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : initials}
    </span>
  );
}
