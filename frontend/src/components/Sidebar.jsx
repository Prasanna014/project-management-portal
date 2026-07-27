// ================= src/components/Sidebar.jsx =================
import React from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  IconButton,
  Box,
  Tooltip,
  Divider,
  Avatar,
  Typography,
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
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useSidebar,
  SIDEBAR_EXPANDED_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
} from "../contexts/SidebarContext";
import { useProject } from "../contexts/ProjectContext";

const menuItems = [
  { text: "Dashboard",     icon: <Dashboard />,     path: "/" },
  { text: "Projects",      icon: <Folder />,         path: "/projects" },
  { text: "Tasks",         icon: <Task />,            path: "/tasks" },
  { text: "Calendar",      icon: <CalendarMonth />,  path: "/calendar" },
  { text: "Reports",       icon: <Assessment />,     path: "/reports" },
  { text: "Search",        icon: <Search />,          path: "/search" },
  { text: "Notifications", icon: <Notifications />,  path: "/notifications" },
  { text: "Users",         icon: <People />,          path: "/users" },
  { text: "Settings",      icon: <Settings />,        path: "/settings" },
];

export default function Sidebar() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { collapsed, toggle } = useSidebar();
  const { projects, selectedProjectId } = useProject();

  const selectedProject = projects.find(p => String(p.id) === String(selectedProjectId)) || null;

  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width,
          bgcolor: "#0F172A",
          color: "#fff",
          overflowX: "hidden",
          transition: "width 0.25s ease",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        },
        transition: "width 0.25s ease",
      }}
    >
      <Toolbar />

      {/* ── Brand ─────────────────────────────────────────────────────── */}
      <Box sx={{
        px: collapsed ? "14px" : "16px", py: "14px",
        display: "flex", alignItems: "center", gap: 1.5,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <Box sx={{
          width: 34, height: 34, borderRadius: "10px", flexShrink: 0,
          background: "linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(79,70,229,0.45)",
        }}>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.78rem", letterSpacing: "-0.5px" }}>
            PM
          </Typography>
        </Box>
        {!collapsed && (
          <Box>
            <Typography sx={{ color: "#F1F5F9", fontWeight: 700, fontSize: "0.88rem", lineHeight: 1.2, whiteSpace: "nowrap" }}>
              Project Portal
            </Typography>
            <Typography sx={{ color: "#475569", fontSize: "0.65rem", letterSpacing: "0.04em" }}>
              WORKSPACE
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Active project indicator ──────────────────────────────────── */}
      {selectedProject && (
        <Tooltip title={collapsed ? selectedProject.name : ""} placement="right">
          <Box sx={{
            mx: collapsed ? "8px" : "12px",
            my: "8px",
            px: collapsed ? "8px" : "12px",
            py: "8px",
            borderRadius: "10px",
            bgcolor: "rgba(79,70,229,0.14)",
            border: "1px solid rgba(99,102,241,0.28)",
            display: "flex", alignItems: "center", gap: 1,
            cursor: "default",
          }}>
            <Box sx={{
              width: 7, height: 7, borderRadius: "50%",
              bgcolor: "#818CF8", flexShrink: 0,
            }} />
            {!collapsed && (
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: "#94A3B8", fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1 }}>
                  Active Project
                </Typography>
                <Typography sx={{
                  color: "#C7D2FE", fontSize: "0.75rem", fontWeight: 600,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  mt: "2px",
                }}>
                  {selectedProject.name}
                </Typography>
              </Box>
            )}
          </Box>
        </Tooltip>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-end",
          px: 1,
          py: "6px",
        }}
      >
        <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right">
          <IconButton
            onClick={toggle}
            size="small"
            sx={{
              color: "#6b7280",
              "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
            }}
          >
            {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* ── Nav items ───────────────────────────────────────────────────── */}
      <List sx={{ pt: 0.5, px: 0 }}>
        {menuItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

          const button = (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                minHeight: 44,
                px: collapsed ? "18px" : "16px",
                justifyContent: collapsed ? "center" : "flex-start",
                bgcolor: isActive ? "rgba(79,70,229,0.18)" : "transparent",
                borderLeft: isActive
                  ? "3px solid #818CF8"
                  : "3px solid transparent",
                borderRadius: isActive ? "0 8px 8px 0" : 0,
                mx: isActive ? "4px" : 0,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.06)",
                },
                transition: "background-color 0.15s, border-left 0.15s",
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? "#A5B4FC" : "#94A3B8",
                  minWidth: collapsed ? 0 : 40,
                  "& .MuiSvgIcon-root": { fontSize: "1.2rem" },
                }}
              >
                {item.icon}
              </ListItemIcon>

              {!collapsed && (
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: collapsed ? 0 : 1,
                    transition: "opacity 0.2s",
                    "& .MuiListItemText-primary": {
                      fontSize: "0.875rem",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#fff" : "#d1d5db",
                      whiteSpace: "nowrap",
                    },
                  }}
                />
              )}
            </ListItemButton>
          );

          return collapsed ? (
            <Tooltip key={item.text} title={item.text} placement="right" arrow>
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </List>

      {/* ── User footer ─────────────────────────────────────────────────── */}
      <Box sx={{ mt: "auto" }}>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.07)" }} />
        <Box sx={{
          px: collapsed ? "14px" : "16px", py: "14px",
          display: "flex", alignItems: "center", gap: 1.5,
          cursor: "pointer",
          "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
          transition: "background-color 0.15s",
        }}>
          <Avatar sx={{
            width: 32, height: 32, bgcolor: "#4F46E5",
            fontSize: "0.72rem", fontWeight: 700, flexShrink: 0,
            border: "2px solid rgba(99,102,241,0.45)",
          }}>
            JD
          </Avatar>
          {!collapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: "#F1F5F9", fontSize: "0.8rem", fontWeight: 600, lineHeight: 1.3, whiteSpace: "nowrap" }}>
                John Doe
              </Typography>
              <Typography sx={{ color: "#475569", fontSize: "0.67rem" }}>
                Administrator
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}

