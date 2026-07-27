import React from "react";
import { Box, Typography, Avatar, IconButton } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const COLORS = ["#3b82f6","#8b5cf6","#ec4899","#f59e0b","#10b981","#ef4444"];
const avatarColor = (id) => COLORS[(Number(id) || 0) % COLORS.length];

function fmtTime(ts) {
  if (!ts) return "Just now";
  return new Date(ts).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function CommentTimeline({ comments = [], currentUserId, getUserName, onDelete }) {
  if (!comments.length) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography sx={{ fontSize: "0.9rem", color: "#9ca3af" }}>
          No comments yet. Be the first to add one.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {comments.map((comment) => {
        const author = getUserName?.(comment.commentedBy) ?? `User ${comment.commentedBy}`;
        const isOwn = Number(currentUserId) === Number(comment.commentedBy);
        const initials = author.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
        const color = avatarColor(comment.commentedBy);

        return (
          <Box key={comment.id} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <Avatar sx={{
              width: 32, height: 32, fontSize: "0.72rem",
              bgcolor: color, fontWeight: 700, flexShrink: 0, mt: 0.25
            }}>
              {initials}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{
                bgcolor: isOwn ? "#eff6ff" : "#f9fafb",
                border: `1px solid ${isOwn ? "#bfdbfe" : "#e5e7eb"}`,
                borderRadius: "0px 10px 10px 10px",
                p: "10px 14px",
              }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5, gap: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.8rem", color: "#111827" }}>
                    {author}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                    <Typography sx={{ fontSize: "0.72rem", color: "#9ca3af" }}>
                      {fmtTime(comment.createdAt)}
                    </Typography>
                    {isOwn && onDelete && (
                      <IconButton
                        size="small"
                        onClick={() => onDelete(comment.id)}
                        sx={{ width: 20, height: 20, color: "#d1d5db", "&:hover": { color: "#ef4444" } }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: "0.9rem" }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                <Typography sx={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.6, wordBreak: "break-word" }}>
                  {comment.commentText}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
