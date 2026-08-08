import { GlassCard } from "@/components/ui/GlassCard";
import { Settings, Sliders, Shield, Bell } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-[#111827]">Workspace Settings</h2>
        <p className="text-sm font-medium text-[#6B7280]">
          Manage event preferences, access controls, notifications, and integration webhooks.
        </p>
      </div>

      <GlassCard className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h4 className="text-base font-bold text-[#111827]">Event Name & Branding</h4>
              <p className="text-xs text-[#9CA3AF]">Configure event title, logo, and theme accent colors.</p>
            </div>
            <button className="rounded-xl bg-[#111827] px-4 py-2 text-xs font-semibold text-white">Edit Details</button>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h4 className="text-base font-bold text-[#111827]">Notification Alerts</h4>
              <p className="text-xs text-[#9CA3AF]">Receive high-priority incident SMS and browser notifications.</p>
            </div>
            <button className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-[#111827]">Manage</button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
