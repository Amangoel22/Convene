import { GlassButton } from "@/components/glass/GlassButton";

export function SettingsPage() {
  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1D23] md:text-3xl">Workspace Settings</h1>
        <p className="mt-1 text-sm text-[#5A6577] font-medium">
          Manage event preferences, access controls, notifications, and integration webhooks.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] p-6 space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.06)] pb-5">
          <div>
            <h4 className="text-base font-bold text-[#1A1D23]">Event Name & Branding</h4>
            <p className="mt-0.5 text-xs font-medium text-[#8E99A8]">Configure event title, logo, and theme accent colors.</p>
          </div>
          <GlassButton variant="primary" className="rounded-full text-xs">Edit Details</GlassButton>
        </div>

        <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.06)] pb-5">
          <div>
            <h4 className="text-base font-bold text-[#1A1D23]">Notification Alerts</h4>
            <p className="mt-0.5 text-xs font-medium text-[#8E99A8]">Receive high-priority incident SMS and browser notifications.</p>
          </div>
          <GlassButton variant="secondary" className="rounded-full text-xs">Manage</GlassButton>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-[#1A1D23]">API & Webhook Integrations</h4>
            <p className="mt-0.5 text-xs font-medium text-[#8E99A8]">Export live telemetry & sync check-in webhooks.</p>
          </div>
          <GlassButton variant="secondary" className="rounded-full text-xs">Configure</GlassButton>
        </div>
      </div>
    </div>
  );
}
