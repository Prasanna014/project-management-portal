import React, { useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  Divider,
  Button
} from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";

/**
 * Reusable Collapsible Sidebar Component
 * Used across all pages for consistent UI
 * 
 * Props:
 * - title: Sidebar header title
 * - children: Content to display in sidebar
 * - width: Width when open (default: 320px)
 * - defaultOpen: Initial state (default: true)
 */
export default function SidebarPanel({ title = "Actions", children, width = "320px", defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      {/* SIDEBAR - COLLAPSIBLE */}
      <Box
        sx={{
          width: isOpen ? width : "0px",
          overflow: "hidden",
          transition: "width 0.3s ease",
          borderLeft: isOpen ? "1px solid #e0e0e0" : "none",
          backgroundColor: "#2563eb",
          color: "#fff",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* SIDEBAR HEADER */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
            {title}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setIsOpen(false)}
            sx={{ color: "#fff", "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}
          >
            <KeyboardArrowRightIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* SIDEBAR CONTENT */}
        <Box
          sx={{
            p: 2,
            flex: 1,
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-track": { backgroundColor: "rgba(255,255,255,0.1)" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255,255,255,0.3)", borderRadius: "3px" }
          }}
        >
          {children}
        </Box>
      </Box>

      {/* COLLAPSE BUTTON (When sidebar closed) */}
      {!isOpen && (
        <Box
          sx={{
            width: "40px",
            backgroundColor: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": { backgroundColor: "#1d4ed8" },
            transition: "background-color 0.2s",
            flexShrink: 0
          }}
          onClick={() => setIsOpen(true)}
        >
          <IconButton size="small" sx={{ color: "#fff" }}>
            <KeyboardArrowLeftIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
