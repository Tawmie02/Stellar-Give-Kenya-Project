import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { ReceiptsPage } from './pages/ReceiptsPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { Onboarding } from './pages/Onboarding';

function Protected({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboard" element={<Onboarding />} />
      <Route
        path="/dashboard"
        element={
          <Protected>
            <DashboardPage />
          </Protected>
        }
      />
      <Route
        path="/projects"
        element={
          <Protected>
            <MarketplacePage />
          </Protected>
        }
      />
      <Route
        path="/projects/new"
        element={
          <Protected>
            <CreateProjectPage />
          </Protected>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <Protected>
            <ProjectDetailsPage />
          </Protected>
        }
      />
      <Route
        path="/receipts"
        element={
          <Protected>
            <ReceiptsPage />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
