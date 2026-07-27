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
import { SidebarProvider, useSidebar } from "./contexts/SidebarContext";
import { ProjectProvider } from "./contexts/ProjectContext";

// Inner layout reads the dynamic drawer width from context
function AppLayout() {
  const { drawerWidth } = useSidebar();

  return (
    <Box sx={{ display: "flex" }}>

      {/* ✅ Collapsible Sidebar */}
      <Sidebar />

      {/* ✅ Main Content — shifts smoothly as sidebar expands/collapses */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        {/* Push content below fixed AppBar */}
        <Toolbar />

        {/* ✅ Header */}
        <Header />

        {/* ✅ Page Content */}
        <Box sx={{ p: 3 }}>
          <Routes>
            <Route path="/"           element={<DashboardPage />} />
            <Route path="/projects"   element={<ProjectPage />} />
            <Route path="/tasks"      element={<TasksPage />} />
            <Route path="/create-task" element={<CreateTaskPage />} />
            <Route path="/task/:taskId" element={<TaskDetailsPage />} />
            <Route path="/reports"    element={<ReportsPage />} />
            <Route path="/search"     element={<SearchPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/users"      element={<UsersPage />} />
            <Route path="/calendar"   element={<CalenderPage />} />
            <Route path="/settings"   element={<Box>Settings</Box>} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <ProjectProvider>
          <AppLayout />
        </ProjectProvider>
      </SidebarProvider>
    </BrowserRouter>
  );
}

