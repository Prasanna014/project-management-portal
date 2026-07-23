import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardPage from "../pages/DashboardPage";
import ProjectPage from "../pages/ProjectPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ Default route */}
        <Route path="/" element={<DashboardPage />} />

        {/* ✅ Projects */}
        <Route path="/projects" element={<ProjectPage />} />

      </Routes>
    </BrowserRouter>
  );
}
