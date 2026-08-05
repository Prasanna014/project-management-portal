import React from "react";
import { Chip } from "@mui/material";

const STATUS_CONFIG = {
  "To Do":       { color: "#64748b", bg: "#f1f5f9" },
  "Open":        { color: "#2563eb", bg: "#eff6ff" },
  "In Progress": { color: "#d97706", bg: "#fffbeb" },
  "Blocked":     { color: "#dc2626", bg: "#fef2f2" },
  "Reopened":    { color: "#f97316", bg: "#fff7ed" },
  "Done":        { color: "#059669", bg: "#ecfdf5" },
  "Completed":   { color: "#7c3aed", bg: "#f5f3ff" },
  "On Hold":     { color: "#7c3aed", bg: "#f5f3ff" },
  "Closed":      { color: "#059669", bg: "#ecfdf5" },
  "Waiting":     { color: "#f59e0b", bg: "#fffbeb" },
  "Scheduled":   { color: "#6366f1", bg: "#eef2ff" },
  "Overdue":     { color: "#dc2626", bg: "#fef2f2" },
};

export default function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { color: "#374151", bg: "#f3f4f6" };
  return (
    <Chip
      label={status || "Unknown"}
      size="small"
      sx={{
        fontWeight: 600,
        fontSize: "0.72rem",
        color: cfg.color,
        bgcolor: cfg.bg,
        borderRadius: "6px",
        height: 22,
        border: "none",
        "& .MuiChip-label": { px: "8px" },
      }}
    />
  );
}
