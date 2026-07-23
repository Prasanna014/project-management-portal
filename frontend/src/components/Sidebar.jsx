// ================= src/components/Sidebar.jsx =================
import React from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import {
  Dashboard,
  Folder,
  Task,
  CalendarMonth,
  Assessment,
  Search,
  Notifications,
  People,
  Settings,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { text: "Dashboard", icon: <Dashboard />, path: "/" },
  { text: "Projects", icon: <Folder />, path: "/projects" },
  { text: "Tasks", icon: <Task />, path: "/tasks" },
  { text: "Calendar", icon: <CalendarMonth />, path: "/calendar" },
  { text: "Reports", icon: <Assessment />, path: "/reports" },
  { text: "Search", icon: <Search />, path: "/search" },
  { text: "Notifications", icon: <Notifications />, path: "/notifications" },
  { text: "Users", icon: <People />, path: "/users" },
  { text: "Settings", icon: <Settings />, path: "/settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0, // ✅ important
        "& .MuiDrawer-paper": {
          width: 240,
          bgcolor: "#1F2937",
          color: "#fff",
        },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon sx={{ color: "#fff" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
