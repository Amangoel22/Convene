import { FileText, Download } from "lucide-react";

export function ResourcesPage() {
  const docs = [
    { title: "Event Operating Procedure (SOP)", size: "2.4 MB", type: "PDF" },
    { title: "Sponsor Brand Asset Pack 2026", size: "48 MB", type: "ZIP" },
    { title: "Participant Welcome Kit Template", size: "1.8 MB", type: "DOCX" },
    { title: "Judges Scoring Rubric & Guide", size: "850 KB", type: "PDF" }
  ];

  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1D23] md:text-3xl">Resource Vault</h1>
        <p className="mt-1 text-sm text-[#5A6577] font-medium">
          Shared repository for event documents, rulebooks, logos, and digital assets.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {docs.map((doc) => (
          <div key={doc.title} className="flex items-center justify-between rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-5 transition-colors hover:bg-[#F7F8FA] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EBF0FA] text-[#3B6FD4]">
                <FileText size={20} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#1A1D23] truncate">{doc.title}</h4>
                <p className="text-xs font-medium text-[#8E99A8] mt-0.5">{doc.type} • {doc.size}</p>
              </div>
            </div>
            <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23]" aria-label={`Download ${doc.title}`}>
              <Download size={16} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
