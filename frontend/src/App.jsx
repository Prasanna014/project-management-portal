import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import ProjectPage from "./pages/ProjectPage";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { Box, Toolbar } from "@mui/material";
import TasksPage from "./pages/TasksPage";
import ReportsPage from "./pages/ReportsPage";
import SearchPage from "./pages/SearchPage";
import NotificationsPage from "./pages/NotificationsPage";
import UsersPage from "./pages/UsersPage";
import CalenderPage from "./pages/CalenderPage";
import CreateTaskPage from "./pages/CreateTaskPage";
import TaskDetailsPage from "./pages/TaskDetailsPage";

const drawerWidth = 240;

export default function App() {
  return (
    <BrowserRouter>
      <Box sx={{ display: "flex" }}>

        {/* ✅ Sidebar */}
        <Sidebar />

        {/* ✅ Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: `${drawerWidth}px`, // ✅ VERY IMPORTANT (fixes overlap)
          }}
        >
          {/* ✅ Push below header */}
          <Toolbar />

          {/* ✅ Header */}
          <Header />

          {/* ✅ Page Content */}
          <Box sx={{ p: 3 }}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectPage />} />
	      <Route path="/tasks" element={<TasksPage />} />
              <Route path="/tasks/new" element={<CreateTaskPage />} />
              <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
	      <Route path="/reports" element={<ReportsPage />} />
	      <Route path="/search" element={<SearchPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/calendar" element={<CalenderPage />} />
              <Route path="/settings" element={<Box>Settings</Box>} />
            </Routes>
          </Box>

        </Box>
      </Box>
    </BrowserRouter>
  );
}
