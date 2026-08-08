import { GlassCard } from "@/components/ui/GlassCard";
import { ShieldAlert, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export function IssuesPage() {
  const issues = [
    { title: "Main Hall Wi-Fi Speed Drop", priority: "High", status: "In Progress", reporter: "Tech Team" },
    { title: "Lab 3 Projector HDMI Flicker", priority: "Medium", status: "Open", reporter: "Stage Team" },
    { title: "Team 42 Badge Re-print Requested", priority: "Low", status: "Resolved", reporter: "Registration" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-[#111827]">Issue Dispatch</h2>
        <p className="text-sm font-medium text-[#6B7280]">
          Report and track operational incidents during event execution.
        </p>
      </div>

      <div className="space-y-4">
        {issues.map((iss, idx) => (
          <GlassCard key={idx} className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#111827]">{iss.title}</h4>
                <p className="text-xs text-[#9CA3AF]">Reported by {iss.reporter} • Priority: {iss.priority}</p>
              </div>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {iss.status}
            </span>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
