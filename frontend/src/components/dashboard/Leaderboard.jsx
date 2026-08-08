import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { leaderboard } from "@/data/dashboard";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/glass/GlassCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { UserAvatar } from "@/components/ui/UserAvatar";

export function Leaderboard() {
  return (
    <GlassCard elevation="main" className="h-full">
      <div className="mb-5 flex items-center justify-between gap-4">
        <SectionHeader title="Top Organizers" description="Maximum five shown" className="mb-0" />
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F6C445]/20 text-[#7a5a00]">
          <Trophy size={21} strokeWidth={1.75} />
        </div>
      </div>
      <div className="space-y-3">
        {leaderboard.map((member, index) => (
          <motion.div
            key={member.name}
            className="flex items-center gap-3 rounded-[20px] border border-white/45 bg-white/35 p-3 transition-colors hover:border-white/70 hover:bg-white/55"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, scale: 1.005, boxShadow: "0 10px 28px rgba(31,41,55,0.06)" }}
            transition={{ delay: index * 0.04, type: "spring", stiffness: 260, damping: 24 }}
          >
            <span className="w-5 text-center text-sm font-bold text-[#9CA3AF]">{index + 1}</span>
            <UserAvatar initials={member.initials} image={member.avatar} className="h-10 w-10 text-xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#111827]">{member.name}</p>
              <p className="truncate text-xs font-medium text-[#9CA3AF]">{member.reliability} reliability</p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold tabular-nums text-[#111827]">{member.xp}</p>
              <p className="text-xs font-medium text-[#9CA3AF]">XP</p>
            </div>
            <Badge tone={index === 0 ? "gold" : "neutral"} className="hidden xl:inline-flex">
              {member.badge}
            </Badge>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
