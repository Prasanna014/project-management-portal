import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardPage from "../pages/DashboardPage";
import ProjectPage from "../pages/ProjectPage";
import CreateTaskPage from "../pages/CreateTaskPage";
import TasksPage from "../pages/TasksPage";
import TaskDetailsPage from "../pages/TaskDetailsPage";
import UsersPage from "../pages/UsersPage";
import NotificationsPage from "../pages/NotificationsPage";
import SearchPage from "../pages/SearchPage";
import ReportsPage from "../pages/ReportsPage";
import CalenderPage from "../pages/CalenderPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ Default route */}
        <Route path="/" element={<DashboardPage />} />

        {/* ✅ Projects */}
        <Route path="/projects" element={<ProjectPage />} />

        {/* ✅ Tasks */}
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/create-task" element={<CreateTaskPage />} />
        <Route path="/task/:taskId" element={<TaskDetailsPage />} />

        {/* ✅ Users */}
        <Route path="/users" element={<UsersPage />} />

        {/* ✅ Notifications */}
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* ✅ Search */}
        <Route path="/search" element={<SearchPage />} />

        {/* ✅ Reports */}
        <Route path="/reports" element={<ReportsPage />} />

        {/* ✅ Calendar */}
        <Route path="/calendar" element={<CalenderPage />} />

      </Routes>
    </BrowserRouter>
  );
}
