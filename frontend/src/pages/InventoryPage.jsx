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
    <GlassModal open={open} className="w-[min(480px,calc(100vw-32px))] max-w-none bg-white border border-[rgba(0,0,0,0.08)] rounded-3xl p-6 text-[#1A1D23]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1A1D23]">{item?.id ? `Edit: ${item.name}` : "Add Inventory Item"}</h2>
          <p className="mt-1 text-xs font-medium text-[#5A6577]">Manage required quantities, available stock, and defective units.</p>
        </div>
        <button
          className="flex h-8 w-8 min-h-0 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23]"
          onClick={onClose}
          aria-label="Close edit inventory modal"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {editingName || !item?.id ? (
          <div>
            <label className="text-xs font-semibold text-[#8E99A8]">Equipment / Item Name</label>
            <input
              type="text"
              required
              placeholder="e.g. HDMI 2.0 Cables"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 h-10 w-full rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-4 text-xs font-semibold text-[#1A1D23] outline-none placeholder:text-[#8E99A8]"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] px-4 py-2.5">
            <div>
              <span className="text-[10px] font-semibold text-[#8E99A8] block">Equipment Name</span>
              <span className="text-xs font-bold text-[#1A1D23]">{formData.name}</span>
            </div>
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="text-xs font-semibold text-[#3B6FD4] hover:underline"
            >
              Rename
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#8E99A8]">Total Needed</label>
            <input
              type="number"
              min={0}
              value={formData.totalNeeded}
              onChange={(e) => setFormData({ ...formData, totalNeeded: e.target.value })}
              className="mt-1 h-10 w-full rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-4 text-xs font-semibold text-[#1A1D23] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8E99A8]">Available</label>
            <input
              type="number"
              min={0}
              value={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.value })}
              className="mt-1 h-10 w-full rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-4 text-xs font-semibold text-[#1A1D23] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8E99A8]">Defective</label>
            <input
              type="number"
              min={0}
              value={formData.defective}
              onChange={(e) => setFormData({ ...formData, defective: e.target.value })}
              className="mt-1 h-10 w-full rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-4 text-xs font-semibold text-[#1A1D23] outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-2">
          <GlassButton type="button" onClick={onClose} className="h-9 text-xs rounded-full">
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" icon={<Edit2 size={15} />} className="h-9 text-xs rounded-full">
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
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1D23] md:text-3xl">Hardware & Asset Inventory</h1>
          <p className="mt-1 text-sm text-[#5A6577] font-medium">
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
            <div key={item.id} className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-[#1A1D23] leading-snug">{item.name}</h3>
                  {isLead && (
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F2F5] text-[#5A6577] hover:bg-[#E8ECF1] hover:text-[#1A1D23] shrink-0"
                      aria-label={`Edit ${item.name}`}
                    >
                      <Edit2 size={14} strokeWidth={2} />
                    </button>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-[#F7F8FA] border border-[rgba(0,0,0,0.06)] p-3 text-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E99A8] block">Needed</span>
                    <span className="text-sm font-extrabold text-[#1A1D23] block mt-0.5 font-mono">{item.totalNeeded}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#22A65E] block">Available</span>
                    <span className="text-sm font-extrabold text-[#22A65E] block mt-0.5 font-mono">{item.available}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D6453D] block">Defective</span>
                    <span className="text-sm font-extrabold text-[#D6453D] block mt-0.5 font-mono">{item.defective}</span>
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
