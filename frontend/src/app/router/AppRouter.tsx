import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "@app/layout/AppShell";
import { ActivateAccountPage } from "@features/auth/pages/ActivateAccountPage";
import { ForgotPasswordPage } from "@features/auth/pages/ForgotPasswordPage";
import { LoginPage } from "@features/auth/pages/LoginPage";
import { ResetPasswordPage } from "@features/auth/pages/ResetPasswordPage";
import { DashboardPage } from "@modules/dashboard/pages/DashboardPage";
import { WorkspacePage } from "@modules/workspace/pages/WorkspacePage";
import { ProjectsPage } from "@modules/projects/pages/ProjectsPage";
import { TasksPage } from "@modules/tasks/pages/TasksPage";
import { ReportsPage } from "@modules/reports/pages/ReportsPage";
import { UsersPage } from "@modules/users/pages/UsersPage";
import { KnowledgeBasePage } from "@modules/knowledge-base/pages/KnowledgeBasePage";
import { AdministrationPage } from "@modules/administration/pages/AdministrationPage";
import { SettingsPage } from "@modules/settings/pages/SettingsPage";
import CreateTaskPage from "../../pages/CreateTaskPage";
import TaskDetailsPage from "../../pages/TaskDetailsPage";
import { useAuth } from "@features/auth/context/AuthContext";

function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activate-account" element={<ActivateAccountPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/create-task" element={<CreateTaskPage />} />
          <Route path="/task/:taskId" element={<TaskDetailsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
          <Route path="/administration" element={<AdministrationPage />} />
          <Route path="/administration/:moduleKey" element={<AdministrationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
