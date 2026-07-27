import React from "react";
import { Chip } from "@mui/material";

const PRIORITY_CONFIG = {
  "Low":      { color: "#059669", bg: "#dcfce7" },
  "Medium":   { color: "#2563eb", bg: "#dbeafe" },
  "High":     { color: "#d97706", bg: "#fef3c7" },
  "Critical": { color: "#dc2626", bg: "#fee2e2" },
};

export default function PriorityChip({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] ?? { color: "#374151", bg: "#f3f4f6" };
  return (
    <Chip
      label={priority || "Unknown"}
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
