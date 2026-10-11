// Purpose: InventoryPage implements this source module.
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Boxes, Edit2, PackageCheck, Plus, X, Wrench } from "lucide-react";
import { useState } from "react";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassModal } from "@/components/glass/GlassModal";
import { EmptyState } from "@/components/common/EmptyState";

const initialInventory = [];

import { useEffect } from "react";

function EditItemModal({ open, item, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    totalNeeded: 0,
    available: 0,
    defective: 0
  });
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        totalNeeded: item.totalNeeded || 0,
        available: item.available || 0,
        defective: item.defective || 0
      });
      setEditingName(!item.id);
    }
  }, [item]);

  if (!item && !open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave({
      ...item,
      id: item?.id || `inv-${Date.now()}`,
      name: formData.name.trim(),
      totalNeeded: Number(formData.totalNeeded),
      available: Number(formData.available),
      defective: Number(formData.defective)
    });
    onClose();
  };

  return (
    <GlassModal open={open} className="w-[min(480px,calc(100vw-32px))] max-w-none surface-card-token border border-token rounded-3xl p-6 text-token-primary">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="type-xl weight-bold text-token-primary">{item?.id ? `Edit: ${item.name}` : "Add Inventory Item"}</h2>
          <p className="mt-1 type-xs weight-medium text-token-secondary">Manage required quantities, available stock, and defective units.</p>
        </div>
        <button
          className="flex h-8 w-8 min-h-0 items-center justify-center rounded-full field-token text-token-secondary hover:hover-token hover:text-token-primary"
          onClick={onClose}
          aria-label="Close edit inventory modal"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {editingName || !item?.id ? (
          <div>
            <label className="type-xs weight-semibold text-token-muted">Equipment / Item Name</label>
            <input
              type="text"
              required
              placeholder="e.g. HDMI 2.0 Cables"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 h-10 w-full rounded-full field-token border border-token px-4 type-xs weight-semibold text-token-primary outline-none placeholder:text-token-muted"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-2xl surface-token border border-subtle-token px-4 py-2.5">
            <div>
              <span className="type-10 weight-semibold text-token-muted block">Equipment Name</span>
              <span className="type-xs weight-bold text-token-primary">{formData.name}</span>
            </div>
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="type-xs weight-semibold text-token-accent hover:underline"
            >
              Rename
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="type-xs weight-semibold text-token-muted">Total Needed</label>
            <input
              type="number"
              min={0}
              value={formData.totalNeeded}
              onChange={(e) => setFormData({ ...formData, totalNeeded: e.target.value })}
              className="mt-1 h-10 w-full rounded-full field-token border border-token px-4 type-xs weight-semibold text-token-primary outline-none"
            />
          </div>

          <div>
            <label className="type-xs weight-semibold text-token-muted">Available</label>
            <input
              type="number"
              min={0}
              value={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.value })}
              className="mt-1 h-10 w-full rounded-full field-token border border-token px-4 type-xs weight-semibold text-token-primary outline-none"
            />
          </div>

          <div>
            <label className="type-xs weight-semibold text-token-muted">Defective</label>
            <input
              type="number"
              min={0}
              value={formData.defective}
              onChange={(e) => setFormData({ ...formData, defective: e.target.value })}
              className="mt-1 h-10 w-full rounded-full field-token border border-token px-4 type-xs weight-semibold text-token-primary outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-2">
          <GlassButton type="button" onClick={onClose} className="h-9 type-xs rounded-full">
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" icon={<Edit2 size={15} />} className="h-9 type-xs rounded-full">
            Save Item
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}

import { useAppStore } from "@/store/useAppStore";

export function InventoryPage() {
  const [inventory, setInventory] = useState(initialInventory);
  const [editingItem, setEditingItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const role = useAppStore((state) => state.role);
  const isLead = role === "lead";

  const handleOpenEdit = (item) => {
    if (!isLead) return;
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleOpenAdd = () => {
    if (!isLead) return;
    setEditingItem({ name: "", totalNeeded: 0, available: 0, defective: 0 });
    setModalOpen(true);
  };

  const handleSaveItem = (savedItem) => {
    setInventory((prev) => {
      const exists = prev.some((i) => i.id === savedItem.id);
      if (exists) {
        return prev.map((i) => (i.id === savedItem.id ? savedItem : i));
      }
      return [...prev, savedItem];
    });
  };

  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="type-2xl weight-bold tracking-tight text-token-primary md:type-3xl">Hardware & Asset Inventory</h1>
          <p className="mt-1 type-sm text-token-secondary weight-medium">
            Track physical equipment total requirements, available stock, and defective items.
          </p>
        </div>
        {isLead && (
          <GlassButton variant="primary" icon={<Plus size={16} strokeWidth={2} />} onClick={handleOpenAdd} className="rounded-full">
            Add Equipment
          </GlassButton>
        )}
      </div>

      {inventory.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No hardware inventory added"
          description="Add physical equipment, cables, projectors, and hardware assets required for your event."
          actionLabel={isLead ? "Add Equipment" : undefined}
          onAction={isLead ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {inventory.map((item) => (
            <div key={item.id} className="rounded-3xl surface-card-token border border-token p-6 shadow-token-card flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="type-base weight-bold text-token-primary leading-snug">{item.name}</h3>
                  {isLead && (
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-full field-token text-token-secondary hover:hover-token hover:text-token-primary shrink-0"
                      aria-label={`Edit ${item.name}`}
                    >
                      <Edit2 size={14} strokeWidth={2} />
                    </button>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl surface-token border border-subtle-token p-3 text-center">
                  <div>
                    <span className="type-10 weight-bold uppercase tracking-wider text-token-muted block">Needed</span>
                    <span className="type-sm weight-extrabold text-token-primary block mt-0.5 font-mono">{item.totalNeeded}</span>
                  </div>
                  <div>
                    <span className="type-10 weight-bold uppercase tracking-wider text-token-success block">Available</span>
                    <span className="type-sm weight-extrabold text-token-success block mt-0.5 font-mono">{item.available}</span>
                  </div>
                  <div>
                    <span className="type-10 weight-bold uppercase tracking-wider text-token-error block">Defective</span>
                    <span className="type-sm weight-extrabold text-token-error block mt-0.5 font-mono">{item.defective}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditItemModal
        open={modalOpen}
        item={editingItem}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveItem}
      />
    </div>
  );
}
