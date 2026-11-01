// Purpose: App implements this source module.
import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { AppShell } from "@/layouts/AppShell";
import { useAppStore } from "@/store/useAppStore";
import { getApiBase } from "@/lib/api";

// Purpose: load named page exports only when their route is opened.
const lazyPage = (loader, exportName) =>
  lazy(() => loader().then((module) => ({ default: module[exportName] })));

const LandingPage = lazyPage(
  () => import("@/pages/LandingPage"),
  "LandingPage",
);
const LoginPage = lazyPage(() => import("@/pages/LoginPage"), "LoginPage");
const OnboardingPage = lazyPage(
  () => import("@/pages/OnboardingPage"),
  "OnboardingPage",
);
const MissionControlPage = lazyPage(
  () => import("@/pages/MissionControlPage"),
  "MissionControlPage",
);
const ParticipantsPage = lazyPage(
  () => import("@/pages/ParticipantsPage"),
  "ParticipantsPage",
);
const TasksPage = lazyPage(() => import("@/pages/TasksPage"), "TasksPage");
const DutiesPage = lazyPage(() => import("@/pages/DutiesPage"), "DutiesPage");
const TeamsPage = lazyPage(() => import("@/pages/TeamsPage"), "TeamsPage");
const RunOfShowPage = lazyPage(
  () => import("@/pages/RunOfShowPage"),
  "RunOfShowPage",
);
const InventoryPage = lazyPage(
  () => import("@/pages/InventoryPage"),
  "InventoryPage",
);
const ResourcesPage = lazyPage(
  () => import("@/pages/ResourcesPage"),
  "ResourcesPage",
);
const IssuesPage = lazyPage(() => import("@/pages/IssuesPage"), "IssuesPage");
const SettingsPage = lazyPage(
  () => import("@/pages/SettingsPage"),
  "SettingsPage",
);

// Purpose: preserve the app layout while a route chunk is loading.
function RouteLoader() {
  return (
    <div className="min-h-screen bg-token-page flex items-center justify-center">
      <div className="flex items-center gap-3 type-xs weight-bold text-token-secondary">
        <span className="h-4 w-4 rounded-full border-2 border-token-accent border-t-transparent animate-spin" />
        Loading Convene...
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const token =
    useAppStore((state) => state.token) ||
    localStorage.getItem("convene_token");
  const setUserSession = useAppStore((state) => state.setUserSession);
  const clearSession = useAppStore((state) => state.clearSession);

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(Boolean(token));

  useEffect(() => {
    let isMounted = true;
    async function validateToken() {
      if (!token) {
        if (isMounted) {
          setIsValid(false);
          setIsValidating(false);
        }
        return;
      }

      try {
        const API_BASE = getApiBase();
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setUserSession(data.user, token);
            setIsValid(true);

            // Fetch all events for this user from backend DB
            try {
              const evRes = await fetch(`${API_BASE}/events`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (evRes.ok) {
                const evData = await evRes.json();
                const currentActiveId = useAppStore.getState().activeEvent?.id;
                const formattedEvents = (evData.events || []).map((e) => ({
                  ...e,
                  duration: e.durationDisplay || "24 Hours",
                  location: e.primaryLocation || "Main Venue",
                  stages: (e.stages || []).map((stage) => ({
                    ...stage,
                    location: stage.location || stage.venue?.name || "",
                  })),
                }));
                const targetActive =
                  formattedEvents.find((e) => e.id === currentActiveId) ||
                  formattedEvents[0] ||
                  null;

                useAppStore.setState({
                  events: formattedEvents,
                  eventsHydrated: true,
                  activeEvent: targetActive,
                  role:
                    targetActive?.accessLevel === "lead" ? "lead" : "member",
                });
              } else {
                useAppStore.setState({ eventsHydrated: true });
              }
            } catch (evErr) {
              console.warn("Could not sync user events:", evErr.message);
              useAppStore.setState({ eventsHydrated: true });
            }
          }
        } else {
          // Token invalid or user deleted from DB
          clearSession();
          if (isMounted) {
            setIsValid(false);
          }
        }
      } catch (err) {
        console.warn("Backend auth check offline/failed:", err.message);
        // Keep existing token if server temporary connection issue, or invalidate if unauthorized
        if (isMounted) setIsValid(Boolean(token));
      } finally {
        if (isMounted) setIsValidating(false);
      }
    }

    validateToken();
    return () => {
      isMounted = false;
    };
  }, [token]);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-token-page flex items-center justify-center">
        <div className="flex items-center gap-3 type-xs weight-bold text-token-secondary">
          <span className="h-4 w-4 rounded-full border-2 border-token-accent border-t-transparent animate-spin" />
          Authenticating session...
        </div>
      </div>
    );
  }

  if (!isValid) {
    // Send unauthenticated deep links back to the public landing page.
    return <Navigate to="/" replace />;
  }

  return children;
}

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<MissionControlPage />} />
            <Route path="/participants" element={<ParticipantsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/duties" element={<DutiesPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route
              path="/departments"
              element={<Navigate to="/teams" replace />}
            />
            <Route path="/run-of-show" element={<RunOfShowPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/issues" element={<IssuesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
