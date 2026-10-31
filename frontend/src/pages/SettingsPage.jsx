// Purpose: SettingsPage implements this source module.
import { PageTitle } from "@/components/ui/PageTitle";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState } from "react";

// Reads a saved local preference without allowing malformed values through.
function readPreference(key, fallback) {
  if (typeof window === "undefined") return fallback;
  const value = window.localStorage.getItem(key);
  return value === null ? fallback : value;
}

// Persists lightweight interface preferences on this device.
function savePreference(key, value) {
  window.localStorage.setItem(key, String(value));
}

export function SettingsPage() {
  const [notifications, setNotifications] = useState(() => readPreference("convene_notifications", "true") === "true");
  const [reducedMotion, setReducedMotion] = useState(() => readPreference("convene_reduced_motion", "false") === "true");
  const [density, setDensity] = useState(() => readPreference("convene_density", "comfortable"));
  const [timeFormat, setTimeFormat] = useState(() => readPreference("convene_time_format", "12h"));

  useEffect(() => {
    document.documentElement.dataset.conveneDensity = density;
    document.documentElement.dataset.conveneReducedMotion = reducedMotion ? "true" : "false";
    savePreference("convene_density", density);
    savePreference("convene_reduced_motion", reducedMotion);
  }, [density, reducedMotion]);

  // Updates a local notification preference without changing event data.
  function updateNotifications(value) {
    setNotifications(value);
    savePreference("convene_notifications", value);
  }

  // Updates a local time-format preference without changing event data.
  function updateTimeFormat(value) {
    setTimeFormat(value);
    savePreference("convene_time_format", value);
  }

  return (
    <div className="space-y-8 w-full max-w-[1360px] mx-auto pb-16 pt-1">
      <div>
        <PageTitle>Workspace Settings</PageTitle>
        <p className="mt-1 type-sm text-token-secondary weight-medium">
          Tune the command center to match how you and your team work.
        </p>
      </div>

      <div className="rounded-3xl surface-card-token border border-token p-6 space-y-6 shadow-token-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle-token pb-5">
          <div>
            <h4 className="type-base weight-bold text-token-primary">Interface density</h4>
            <p className="mt-0.5 type-xs weight-medium text-token-muted">Control how much information fits on each screen.</p>
          </div>
          <select value={density} onChange={(event) => setDensity(event.target.value)} className="field-token border border-token rounded-full px-4 py-2 type-xs weight-bold text-token-primary outline-none">
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle-token pb-5">
          <div>
            <h4 className="type-base weight-bold text-token-primary">Notification Alerts</h4>
            <p className="mt-0.5 type-xs weight-medium text-token-muted">Keep operational updates visible while you work.</p>
          </div>
          <button type="button" onClick={() => updateNotifications(!notifications)} className={`rounded-full px-4 py-2 type-xs weight-bold transition-colors ${notifications ? "accent-surface-token text-token-accent" : "field-token text-token-secondary"}`}>
            {notifications ? "Enabled" : "Disabled"}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle-token pb-5">
          <div>
            <h4 className="type-base weight-bold text-token-primary">Motion</h4>
            <p className="mt-0.5 type-xs weight-medium text-token-muted">Reduce transitions and animated movement across the workspace.</p>
          </div>
          <button type="button" onClick={() => setReducedMotion(!reducedMotion)} className={`rounded-full px-4 py-2 type-xs weight-bold transition-colors ${reducedMotion ? "accent-surface-token text-token-accent" : "field-token text-token-secondary"}`}>
            {reducedMotion ? "Reduced" : "Full motion"}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="type-base weight-bold text-token-primary">Time display</h4>
            <p className="mt-0.5 type-xs weight-medium text-token-muted">Choose how stage and duty times are shown to you.</p>
          </div>
          <select value={timeFormat} onChange={(event) => updateTimeFormat(event.target.value)} className="field-token border border-token rounded-full px-4 py-2 type-xs weight-bold text-token-primary outline-none">
            <option value="12h">12-hour clock</option>
            <option value="24h">24-hour clock</option>
          </select>
        </div>
      </div>
    </div>
  );
}
