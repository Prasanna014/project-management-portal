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
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [project, setProject] = useState("");

  return (
    <AppBar
      position="fixed"
      sx={{ bgcolor: "#fff", color: "#000", boxShadow: 1 }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Select
          value={project}
          onChange={(e) => setProject(e.target.value)}
          displayEmpty
          size="small"
        >
          <MenuItem value="">Select Project</MenuItem>
          <MenuItem value="1">Customer Support Tracker</MenuItem>
          <MenuItem value="2">Internal Tasks</MenuItem>
          <MenuItem value="3">Firmware Tracker</MenuItem>
        </Select>

        <Box>
          <IconButton>
            <NotificationsIcon />
          </IconButton>

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar />
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

