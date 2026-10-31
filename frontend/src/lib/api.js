// Purpose: resolve one normalized backend API base for local and deployed builds.
export function getApiBase() {
  const configuredUrl = (import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000/api").replace(/\/+$/, "");
  return configuredUrl.endsWith("/api") ? configuredUrl : `${configuredUrl}/api`;
}
