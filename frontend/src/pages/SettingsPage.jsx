// Purpose: SettingsPage implements this source module.
import { PageTitle } from "@/components/ui/PageTitle";
import { ThemePicker } from "@/components/ui/ThemePicker";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";

const configuredApiUrl = (import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000/api").replace(/\/+$/, "");
const API_BASE = configuredApiUrl.endsWith("/api") ? configuredApiUrl : `${configuredApiUrl}/api`;

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
  const token = useAppStore((state) => state.token) || localStorage.getItem("convene_token");
  const [notifications, setNotifications] = useState(() => readPreference("convene_notifications", "true") === "true");
  const [timeFormat, setTimeFormat] = useState(() => readPreference("convene_time_format", "12h"));
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordState, setPasswordState] = useState({ saving: false, error: "", success: "" });

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

  // Keeps password fields controlled while the user edits the secure form.
  function updatePasswordField(field, value) {
    setPasswordForm((current) => ({ ...current, [field]: value }));
    setPasswordState({ saving: false, error: "", success: "" });
  }

  // Changes the password through the authenticated API and clears secrets after success.
  async function changePassword(event) {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordState({ saving: false, error: "New passwords do not match.", success: "" });
      return;
    }
    setPasswordState({ saving: true, error: "", success: "" });
    try {
      const response = await fetch(`${API_BASE}/auth/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not change password.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordState({ saving: false, error: "", success: "Password changed successfully." });
    } catch (error) {
      setPasswordState({ saving: false, error: error.message, success: "" });
    }
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
            <h4 className="type-base weight-bold text-token-primary">Workspace appearance</h4>
            <p className="mt-0.5 type-xs weight-medium text-token-muted">Choose the color tone that feels right for your command center.</p>
          </div>
          <ThemePicker />
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

        <form onSubmit={changePassword} className="border-t border-subtle-token pt-6 space-y-4">
          <div>
            <h4 className="type-base weight-bold text-token-primary">Change password</h4>
            <p className="mt-0.5 type-xs weight-medium text-token-muted">Use your current password to set a new one for this account.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[['currentPassword', 'Current password'], ['newPassword', 'New password'], ['confirmPassword', 'Confirm new password']].map(([field, label]) => (
              <label key={field} className="space-y-1.5">
                <span className="type-xs weight-bold text-token-secondary">{label}</span>
                <input type="password" autoComplete={field === 'currentPassword' ? 'current-password' : 'new-password'} value={passwordForm[field]} onChange={(event) => updatePasswordField(field, event.target.value)} className="field-token w-full rounded-xl border border-token px-3 py-2 type-sm text-token-primary outline-none" required minLength={field === 'currentPassword' ? undefined : 8} />
              </label>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="type-xs weight-medium" role="status" aria-live="polite">
              {passwordState.error && <span className="text-red-600">{passwordState.error}</span>}
              {passwordState.success && <span className="text-green-600">{passwordState.success}</span>}
            </p>
            <button type="submit" disabled={passwordState.saving || !token} className="accent-button-token rounded-full px-4 py-2 type-xs weight-bold disabled:cursor-not-allowed disabled:opacity-60">
              {passwordState.saving ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
