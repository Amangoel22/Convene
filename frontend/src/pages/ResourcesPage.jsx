import { GlassCard } from "@/components/ui/GlassCard";
import { Library, FileText, Download, FolderArchive } from "lucide-react";

export function ResourcesPage() {
  const docs = [
    { title: "Event Operating Procedure (SOP)", size: "2.4 MB", type: "PDF" },
    { title: "Sponsor Brand Asset Pack 2026", size: "48 MB", type: "ZIP" },
    { title: "Participant Welcome Kit Template", size: "1.8 MB", type: "DOCX" },
    { title: "Judges Scoring Rubric & Guide", size: "850 KB", type: "PDF" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-[#111827]">Resource Vault</h2>
        <p className="text-sm font-medium text-[#6B7280]">
          Shared repository for event documents, rulebooks, logos, and digital assets.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {docs.map((doc) => (
          <GlassCard key={doc.title} className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#111827]">{doc.title}</h4>
                <p className="text-xs text-[#9CA3AF]">{doc.type} • {doc.size}</p>
              </div>
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-[#111827] hover:bg-gray-200">
              <Download size={16} />
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
