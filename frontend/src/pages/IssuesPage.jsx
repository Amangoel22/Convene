import { AlertCircle } from "lucide-react";

export function IssuesPage() {
  const issues = [
    { title: "Main Hall Wi-Fi Speed Drop", priority: "High", status: "In Progress", reporter: "Tech Team" },
    { title: "Lab 3 Projector HDMI Flicker", priority: "Medium", status: "Open", reporter: "Stage Team" },
    { title: "Team 42 Badge Re-print Requested", priority: "Low", status: "Resolved", reporter: "Registration" }
  ];

  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1D23] md:text-3xl">Issue Dispatch</h1>
        <p className="mt-1 text-sm text-[#5A6577] font-medium">
          Report and track operational incidents during event execution.
        </p>
      </div>

      <div className="space-y-3">
        {issues.map((iss, idx) => (
          <div key={idx} className="flex items-center justify-between rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] p-4.5 transition-colors hover:bg-[#F7F8FA] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#D6453D]/10 text-[#D6453D]">
                <AlertCircle size={20} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#1A1D23] truncate">{iss.title}</h4>
                <p className="text-xs font-medium text-[#8E99A8] mt-0.5">Reported by {iss.reporter} • Priority: {iss.priority}</p>
              </div>
            </div>
            <span className="rounded-full bg-[#F0F2F5] px-3 py-1 text-xs font-bold text-[#1A1D23] shrink-0 border border-[rgba(0,0,0,0.08)]">
              {iss.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
