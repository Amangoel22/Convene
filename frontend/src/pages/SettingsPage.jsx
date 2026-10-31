// Purpose: SettingsPage implements this source module.
import { GlassButton } from "@/components/glass/GlassButton";
import { ThemePicker } from "@/components/ui/ThemePicker";
import { PageTitle } from "@/components/ui/PageTitle";
import { isEventComplete } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

export function SettingsPage() {
  const activeEvent = useAppStore((state) => state.activeEvent);
  const eventIsComplete = isEventComplete(activeEvent, new Date());
  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1">
      <div>
        <PageTitle>Workspace Settings</PageTitle>
        <p className="mt-1 type-sm text-token-secondary weight-medium">
          Manage event preferences, access controls, notifications, and integration webhooks.
        </p>
      </div>

      <div className="rounded-3xl surface-card-token border border-token p-6 space-y-6 shadow-token-card">
        <div className="flex items-center justify-between border-b border-subtle-token pb-5">
          <div>
            <h4 className="type-base weight-bold text-token-primary">Event Name & Branding</h4>
            <p className="mt-0.5 type-xs weight-medium text-token-muted">Configure event title, logo, and workspace details.</p>
          </div>
          {!eventIsComplete && <GlassButton variant="primary" className="rounded-full type-xs">Edit Details</GlassButton>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle-token pb-5">
          <div>
            <h4 className="type-base weight-bold text-token-primary">Workspace appearance</h4>
            <p className="mt-0.5 type-xs weight-medium text-token-muted">Choose the color tone that feels right for your command center.</p>
          </div>
          <ThemePicker />
        </div>

        <div className="flex items-center justify-between border-b border-subtle-token pb-5">
          <div>
            <h4 className="type-base weight-bold text-token-primary">Notification Alerts</h4>
            <p className="mt-0.5 type-xs weight-medium text-token-muted">Receive high-priority incident SMS and browser notifications.</p>
          </div>
          <GlassButton variant="secondary" className="rounded-full type-xs">Manage</GlassButton>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="type-base weight-bold text-token-primary">API & Webhook Integrations</h4>
            <p className="mt-0.5 type-xs weight-medium text-token-muted">Export live telemetry & sync check-in webhooks.</p>
          </div>
          <GlassButton variant="secondary" className="rounded-full type-xs">Configure</GlassButton>
        </div>
      </div>
    </div>
  );
}
