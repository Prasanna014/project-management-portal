// ================= src/components/Header.jsx =================
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Select,
  MenuItem,
  Avatar,
  Menu,
  CircularProgress,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useSidebar } from "../contexts/SidebarContext";
import { useProject } from "../contexts/ProjectContext";

export default function Header() {
  const { drawerWidth } = useSidebar();
  const { projects, selectedProjectId, setSelectedProjectId, loading } = useProject();
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: "#fff",
        color: "#000",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        left: `${drawerWidth}px`,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: "left 0.25s ease, width 0.25s ease",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", minHeight: "56px !important" }}>
        {/* Project selector — loads from DB */}
        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">Loading…</Typography>
          </Box>
        ) : (
          <Select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            displayEmpty
            size="small"
            sx={{
              minWidth: 200,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9ca3af" },
              fontSize: "0.875rem",
            }}
          >
            <MenuItem value="">All Projects</MenuItem>
            {projects.map((p) => (
              <MenuItem key={p.id} value={String(p.id)}>
                {p.name || p.projectName || p.projectCode || `Project ${p.id}`}
              </MenuItem>
            ))}
          </Select>
        )}

        {/* Right actions */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton><NotificationsIcon /></IconButton>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32 }} />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem>Profile</MenuItem>
            <MenuItem>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

