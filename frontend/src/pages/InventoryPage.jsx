import { GlassCard } from "@/components/ui/GlassCard";
import { Boxes, PackageCheck, PackageOpen, AlertTriangle } from "lucide-react";

export function InventoryPage() {
  const items = [
    { name: "HDMI 2.0 Cables (10m)", total: 25, checkedOut: 18, available: 7 },
    { name: "Extension Power Strip 6-Socket", total: 40, checkedOut: 32, available: 8 },
    { name: "4K Laser Projector", total: 6, checkedOut: 5, available: 1 },
    { name: "Wireless Lapel Microphones", total: 12, checkedOut: 8, available: 4 },
    { name: "Walkie-Talkie Sets", total: 20, checkedOut: 20, available: 0 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-[#111827]">Hardware & Asset Inventory</h2>
        <p className="text-sm font-medium text-[#6B7280]">
          Track physical equipment allocation, check-outs, and returns.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <GlassCard key={item.name} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
                <Boxes size={20} />
              </div>
              {item.available === 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                  <AlertTriangle size={12} /> Out of Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  <PackageCheck size={12} /> {item.available} Available
                </span>
              )}
            </div>
            <h3 className="mt-4 text-lg font-bold text-[#111827]">{item.name}</h3>
            <div className="mt-2 flex items-center justify-between text-xs text-[#6B7280]">
              <span>Issued: {item.checkedOut}</span>
              <span>Total: {item.total}</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
