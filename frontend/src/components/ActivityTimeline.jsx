import React from "react";
import { Box, Typography, Avatar } from "@mui/material";

const COLORS = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6"];
const avatarColor = (id) => COLORS[(Number(id) || 0) % COLORS.length];

function fmtTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ActivityTimeline({ history = [], getUserName }) {
  if (!history.length) {
    return (
      <Box sx={{ py: 5, textAlign: "center" }}>
        <Typography sx={{ color: "#9ca3af", fontSize: "0.9rem" }}>
          No activity recorded yet
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {history.map((item, idx) => {
        const isLast = idx === history.length - 1;
        const name = getUserName?.(item.performedBy) ?? `User ${item.performedBy}`;
        const initial = name.charAt(0).toUpperCase();
        const color = avatarColor(item.performedBy);
        return (
          <Box key={item.id ?? idx} sx={{ display: "flex", gap: 1.5 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32, flexShrink: 0 }}>
              <Avatar sx={{ width: 28, height: 28, fontSize: "0.7rem", bgcolor: color, fontWeight: 700, mt: 0.5 }}>
                {initial}
              </Avatar>
              {!isLast && (
                <Box sx={{ width: 2, flex: 1, bgcolor: "#e5e7eb", my: 0.5, minHeight: 20 }} />
              )}
            </Box>
            <Box sx={{ flex: 1, pb: isLast ? 0.5 : 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.3 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#111827" }}>
                  {name}
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#9ca3af" }}>
                  {fmtTime(item.timestamp)}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: "0.85rem", color: "#6b7280", lineHeight: 1.55 }}>
                {item.description || item.action || "Activity recorded"}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
