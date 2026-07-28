import React, { useState } from "react";
import { Box, Typography, Avatar, IconButton, TextField, Button, Chip } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

const COLORS = ["#3b82f6","#8b5cf6","#ec4899","#f59e0b","#10b981","#ef4444"];
const avatarColor = (id) => COLORS[(Number(id) || 0) % COLORS.length];

function fmtTime(ts) {
  if (!ts) return "Just now";
  return new Date(ts).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function CommentTimeline({ comments = [], currentUserId, getUserName, onDelete, onEdit }) {
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  if (!comments.length) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Box sx={{
          display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 1,
          p: 3, borderRadius: 4,
          background: "linear-gradient(135deg, #f8fbff 0%, #eff6ff 100%)",
          border: "1px dashed #bfdbfe",
        }}>
          <Typography sx={{ fontSize: "1.6rem" }}>💬</Typography>
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#475569" }}>
            No comments yet
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            Be the first to add one below.
          </Typography>
        </Box>
      </Box>
    );
  }

  // Sort oldest → newest so newest appears at the bottom (chat style)
  const sorted = [...comments].sort((a, b) => {
    const ta = new Date(a.commentedAt || a.createdAt || a.commented_at || 0).getTime();
    const tb = new Date(b.commentedAt || b.createdAt || b.commented_at || 0).getTime();
    return ta - tb;
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
      {sorted.map((comment) => {
        const author = getUserName?.(comment.commentedBy) ?? `User ${comment.commentedBy}`;
        const isOwn = Number(currentUserId) === Number(comment.commentedBy);
        const initials = author.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
        const color = avatarColor(comment.commentedBy);
        const isEditing = String(editingId) === String(comment.id);
        const timestamp = comment.commentedAt || comment.createdAt || comment.commented_at;
        const wasEdited = Boolean(comment.updatedAt || comment.editedAt);

        return (
          <Box key={comment.id} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <Avatar sx={{
              width: 34, height: 34, fontSize: "0.75rem",
              bgcolor: color, fontWeight: 700, flexShrink: 0, mt: 0.25,
              boxShadow: `0 0 0 2px ${color}40`,
            }}>
              {initials}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{
                background: isOwn
                  ? "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                  : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                border: `1px solid ${isOwn ? "#bfdbfe" : "#e2e8f0"}`,
                borderRadius: isOwn ? "12px 12px 4px 12px" : "4px 12px 12px 12px",
                p: "10px 14px",
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.05)",
                transition: "box-shadow 0.15s ease",
                "&:hover": { boxShadow: "0 4px 16px rgba(15, 23, 42, 0.09)" },
              }}>
                {/* Header row */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.6, gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: isOwn ? "#1d4ed8" : "#0f172a" }}>
                      {author}
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                      {fmtTime(timestamp)}
                    </Typography>
                    {wasEdited && (
                      <Chip
                        label="edited"
                        size="small"
                        sx={{
                          height: 16, fontSize: "0.65rem", fontWeight: 600,
                          bgcolor: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0",
                          "& .MuiChip-label": { px: 0.75 },
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, flexShrink: 0 }}>
                    {isOwn && onEdit && !isEditing && (
                      <IconButton
                        size="small"
                        onClick={() => { setEditingId(comment.id); setEditingText(comment.commentText || ""); }}
                        sx={{ width: 22, height: 22, color: "#cbd5e1", "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" } }}
                      >
                        <EditOutlinedIcon sx={{ fontSize: "0.82rem" }} />
                      </IconButton>
                    )}
                    {isOwn && onDelete && (
                      <IconButton
                        size="small"
                        onClick={() => onDelete(comment.id)}
                        sx={{ width: 22, height: 22, color: "#cbd5e1", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: "0.82rem" }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                {/* Body */}
                {isEditing ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <TextField
                      value={editingText}
                      onChange={(event) => setEditingText(event.target.value)}
                      size="small"
                      multiline
                      minRows={2}
                      autoFocus
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px", bgcolor: "#fff", fontSize: "0.875rem",
                          "& fieldset": { borderColor: "#bfdbfe" },
                          "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                        },
                      }}
                    />
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                      <Button
                        size="small" variant="outlined"
                        onClick={() => { setEditingId(null); setEditingText(""); }}
                        sx={{ borderRadius: "7px", fontSize: "0.78rem", textTransform: "none", borderColor: "#e2e8f0", color: "#64748b" }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="small" variant="contained"
                        disabled={!editingText.trim()}
                        onClick={async () => {
                          await onEdit(comment.id, editingText.trim());
                          setEditingId(null);
                          setEditingText("");
                        }}
                        sx={{ borderRadius: "7px", fontSize: "0.78rem", textTransform: "none", bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" } }}
                      >
                        Save
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: "0.875rem", color: "#334155", lineHeight: 1.65, wordBreak: "break-word" }}>
                    {comment.commentText}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
