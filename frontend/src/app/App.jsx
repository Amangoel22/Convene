import { Navigate, Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { AppShell } from "@/layouts/AppShell";
import { MissionControlPage } from "@/pages/MissionControlPage";
import { ParticipantsPage } from "@/pages/ParticipantsPage";
import { TasksPage } from "@/pages/TasksPage";
import { TeamsPage } from "@/pages/TeamsPage";
import { RunOfShowPage } from "@/pages/RunOfShowPage";
import { InventoryPage } from "@/pages/InventoryPage";
import { ResourcesPage } from "@/pages/ResourcesPage";
import { IssuesPage } from "@/pages/IssuesPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { DutiesPage } from "@/pages/DutiesPage";
import { LoginPage } from "@/pages/LoginPage";
import { useAppStore } from "@/store/useAppStore";

import { useEffect, useState } from "react";

function ProtectedRoute({ children }) {
  const token = useAppStore((state) => state.token) || localStorage.getItem("convene_token");
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
        const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setUserSession(data.user, token);
            setIsValid(true);

            // Fetch all events for this user from backend DB
            try {
              const evRes = await fetch(`${API_BASE}/events`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (evRes.ok) {
                const evData = await evRes.json();
                if (evData.events && evData.events.length > 0) {
                  const currentActiveId = useAppStore.getState().activeEvent?.id;
                  const formattedEvents = evData.events.map((e) => ({
                    ...e,
                    duration: e.durationDisplay || "24 Hours",
                    location: e.primaryLocation || "Main Venue"
                  }));
                  const targetActive = formattedEvents.find((e) => e.id === currentActiveId) || formattedEvents[0];

                  useAppStore.setState({
                    events: formattedEvents,
                    activeEvent: targetActive
                  });
                }
              }
            } catch (evErr) {
              console.warn("Could not sync user events:", evErr.message);
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
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="flex items-center gap-3 text-xs font-bold text-[#5A6577]">
          <span className="h-4 w-4 rounded-full border-2 border-[#3B6FD4] border-t-transparent animate-spin" />
          Authenticating session...
        </div>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
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
          <Route path="/departments" element={<Navigate to="/teams" replace />} />
          <Route path="/run-of-show" element={<RunOfShowPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
