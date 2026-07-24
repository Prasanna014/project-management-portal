import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Alert,
  Chip,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  IconButton,
  Modal
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";

import { getTaskById, updateTask } from "../services/taskService";
import { getComments, addComment, deleteComment } from "../services/taskCommentService";
import { getAttachments, uploadAttachment, deleteAttachment } from "../services/attachmentService";
import { getActivity } from "../services/activityService";
import { getUsers } from "../services/userServices";


export default function TaskDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const taskId = params.taskId;
  const currentUserId = Number(import.meta.env.VITE_DEFAULT_USER_ID || 1);

  // ✅ STATE
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [commentText, setCommentText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openPriorityDialog, setOpenPriorityDialog] = useState(false);
  const [openOwnershipDialog, setOpenOwnershipDialog] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [openAttachmentModal, setOpenAttachmentModal] = useState(false);

  // ✅ LOAD ALL DATA
  const loadAll = async () => {
    try {
      setLoading(true);
      console.log("🟡 Loading task ID:", taskId);
      
      const taskRes = await getTaskById(taskId);
      const commentsRes = await getComments(taskId);
      const attachRes = await getAttachments(taskId);
      const historyRes = await getActivity(taskId);
      const usersRes = await getUsers();

      setTask(taskRes);
      setComments(commentsRes || []);
      setAttachments(attachRes || []);
      setHistory(historyRes || []);
      setUsers(usersRes || []);
    } catch (err) {
      console.error("❌ Error loading task:", err);
      setError(`Failed to load task: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) loadAll();
  }, [taskId]);

  // ✅ QUICK UPDATE - STATUS
  const handleStatusChange = async (newStatus) => {
    try {
      setOpenStatusDialog(false);
      setSubmitting(true);
      await updateTask(taskId, { ...task, status: newStatus });
      setTask({ ...task, status: newStatus });
      setSuccess(`Status changed to ${newStatus}`);
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ QUICK UPDATE - PRIORITY
  const handlePriorityChange = async (newPriority) => {
    try {
      setOpenPriorityDialog(false);
      setSubmitting(true);
      await updateTask(taskId, { ...task, priority: newPriority });
      setTask({ ...task, priority: newPriority });
      setSuccess(`Priority changed to ${newPriority}`);
    } catch (err) {
      setError(`Failed to update priority: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ QUICK UPDATE - OWNERSHIP
  const handleOwnershipChange = async (newOwnerId) => {
    try {
      setOpenOwnershipDialog(false);
      setSubmitting(true);
      await updateTask(taskId, { ...task, ownerId: newOwnerId });
      setTask({ ...task, ownerId: newOwnerId });
      const ownerName = users.find(u => u.id === newOwnerId)?.fullName || `User ${newOwnerId}`;
      setSuccess(`Task assigned to ${ownerName}`);
    } catch (err) {
      setError(`Failed to update ownership: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ ADD COMMENT
  const handleAddComment = async () => {
    if (!commentText.trim()) {
      setError("Comment cannot be empty");
      return;
    }
    try {
      setSubmitting(true);
      await addComment(taskId, {
        commentText,
        commentedBy: currentUserId
      });
      if (selectedFile) {
        await uploadAttachment(taskId, selectedFile, currentUserId);
        setSelectedFile(null);
      }
      setSuccess("Comment added successfully");
      setCommentText("");
      loadAll();
    } catch (err) {
      setError(`Failed to add comment: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ DELETE COMMENT
  const handleDeleteComment = async (id) => {
    try {
      await deleteComment(id);
      setSuccess("Comment deleted");
      loadAll();
    } catch (err) {
      setError(`Failed to delete comment: ${err.message}`);
    }
  };

  // ✅ DELETE ATTACHMENT
  const handleDeleteAttachment = async (id) => {
    try {
      await deleteAttachment(id);
      setSuccess("Attachment deleted");
      loadAll();
    } catch (err) {
      setError(`Failed to delete attachment: ${err.message}`);
    }
  };

  // ✅ HELPER - STATUS COLOR
  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "default";
      case "In Progress":
        return "warning";
      case "Closed":
        return "success";
      case "On Hold":
        return "error";
      default:
        return "default";
    }
  };

  // ✅ HELPER - PRIORITY COLOR
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Low":
        return "success";
      case "Medium":
        return "info";
      case "High":
        return "warning";
      case "Critical":
        return "error";
      default:
        return "default";
    }
  };

  // ✅ HELPER - GET USER NAME
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.fullName || `User ${userId}`;
  };

  // ✅ HELPER - CHECK IF IMAGE
  const isImage = (fileName) => {
    const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
    return imageExts.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  // ✅ HELPER - GET FILE ICON
  const getFileIcon = (fileName) => {
    if (isImage(fileName)) return "🖼️";
    if (fileName.endsWith(".pdf")) return "📕";
    if (fileName.endsWith(".zip") || fileName.endsWith(".rar")) return "📦";
    if ([".doc", ".docx", ".txt"].some(ext => fileName.endsWith(ext))) return "📄";
    return "📎";
  };

  if (loading) return <CircularProgress sx={{ p: 3 }} />;
  if (!task) return <Typography>Task not found</Typography>;

  return (
    <Box sx={{ p: 3, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* ✅ HEADER BAR */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Typography variant="h6">{task.taskNo}</Typography>
        <Box sx={{ ml: "auto" }} />
        <Button 
          startIcon={<EditIcon />} 
          variant="outlined"
          onClick={() => navigate(`/task/${taskId}?edit=true`)}
        >
          Edit
        </Button>
      </Box>

      {/* ✅ MAIN LAYOUT - Two Column */}
      <Grid container spacing={3}>
        {/* ✅ LEFT COLUMN - Main Content */}
        <Grid item xs={12} md={8}>
          {/* TITLE & DESCRIPTION */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                {task.issueActionItem}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                Description
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
                {task.description || "No description provided"}
              </Typography>
            </CardContent>
          </Card>

          {/* COMMENTS SECTION */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                💬 Comments & Activity
              </Typography>

              {/* ADD COMMENT */}
              <Box sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button 
                    variant="contained" 
                    onClick={handleAddComment}
                    disabled={submitting}
                  >
                    {submitting ? "Posting..." : "Post"}
                  </Button>
                  <Button variant="outlined" component="label">
                    📎 Attach File
                    <input hidden type="file" onChange={(e) => setSelectedFile(e.target.files?.[0])} />
                  </Button>
                  {selectedFile && (
                    <Chip 
                      label={selectedFile.name} 
                      onDelete={() => setSelectedFile(null)} 
                    />
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* COMMENTS LIST */}
              {comments.length > 0 ? (
                <Box>
                  {comments.map((comment) => (
                    <Box key={comment.id} sx={{ mb: 3, pb: 2, borderBottom: "1px solid #eee" }}>
                      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                        <Avatar sx={{ bgcolor: "#1976d2", width: 32, height: 32 }}>
                          {getUserName(comment.commentedBy)[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {getUserName(comment.commentedBy)}
                            </Typography>
                            <Button 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              Delete
                            </Button>
                          </Box>
                          <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.5 }}>
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "Just now"}
                          </Typography>
                          <Typography sx={{ whiteSpace: "pre-wrap", fontSize: "0.95rem", mb: 1 }}>
                            {comment.commentText}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="textSecondary">No comments yet. Be the first to comment!</Typography>
              )}
            </CardContent>
          </Card>

          {/* ATTACHMENTS SECTION */}
          {attachments.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  📎 Attachments ({attachments.length})
                </Typography>
                <Box>
                  {attachments.map((att) => (
                    <Box 
                      key={att.id} 
                      sx={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        p: 1.5,
                        mb: 1,
                        backgroundColor: "#f9f9f9",
                        borderRadius: 1,
                        border: "1px solid #e0e0e0",
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "#f0f0f0", borderColor: "#1976d2" }
                      }}
                      onClick={() => {
                        setSelectedAttachment(att);
                        setOpenAttachmentModal(true);
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontSize: "1.2rem" }}>
                          {getFileIcon(att.fileName)}
                        </Typography>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {att.fileName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            🕐 {att.uploadedAt ? new Date(att.uploadedAt).toLocaleDateString() : "Unknown"}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`data:application/octet-stream;base64,${att.fileData}`, "_blank");
                          }}
                          title="Download"
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        <Button 
                          size="small" 
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAttachment(att.id);
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* HISTORY SECTION */}
          {history.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  📜 Activity History
                </Typography>
                <Box>
                  {history.map((item, idx) => (
                    <Box key={idx} sx={{ mb: 2, pb: 2, borderBottom: idx !== history.length - 1 ? "1px solid #eee" : "none" }}>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                        <Avatar sx={{ bgcolor: "#FF9800", width: 28, height: 28, fontSize: "0.75rem" }}>
                          {getUserName(item.performedBy)[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {getUserName(item.performedBy)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.5 }}>
                            {item.timestamp ? new Date(item.timestamp).toLocaleString() : "Unknown"}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {item.description || item.action || "Activity recorded"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* ✅ RIGHT COLUMN - Sidebar (Metadata & Quick Actions) */}
        <Grid item xs={12} md={4}>
          {/* TASK METADATA CARD */}
          <Card sx={{ mb: 2, position: "sticky", top: 20 }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
                Task Details
              </Typography>

              {/* STATUS - CLICKABLE */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.5 }}>
                  STATUS
                </Typography>
                <Box
                  onClick={() => setOpenStatusDialog(true)}
                  sx={{
                    p: 1,
                    border: "2px solid #e0e0e0",
                    borderRadius: 1,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#f5f5f5" }
                  }}
                >
                  <Chip 
                    label={task.status} 
                    color={getStatusColor(task.status)}
                    variant="outlined"
                    sx={{ cursor: "pointer" }}
                  />
                </Box>
              </Box>

              {/* PRIORITY - CLICKABLE */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.5 }}>
                  PRIORITY
                </Typography>
                <Box
                  onClick={() => setOpenPriorityDialog(true)}
                  sx={{
                    p: 1,
                    border: "2px solid #e0e0e0",
                    borderRadius: 1,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#f5f5f5" }
                  }}
                >
                  <Chip 
                    label={task.priority} 
                    color={getPriorityColor(task.priority)}
                    variant="outlined"
                    sx={{ cursor: "pointer" }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* DATES */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                  TARGET DATE
                </Typography>
                <Typography sx={{ fontSize: "0.9rem" }}>
                  {task.targetDate ? new Date(task.targetDate).toLocaleDateString() : "Not set"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                  CREATED
                </Typography>
                <Typography sx={{ fontSize: "0.9rem" }}>
                  {new Date(task.createdAt).toLocaleDateString()}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                  UPDATED
                </Typography>
                <Typography sx={{ fontSize: "0.9rem" }}>
                  {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : "Never"}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* ASSIGNED TO - CLICKABLE */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.5 }}>
                  ASSIGNED TO
                </Typography>
                <Box
                  onClick={() => setOpenOwnershipDialog(true)}
                  sx={{
                    p: 1,
                    border: "2px solid #e0e0e0",
                    borderRadius: 1,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#f5f5f5" }
                  }}
                >
                  <Chip 
                    label={getUserName(task.ownerId)} 
                    avatar={<Avatar sx={{ bgcolor: "#2196F3" }}>{getUserName(task.ownerId)[0]}</Avatar>}
                    sx={{ cursor: "pointer" }}
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.5 }}>
                  CREATED BY
                </Typography>
                <Chip 
                  label={getUserName(task.createdBy)}
                  avatar={<Avatar sx={{ bgcolor: "#4CAF50" }}>{getUserName(task.createdBy)[0]}</Avatar>}
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ✅ STATUS CHANGE DIALOG */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)}>
        <DialogTitle>Change Status</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
            {["Open", "In Progress", "Closed", "On Hold"].map((status) => (
              <Button
                key={status}
                variant={task.status === status ? "contained" : "outlined"}
                fullWidth
                onClick={() => handleStatusChange(status)}
                disabled={submitting}
              >
                {status}
              </Button>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* ✅ PRIORITY CHANGE DIALOG */}
      <Dialog open={openPriorityDialog} onClose={() => setOpenPriorityDialog(false)}>
        <DialogTitle>Change Priority</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
            {["Low", "Medium", "High", "Critical"].map((priority) => (
              <Button
                key={priority}
                variant={task.priority === priority ? "contained" : "outlined"}
                fullWidth
                onClick={() => handlePriorityChange(priority)}
                disabled={submitting}
              >
                {priority}
              </Button>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* ✅ OWNERSHIP CHANGE DIALOG */}
      <Dialog open={openOwnershipDialog} onClose={() => setOpenOwnershipDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Task To</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
            {users.map((user) => (
              <Button
                key={user.id}
                variant={task.ownerId === user.id ? "contained" : "outlined"}
                fullWidth
                onClick={() => handleOwnershipChange(user.id)}
                disabled={submitting}
              >
                {user.fullName || `User ${user.id}`}
              </Button>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* ✅ ATTACHMENT PREVIEW MODAL */}
      <Modal 
        open={openAttachmentModal} 
        onClose={() => {
          setOpenAttachmentModal(false);
          setSelectedAttachment(null);
        }}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box sx={{ 
          maxWidth: "90vw", 
          maxHeight: "90vh", 
          backgroundColor: "#fff", 
          p: 2, 
          borderRadius: 1,
          position: "relative"
        }}>
          <IconButton
            onClick={() => {
              setOpenAttachmentModal(false);
              setSelectedAttachment(null);
            }}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          {selectedAttachment && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center" }}>
              <Typography variant="h6">{selectedAttachment.fileName}</Typography>
              
              {isImage(selectedAttachment.fileName) ? (
                <Box
                  component="img"
                  src={`data:image/*;base64,${selectedAttachment.fileData}`}
                  alt={selectedAttachment.fileName}
                  sx={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 1 }}
                />
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    {getFileIcon(selectedAttachment.fileName)}
                  </Typography>
                  <Typography color="textSecondary" sx={{ mb: 2 }}>
                    Preview not available for this file type
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      window.open(`data:application/octet-stream;base64,${selectedAttachment.fileData}`, "_blank");
                    }}
                  >
                    Download File
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
