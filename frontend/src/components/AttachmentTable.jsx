import React from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import ArticleIcon from "@mui/icons-material/Article";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const IMAGE_EXTS = [".jpg",".jpeg",".png",".gif",".webp",".bmp"];
const PDF_EXTS   = [".pdf"];
const ZIP_EXTS   = [".zip",".rar",".7z"];
const DOC_EXTS   = [".doc",".docx",".txt",".md"];

function FileIcon({ name }) {
  const n = name.toLowerCase();
  if (IMAGE_EXTS.some(e => n.endsWith(e))) return <ImageIcon      sx={{ fontSize: "1.25rem", color: "#10b981" }} />;
  if (PDF_EXTS.some(e => n.endsWith(e)))   return <PictureAsPdfIcon sx={{ fontSize: "1.25rem", color: "#ef4444" }} />;
  if (ZIP_EXTS.some(e => n.endsWith(e)))   return <FolderZipIcon   sx={{ fontSize: "1.25rem", color: "#f59e0b" }} />;
  if (DOC_EXTS.some(e => n.endsWith(e)))   return <ArticleIcon     sx={{ fontSize: "1.25rem", color: "#3b82f6" }} />;
  return <AttachFileIcon sx={{ fontSize: "1.25rem", color: "#6b7280" }} />;
}

export default function AttachmentTable({ attachments = [], onDelete, onPreview }) {
  if (!attachments.length) {
    return (
      <Box sx={{ py: 5, textAlign: "center" }}>
        <Typography sx={{ fontSize: "0.9rem", color: "#9ca3af" }}>
          No attachments uploaded yet
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {attachments.map(att => (
        <Box
          key={att.id}
          sx={{
            display: "flex", alignItems: "center", gap: 1.5,
            p: "10px 14px", border: "1px solid #e5e7eb",
            borderRadius: "8px", bgcolor: "#fff", cursor: "pointer",
            transition: "all 0.15s",
            "&:hover": { borderColor: "#3b82f6", bgcolor: "#eff6ff", boxShadow: "0 1px 4px rgba(59,130,246,0.12)" },
          }}
          onClick={(e) => onPreview?.(att, e)}
        >
          <FileIcon name={att.fileName} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{
              fontSize: "0.85rem", fontWeight: 500, color: "#111827",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {att.fileName}
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "#9ca3af" }}>
              {att.uploadedAt
                ? new Date(att.uploadedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                : "Unknown date"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <Tooltip title="Download">
              <IconButton
                size="small"
                onClick={() => window.open(`data:application/octet-stream;base64,${att.fileData}`, "_blank")}
                sx={{ color: "#9ca3af", "&:hover": { color: "#3b82f6" } }}
              >
                <DownloadIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Tooltip>
            {onDelete && (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => onDelete(att.id)}
                  sx={{ color: "#9ca3af", "&:hover": { color: "#ef4444" } }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: "1rem" }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
