import React from "react";
import { Chip } from "@mui/material";

const STATUS_CONFIG = {
  "Open":        { color: "#374151", bg: "#f3f4f6" },
  "In Progress": { color: "#d97706", bg: "#fef3c7" },
  "Closed":      { color: "#059669", bg: "#dcfce7" },
  "On Hold":     { color: "#dc2626", bg: "#fee2e2" },
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
