// Purpose: ResourcesPage implements this source module.
import { useEffect, useRef, useState } from "react";
import { FileText, Download, Library, Upload } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassModal } from "@/components/glass/GlassModal";
import { useAppStore } from "@/store/useAppStore";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ".pdf,.jpg,.jpeg,.png,.csv,.xls,.xlsx";

export function ResourcesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("PDF");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const role = useAppStore((state) => state.role);
  const isLead = role === "lead";
  const token = useAppStore((state) => state.token);
  const activeEvent = useAppStore((state) => state.activeEvent);

  // Purpose: load persisted event resources whenever the active event changes.
  useEffect(() => {
    if (!activeEvent?.id || !token) {
      setResources([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/events/${activeEvent.id}/resources`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok)
          throw new Error(payload.error || "Failed to load resources.");
        return payload;
      })
      .then((payload) => setResources(payload.resources || []))
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [activeEvent?.id, token]);

  // Purpose: validate the selected file and persist it through the backend.
  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError("");
    if (!file) {
      setUploadError("Select a file to upload.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File size must be 5 MB or less.");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    form.append("title", title.trim() || file.name);
    form.append("category", type);
    setUploading(true);
    try {
      const response = await fetch(
        `${API_BASE}/events/${activeEvent.id}/resources`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          [payload.error, payload.details].filter(Boolean).join(" ") ||
            "Failed to upload resource.",
        );
      }
      setResources((prev) => [payload.resource, ...prev]);
      setTitle("");
      setFile(null);
      setError("");
      setModalOpen(false);
    } catch (uploadFailure) {
      setUploadError(uploadFailure.message || "Failed to upload resource.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="type-2xl weight-bold tracking-tight text-token-primary md:type-3xl">
            Resource Vault
          </h1>
          <p className="mt-1 type-sm text-token-secondary weight-medium">
            Shared repository for event documents, rulebooks, logos, and digital
            assets.
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

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-token-error/20 bg-token-error/10 px-4 py-3 type-xs weight-semibold text-token-error"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-24 rounded-3xl" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No documents uploaded"
          description="Upload event operating rulebooks, sponsor brand asset packs, or judging guides for organizing members."
          actionLabel={isLead ? "Upload Resource" : undefined}
          onAction={isLead ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {resources.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-3xl surface-card-token border border-token p-5 transition-colors hover-surface-token shadow-token-card"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl accent-surface-token text-token-accent">
                  <FileText size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h4 className="type-sm weight-bold text-token-primary truncate">
                    {doc.title}
                  </h4>
                  <p className="type-xs weight-medium text-token-muted mt-0.5">
                    {doc.fileType?.split("/").pop()?.toUpperCase()} •{" "}
                    {(Number(doc.fileSizeBytes || 0) / 1024 / 1024).toFixed(2)}{" "}
                    MB
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  doc.downloadUrl &&
                  window.open(doc.downloadUrl, "_blank", "noopener,noreferrer")
                }
                disabled={!doc.downloadUrl}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full field-token text-token-secondary hover:hover-token hover:text-token-primary disabled:opacity-50"
                aria-label={`Download ${doc.title}`}
              >
                <Download size={16} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Resource Modal for Lead / Organizer */}
      <GlassModal
        open={modalOpen}
        onClose={() => {
          if (!uploading) {
            setUploadError("");
            setModalOpen(false);
          }
        }}
        title="Upload Resource Document"
      >
        <form onSubmit={handleUpload} className="space-y-4 pt-1">
          {uploadError && (
            <div
              role="alert"
              className="rounded-2xl border border-token-error/20 bg-token-error/10 px-4 py-3 type-xs weight-semibold text-token-error"
            >
              {uploadError}
            </div>
          )}
          <div>
            <label className="type-xs weight-semibold text-token-muted">
              Document Title
            </label>
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
            <label className="type-xs weight-semibold text-token-muted">
              Format / Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 h-10 w-full rounded-full field-token border border-token px-4 type-xs weight-semibold text-token-primary outline-none"
            >
              <option value="PDF">PDF Document</option>
              <option value="IMAGE">Image (JPG / PNG)</option>
              <option value="CSV">CSV Spreadsheet</option>
              <option value="EXCEL">Excel Spreadsheet (XLS / XLSX)</option>
            </select>
          </div>

          <div>
            <label className="type-xs weight-semibold text-token-muted">
              File
            </label>
            <div className="mt-1 flex items-center gap-3">
              <input
                id="resource-file"
                type="file"
                required
                accept={ACCEPTED_FILE_TYPES}
                ref={fileInputRef}
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null);
                  setError("");
                }}
                className="sr-only"
              />
              {file ? (
                <div className="flex min-w-0 items-center gap-2 rounded-full field-token border border-token px-4 py-2">
                  <span className="min-w-0 truncate type-xs weight-semibold text-token-primary">{file.name}</span>
                  <button type="button" className="shrink-0 type-11 weight-bold text-token-error hover:underline" onClick={() => { setFile(null); fileInputRef.current.value = ""; }}>Remove</button>
                </div>
              ) : (
                <label htmlFor="resource-file" className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full field-token border border-token px-4 type-xs weight-bold text-token-primary transition-colors hover:hover-token">
                  <Upload size={15} />
                  Choose file
                </label>
              )}
            </div>
            <p className="mt-1 type-11 text-token-muted">
              PDF, JPG, PNG, CSV, XLS, or XLSX · maximum 5 MB
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <GlassButton
              type="button"
              disabled={uploading}
              onClick={() => {
                setUploadError("");
                setModalOpen(false);
              }}
              className="h-9 type-xs rounded-full"
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              disabled={uploading}
              icon={<Upload size={15} />}
              className="h-9 type-xs rounded-full"
            >
              {uploading ? "Uploading…" : "Upload Document"}
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
