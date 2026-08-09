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

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
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
