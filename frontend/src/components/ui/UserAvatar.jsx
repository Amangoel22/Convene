// Purpose: UserAvatar implements this source module.
import { cn } from "@/lib/utils";

export function UserAvatar({ initials, image, className }) {
  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-token-inverse/60 surface-card-token/60 type-sm weight-bold text-token-primary shadow-sm",
        className
      )}
    >
      {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : initials}
    </span>
  );
}
