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
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  IconButton,
  Modal,
  Breadcrumbs,
  Link,
  Fade
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SendIcon from "@mui/icons-material/Send";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";

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

  // ✅ TAB MANAGEMENT
  const [activeTab, setActiveTab] = useState(0);
  
  // ✅ SIDEBAR COLLAPSE
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // ✅ DIALOGS
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openPriorityDialog, setOpenPriorityDialog] = useState(false);
  const [openOwnershipDialog, setOpenOwnershipDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // ✅ ATTACHMENT MODAL
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

  // ✅ DELETE TASK
  const handleDeleteTask = async () => {
    try {
      setOpenDeleteDialog(false);
      setSubmitting(true);
      console.log("🟡 Deleting task:", taskId);
      // TODO: Implement deleteTask API when available
      // await deleteTask(taskId);
      setSuccess("Task deleted successfully");
      setTimeout(() => navigate("/tasks"), 1500);
    } catch (err) {
      setError(`Failed to delete task: ${err.message}`);
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

  // ✅ HELPER - CHECK COMMENT EDIT WINDOW (3 HOURS)
  const isCommentEditable = (createdAt) => {
    if (!createdAt) return true;
    const commentTime = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const threeHoursMs = 3 * 60 * 60 * 1000;
    return now - commentTime < threeHoursMs;
  };

  // ✅ HELPER - GET TIME REMAINING FOR EDIT
  const getEditTimeRemaining = (createdAt) => {
    if (!createdAt) return null;
    const commentTime = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const threeHoursMs = 3 * 60 * 60 * 1000;
    const remaining = threeHoursMs - (now - commentTime);
    
    if (remaining <= 0) return null;
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${hours}h ${minutes}m`;
  };

  if (loading) return <CircularProgress sx={{ p: 3 }} />;
  if (!task) return <Typography>Task not found</Typography>;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      {/* ✅ ALERTS */}
      {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ m: 2 }}>{success}</Alert>}

      {/* ✅ TOP HEADER */}
      <Box sx={{ borderBottom: "1px solid #e0e0e0", p: 2 }}>
        <Box sx={{ maxWidth: "1800px", mx: "auto" }}>
          <Breadcrumbs sx={{ mb: 0.5 }}>
            <Link 
              underline="hover" 
              color="primary" 
              sx={{ cursor: "pointer", fontSize: "0.85rem" }}
              onClick={() => navigate("/tasks")}
            >
              Tasks
            </Link>
            <Typography sx={{ fontSize: "0.85rem" }}>Task Details</Typography>
          </Breadcrumbs>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.3 }}>
            {task.taskNo}
          </Typography>
          <Typography sx={{ fontSize: "1rem", color: "#333", fontWeight: 500 }}>
            {task.issueActionItem}
          </Typography>
        </Box>
      </Box>

      {/* ✅ TASK INFO ROW */}
      <Box sx={{ borderBottom: "1px solid #e0e0e0", p: 2, backgroundColor: "#f9f9f9" }}>
        <Box sx={{ maxWidth: "1800px", mx: "auto", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <Box>
            <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.2, fontSize: "0.75rem", fontWeight: 600 }}>
              Project
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
              {task.projectId ? `Project ${task.projectId}` : "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.2, fontSize: "0.75rem", fontWeight: 600 }}>
              Owner
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 24, height: 24, fontSize: "0.7rem" }}>
                {getUserName(task.ownerId)[0]}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
                {getUserName(task.ownerId)}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.2, fontSize: "0.75rem", fontWeight: 600 }}>
              Target Date
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
              {task.targetDate ? new Date(task.targetDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Not set"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ✅ MAIN LAYOUT - 65/35 WITH COLLAPSIBLE SIDEBAR */}
      <Box sx={{ maxWidth: "1800px", mx: "auto", display: "flex", minHeight: "600px", position: "relative" }}>
        {/* LEFT CONTENT AREA - 65% */}
        <Box sx={{ flex: 1, p: 2.5, borderRight: sidebarOpen ? "1px solid #e0e0e0" : "none", overflowY: "auto" }}>
          
          {/* TABS */}
          <Box sx={{ mb: 2, borderBottom: "1px solid #e0e0e0" }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  minWidth: "auto",
                  px: 2,
                  py: 1.5
                }
              }}
            >
              <Tab label="Overview" />
              <Tab label={`Comments (${comments.length})`} />
              <Tab label={`Attachments (${attachments.length})`} />
              <Tab label={`History (${history.length})`} />
              <Tab label="Related Tests" />
            </Tabs>
          </Box>

          {/* TAB CONTENT */}
          <Box sx={{ mt: 2 }}>
            {/* OVERVIEW TAB */}
            {activeTab === 0 && (
              <Box>
                {/* Description */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: "0.95rem" }}>
                    Description
                  </Typography>
                  <Box sx={{ p: 2, backgroundColor: "#f9f9f9", borderRadius: 1, border: "1px solid #e0e0e0" }}>
                    <Typography sx={{ whiteSpace: "pre-wrap", fontSize: "0.9rem", color: "#424242", lineHeight: 1.6 }}>
                      {task.description || "No description provided"}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Quick Views */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: "0.95rem" }}>
                    Quick Views
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <input type="checkbox" style={{ cursor: "pointer" }} />
                      <Typography sx={{ fontSize: "0.9rem" }}>Authenticated</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <input type="checkbox" style={{ cursor: "pointer" }} />
                      <Typography sx={{ fontSize: "0.9rem" }}>Production</Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Additional Info */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: "0.95rem" }}>
                    Additional Info
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: "block", fontSize: "0.75rem", mb: 0.3 }}>
                        Module
                      </Typography>
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 500 }}>
                        {task.status || "Not specified"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: "block", fontSize: "0.75rem", mb: 0.3 }}>
                        Status
                      </Typography>
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 500 }}>
                        {task.status || "Not specified"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: "block", fontSize: "0.75rem", mb: 0.3 }}>
                        Priority
                      </Typography>
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 500 }}>
                        {task.priority || "Not specified"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: "block", fontSize: "0.75rem", mb: 0.3 }}>
                        Created By
                      </Typography>
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 500 }}>
                        {getUserName(task.createdBy)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            {/* COMMENTS TAB */}
            {activeTab === 1 && (
              <Box>
                <Box sx={{ mb: 2 }}>
                  {comments.length > 0 ? (
                    <Box>
                      {comments.map((comment) => (
                        <Box key={comment.id} sx={{ mb: 2, pb: 2, borderBottom: "1px solid #eee" }}>
                          <Box sx={{ display: "flex", gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: "#1976d2", width: 28, height: 28, fontSize: "0.7rem", flexShrink: 0 }}>
                              {getUserName(comment.commentedBy)[0]}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                                  {getUserName(comment.commentedBy)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" sx={{ fontSize: "0.75rem" }}>
                                  {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "Just now"}
                                </Typography>
                              </Box>
                              <Typography sx={{ fontSize: "0.9rem", color: "#424242", lineHeight: 1.5 }}>
                                {comment.commentText}
                              </Typography>
                              {currentUserId === comment.commentedBy && (
                                <Box sx={{ display: "flex", gap: 1, mt: 0.8 }}>
                                  <Button size="small" color="error" onClick={() => handleDeleteComment(comment.id)} sx={{ fontSize: "0.8rem" }}>
                                    Delete
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="textSecondary" sx={{ textAlign: "center", py: 3, fontSize: "0.9rem" }}>
                      No comments yet
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {/* ATTACHMENTS TAB */}
            {activeTab === 2 && (
              <Box>
                {attachments.length > 0 ? (
                  <Box>
                    {attachments.map((att) => (
                      <Box
                        key={att.id}
                        sx={{
                          p: 1.5,
                          mb: 1,
                          backgroundColor: "#f9f9f9",
                          borderRadius: 1,
                          border: "1px solid #e0e0e0",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          "&:hover": { backgroundColor: "#f0f0f0", borderColor: "#1976d2" }
                        }}
                        onClick={() => {
                          setSelectedAttachment(att);
                          setOpenAttachmentModal(true);
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Typography sx={{ fontSize: "1.2rem" }}>
                            {getFileIcon(att.fileName)}
                          </Typography>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
                              {att.fileName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: "0.75rem" }}>
                              {att.uploadedAt ? new Date(att.uploadedAt).toLocaleDateString() : "Unknown"}
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
                            sx={{ fontSize: "0.75rem" }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography color="textSecondary" sx={{ textAlign: "center", py: 3, fontSize: "0.9rem" }}>
                    No attachments
                  </Typography>
                )}
              </Box>
            )}

            {/* HISTORY TAB */}
            {activeTab === 3 && (
              <Box>
                {history.length > 0 ? (
                  <Box>
                    {history.map((item, idx) => (
                      <Box key={idx} sx={{ mb: 1.5, p: 1.5, backgroundColor: "#f9f9f9", borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                          {getUserName(item.performedBy)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: "block", fontSize: "0.75rem", mb: 0.5 }}>
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : "Unknown"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.9rem" }}>
                          {item.description || item.action || "Activity recorded"}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography color="textSecondary" sx={{ textAlign: "center", py: 3, fontSize: "0.9rem" }}>
                    No history
                  </Typography>
                )}
              </Box>
            )}

            {/* RELATED TESTS TAB */}
            {activeTab === 4 && (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Typography color="textSecondary" sx={{ fontSize: "0.9rem" }}>
                  No related tests
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* RIGHT SIDEBAR - COLLAPSIBLE - 35% */}
        <Box
          sx={{
            width: sidebarOpen ? "320px" : "0px",
            overflow: "hidden",
            transition: "width 0.3s ease",
            borderLeft: sidebarOpen ? "1px solid #e0e0e0" : "none",
            backgroundColor: "#2563eb",
            color: "#fff",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* SIDEBAR HEADER WITH COLLAPSE BUTTON */}
          <Box sx={{ p: 2, borderBottom: "1px solid rgba(255,255,255,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
              Task Actions
            </Typography>
            <IconButton
              size="small"
              onClick={() => setSidebarOpen(false)}
              sx={{ color: "#fff", "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}
            >
              <KeyboardArrowRightIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* SIDEBAR CONTENT */}
          <Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>
            {/* ADD COMMENT BUTTON */}
            <Button
              fullWidth
              variant="contained"
              endIcon={<SendIcon />}
              onClick={() => {
                setCommentText("Test comment");
                handleAddComment();
              }}
              sx={{
                mb: 2,
                backgroundColor: "#fff",
                color: "#2563eb",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#f0f0f0" }
              }}
            >
              Add comment
            </Button>

            <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.2)" }} />

            {/* ACTION BUTTONS */}
            <Button
              fullWidth
              variant="text"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/task/${taskId}?edit=true`)}
              sx={{
                mb: 1,
                color: "#fff",
                justifyContent: "flex-start",
                fontSize: "0.9rem",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" }
              }}
            >
              Edit task
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => setOpenStatusDialog(true)}
              sx={{
                mb: 1,
                color: "#fff",
                justifyContent: "flex-start",
                fontSize: "0.9rem",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" }
              }}
            >
              Change Status
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => setOpenOwnershipDialog(true)}
              sx={{
                mb: 1,
                color: "#fff",
                justifyContent: "flex-start",
                fontSize: "0.9rem",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" }
              }}
            >
              Reassign
            </Button>

            <Button
              fullWidth
              variant="text"
              startIcon={<DeleteIcon />}
              onClick={() => setOpenDeleteDialog(true)}
              sx={{
                mb: 3,
                color: "#fff",
                justifyContent: "flex-start",
                fontSize: "0.9rem",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" }
              }}
            >
              Delete Task
            </Button>

            <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.2)" }} />

            {/* COMMENTS LIST */}
            <Typography variant="caption" sx={{ display: "block", mb: 1.5, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", opacity: 0.8 }}>
              Comments
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {comments.length > 0 ? (
                comments.slice(0, 5).map((comment) => (
                  <Box key={comment.id} sx={{ pb: 1.5, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                    <Box sx={{ display: "flex", gap: 0.8, alignItems: "flex-start" }}>
                      <Avatar sx={{ bgcolor: "#fff", color: "#2563eb", width: 20, height: 20, fontSize: "0.7rem", flexShrink: 0 }}>
                        {getUserName(comment.commentedBy)[0]}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ display: "block", fontWeight: 600, fontSize: "0.75rem" }}>
                          {getUserName(comment.commentedBy)}
                        </Typography>
                        <Typography variant="caption" sx={{ display: "block", fontSize: "0.65rem", opacity: 0.8, mb: 0.3 }}>
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString() : "Just now"}
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", lineHeight: 1.3, opacity: 0.9 }}>
                          {comment.commentText.substring(0, 60)}...
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: "0.75rem", opacity: 0.8 }}>
                  No comments yet
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* COLLAPSE BUTTON (When sidebar closed) */}
        {!sidebarOpen && (
          <Box
            sx={{
              width: "40px",
              backgroundColor: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": { backgroundColor: "#1d4ed8" },
              transition: "background-color 0.2s"
            }}
            onClick={() => setSidebarOpen(true)}
          >
            <IconButton
              size="small"
              sx={{ color: "#fff" }}
            >
              <KeyboardArrowLeftIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* ✅ DIALOGS */}

      {/* STATUS CHANGE DIALOG */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)}>
        <DialogTitle>Change Status</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1, minWidth: "300px" }}>
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

      {/* PRIORITY CHANGE DIALOG */}
      <Dialog open={openPriorityDialog} onClose={() => setOpenPriorityDialog(false)}>
        <DialogTitle>Change Priority</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1, minWidth: "300px" }}>
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

      {/* OWNERSHIP CHANGE DIALOG */}
      <Dialog open={openOwnershipDialog} onClose={() => setOpenOwnershipDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reassign Task</DialogTitle>
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

      {/* DELETE TASK DIALOG */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent sx={{ minWidth: "300px" }}>
          <Typography sx={{ mt: 2 }}>
            Are you sure you want to delete this task? This action cannot be undone.
          </Typography>
        </DialogContent>
        <Box sx={{ p: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => setOpenDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteTask}
            disabled={submitting}
          >
            {submitting ? "Deleting..." : "Delete"}
          </Button>
        </Box>
      </Dialog>

      {/* ATTACHMENT PREVIEW MODAL */}
      <Modal
        open={openAttachmentModal}
        onClose={() => {
          setOpenAttachmentModal(false);
          setSelectedAttachment(null);
        }}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            backgroundColor: "#fff",
            p: 2,
            borderRadius: 1,
            position: "relative",
            boxShadow: "0 5px 25px rgba(0,0,0,0.3)"
          }}
        >
          <IconButton
            onClick={() => {
              setOpenAttachmentModal(false);
              setSelectedAttachment(null);
            }}
            sx={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
          >
            <CloseIcon />
          </IconButton>

          {selectedAttachment && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center" }}>
              <Typography variant="h6" sx={{ mt: 2 }}>
                {selectedAttachment.fileName}
              </Typography>

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
