import { quickActions } from "@/data/dashboard";
import { GlassCard } from "@/components/glass/GlassCard";
import { QuickActionButton } from "@/components/common/QuickActionButton";
import { SectionHeader } from "@/components/common/SectionHeader";

export function QuickActions() {
  return (
    <GlassCard elevation="main">
      <SectionHeader title="Quick Actions" description="Common operational moves" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action, index) => (
          <QuickActionButton key={action.label} action={action} primary={index === 0} />
        ))}
      </div>
    </GlassCard>
  );
}
