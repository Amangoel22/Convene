import { UserAvatar } from "@/components/ui/UserAvatar";

export function AvatarGroup({ users = [], max = 4 }) {
  return (
    <div className="flex -space-x-2">
      {users.slice(0, max).map((user) => (
        <UserAvatar key={user.name ?? user.initials} initials={user.initials} image={user.avatar} className="h-8 w-8 border-2 text-[10px]" />
      ))}
    </div>
  );
}
