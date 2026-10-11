// Purpose: ResourcesPage implements this source module.
import { useState } from "react";
import { FileText, Download, Library, Upload, Plus, X } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassModal } from "@/components/glass/GlassModal";
import { useAppStore } from "@/store/useAppStore";

export function ResourcesPage() {
  const [docs, setDocs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("PDF");

  const role = useAppStore((state) => state.role);
  const isLead = role === "lead";

  const handleUpload = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setDocs((prev) => [
      { title: title.trim(), size: "1.2 MB", type },
      ...prev
    ]);
    setTitle("");
    setModalOpen(false);
  };

  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="type-2xl weight-bold tracking-tight text-token-primary md:type-3xl">Resource Vault</h1>
          <p className="mt-1 type-sm text-token-secondary weight-medium">
            Shared repository for event documents, rulebooks, logos, and digital assets.
          </p>
        </div>
        {isLead && (
          <GlassButton
            variant="primary"
            icon={<Upload size={16} strokeWidth={2} />}
            onClick={() => setModalOpen(true)}
            className="rounded-full"
          >
            Upload Resource
          </GlassButton>
        )}
      </div>

      {docs.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No documents uploaded"
          description="Upload event operating rulebooks, sponsor brand asset packs, or judging guides for organizing members."
          actionLabel={isLead ? "Upload Resource" : undefined}
          onAction={isLead ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {docs.map((doc) => (
            <div key={doc.title} className="flex items-center justify-between rounded-3xl surface-card-token border border-token p-5 transition-colors hover-surface-token shadow-token-card">
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl accent-surface-token text-token-accent">
                  <FileText size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h4 className="type-sm weight-bold text-token-primary truncate">{doc.title}</h4>
                  <p className="type-xs weight-medium text-token-muted mt-0.5">{doc.type} • {doc.size}</p>
                </div>
              </div>
              <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full field-token text-token-secondary hover:hover-token hover:text-token-primary" aria-label={`Download ${doc.title}`}>
                <Download size={16} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Resource Modal for Lead / Organizer */}
      <GlassModal open={modalOpen} onClose={() => setModalOpen(false)} title="Upload Resource Document">
        <form onSubmit={handleUpload} className="space-y-4 pt-1">
          <div>
            <label className="type-xs weight-semibold text-token-muted">Document Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Event Operating Rulebook 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 h-10 w-full rounded-full field-token border border-token px-4 type-xs weight-semibold text-token-primary outline-none"
            />
          </div>

          <div>
            <label className="type-xs weight-semibold text-token-muted">Format / Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 h-10 w-full rounded-full field-token border border-token px-4 type-xs weight-semibold text-token-primary outline-none"
            >
              <option value="PDF">PDF Document</option>
              <option value="ZIP">ZIP Asset Pack</option>
              <option value="DOCX">Word Document (DOCX)</option>
              <option value="PNG">Image / Map (PNG)</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <GlassButton type="button" onClick={() => setModalOpen(false)} className="h-9 type-xs rounded-full">
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" icon={<Upload size={15} />} className="h-9 type-xs rounded-full">
              Upload Document
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
