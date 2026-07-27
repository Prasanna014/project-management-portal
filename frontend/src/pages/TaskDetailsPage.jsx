import React, { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  MenuItem,
  TextField,
  Alert,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  IconButton,
  Modal,
  Fade,
  Breadcrumbs,
  Link,
  Tooltip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import DownloadIcon from "@mui/icons-material/Download";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import StatusChip from "../components/StatusChip";
import PriorityChip from "../components/PriorityChip";
import ActivityTimeline from "../components/ActivityTimeline";
import CommentTimeline from "../components/CommentTimeline";
import AttachmentTable from "../components/AttachmentTable";
import { useProject } from "../contexts/ProjectContext";

import {
  addTaskDetailsComment,
  editTaskDetailsComment,
  deleteTaskDetailsAttachment,
  deleteTaskDetailsComment,
  isTaskDetailsMockMode,
  loadTaskDetailsPageData,
  updateTaskDetails,
} from "../services/taskDetailsDataSource";

// â”€â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AVATAR_COLORS = ["#3b82f6","#8b5cf6","#ec4899","#f59e0b","#10b981","#ef4444"];
const avatarColor = (id) => AVATAR_COLORS[(Number(id) || 0) % AVATAR_COLORS.length];

const IMAGE_EXTS = [".jpg",".jpeg",".png",".gif",".webp",".bmp"];
const isImage = (name) => IMAGE_EXTS.some(e => name?.toLowerCase().endsWith(e));

const fmtDate = (ts) =>
  ts
    ? new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Not set";

const getInitials = (name) => {
  if (!name) return "U";
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
};


export default function TaskDetailsPage() {
  const params        = useParams();
  const navigate      = useNavigate();
  const taskId        = params.taskId;
  const currentUserId = Number(import.meta.env.VITE_DEFAULT_USER_ID || 1);
  const usingMockData = isTaskDetailsMockMode;
  const commentInputRef = useRef(null);
  const { projects } = useProject();
  const [task,        setTask]        = useState(null);
  const [comments,    setComments]    = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [history,     setHistory]     = useState([]);
  const [users,       setUsers]       = useState([]);
  const [commentText,   setCommentText]   = useState("");
  const [selectedFile,  setSelectedFile]  = useState(null);
  const [error,         setError]         = useState("");
  const [success,       setSuccess]       = useState("");
  const [loading,       setLoading]       = useState(false);
  const [submitting,    setSubmitting]    = useState(false);

 
  const [activeTab, setActiveTab] = useState(0);
  const [openStatusDialog,    setOpenStatusDialog]    = useState(false);
  const [openPriorityDialog,  setOpenPriorityDialog]  = useState(false);
  const [openOwnershipDialog, setOpenOwnershipDialog] = useState(false);
  const [openDeleteDialog,    setOpenDeleteDialog]    = useState(false);
  const [openEditDialog,      setOpenEditDialog]      = useState(false);
  const [selectedAttachment,  setSelectedAttachment]  = useState(null);
  const [openAttachmentModal, setOpenAttachmentModal] = useState(false);
  const [editForm, setEditForm] = useState({
    issueActionItem: "",
    description: "",
    priority: "Medium",
    ownerId: "",
    targetDate: "",
  });

  const mapPriorityForApi = (priority) => (priority === "Critical" ? "High" : priority);


  const loadAll = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError("");

      if (usingMockData) {
        const pageData = await loadTaskDetailsPageData(taskId, currentUserId);
        setTask(pageData.task || null);
        setComments(pageData.comments || []);
        setAttachments(pageData.attachments || []);
        setHistory(pageData.history || []);
        setUsers(pageData.users || []);
        return;
      }

      const [{ getTaskById }, { getComments }, { getAttachments }, { getActivity }, { getUsers }] = await Promise.all([
        import("../services/taskService"),
        import("../services/taskCommentService"),
        import("../services/attachmentService"),
        import("../services/activityService"),
        import("../services/userServices"),
      ]);

      const coreTask = await getTaskById(taskId);
      setTask(coreTask || null);

      const [commentsRes, attachmentsRes, historyRes, usersRes] = await Promise.allSettled([
        getComments(taskId),
        getAttachments(taskId),
        getActivity(taskId),
        getUsers(),
      ]);

      setComments(commentsRes.status === "fulfilled" ? (commentsRes.value || []) : []);
      setAttachments(attachmentsRes.status === "fulfilled" ? (attachmentsRes.value || []) : []);
      setHistory(historyRes.status === "fulfilled" ? (historyRes.value || []) : []);
      setUsers(usersRes.status === "fulfilled" ? (usersRes.value || []) : []);

      const partialFailures = [commentsRes, attachmentsRes, historyRes, usersRes].some(
        (result) => result.status === "rejected"
      );
      if (partialFailures) {
        setSuccess("Task loaded. Some related sections could not be loaded.");
      }
    } catch (err) {
      setError(`Failed to load task: ${err.message}`);
      setTask(null);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => { if (taskId) loadAll(); }, [taskId]);

  useEffect(() => {
    if (!success) return;

    const timer = window.setTimeout(() => {
      setSuccess("");
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [success]);


  const handleStatusChange = async (newStatus) => {
    try {
      setOpenStatusDialog(false);
      setSubmitting(true);
      setTask((prev) => (prev ? { ...prev, statusId: null, status: newStatus } : prev));
      const updated = await updateTaskDetails(
        taskId,
        { ...task, statusId: null, status: newStatus },
        currentUserId
      );
      setTask(updated || { ...task, status: newStatus });
      await loadAll({ silent: true });
      setSuccess(`Status changed to ${newStatus}`);
    } catch (err) { setError(`Failed to update status: ${err.message}`); }
    finally       { setSubmitting(false); }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      setOpenPriorityDialog(false);
      setSubmitting(true);
      const mappedPriority = mapPriorityForApi(newPriority);
      setTask((prev) => (prev ? { ...prev, priorityId: null, priority: mappedPriority } : prev));
      const updated = await updateTaskDetails(
        taskId,
        { ...task, priorityId: null, priority: mappedPriority },
        currentUserId
      );
      setTask(updated || { ...task, priority: mappedPriority });
      await loadAll({ silent: true });
      setSuccess(`Priority changed to ${newPriority}`);
    } catch (err) { setError(`Failed to update priority: ${err.message}`); }
    finally       { setSubmitting(false); }
  };

  const handleOwnershipChange = async (newOwnerId) => {
    try {
      setOpenOwnershipDialog(false);
      setSubmitting(true);
      const normalizedOwnerId = Number(newOwnerId);
      setTask((prev) => (prev ? { ...prev, ownerId: normalizedOwnerId } : prev));
      const updated = await updateTaskDetails(taskId, { ...task, ownerId: normalizedOwnerId }, currentUserId);
      setTask(updated || { ...task, ownerId: normalizedOwnerId });
      await loadAll({ silent: true });
      const ownerName = users.find(u => Number(u.id) === normalizedOwnerId)?.fullName || `User ${normalizedOwnerId}`;
      setSuccess(`Task assigned to ${ownerName}`);
    } catch (err) { setError(`Failed to update ownership: ${err.message}`); }
    finally       { setSubmitting(false); }
  };

  const openEditTaskDialog = () => {
    setEditForm({
      issueActionItem: task.issueActionItem || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      ownerId: task.ownerId ?? "",
      targetDate: task.targetDate ? String(task.targetDate).slice(0, 10) : "",
    });
    setOpenEditDialog(true);
  };

  const handleEditSave = async () => {
    if (!editForm.issueActionItem.trim()) {
      setError("Task name is required");
      return;
    }

    try {
      setSubmitting(true);
      const mappedPriority = mapPriorityForApi(editForm.priority);
      const payload = {
        ...task,
        issueActionItem: editForm.issueActionItem.trim(),
        description: editForm.description,
        priorityId: null,
        priority: mappedPriority,
        ownerId: editForm.ownerId ? Number(editForm.ownerId) : null,
        targetDate: editForm.targetDate || null,
      };

      const updated = await updateTaskDetails(taskId, payload, currentUserId);
      setTask(updated || { ...task, ...payload });
      setOpenEditDialog(false);
      await loadAll({ silent: true });
      setSuccess("Task updated successfully");
    } catch (err) {
      setError(`Failed to update task: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    try {
      setOpenDeleteDialog(false);
      setSubmitting(true);
      setSuccess("Task deleted successfully");
      setTimeout(() => navigate("/tasks"), 1500);
    } catch (err) { setError(`Failed to delete task: ${err.message}`); }
    finally       { setSubmitting(false); }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) { setError("Comment cannot be empty"); return; }
    const optimisticId = `tmp-${Date.now()}`;
    try {
      setSubmitting(true);
      const draft = commentText.trim();
      const optimisticComment = {
        id: optimisticId,
        taskId: Number(taskId),
        commentText: draft,
        commentedBy: currentUserId,
        commentedAt: new Date().toISOString(),
      };
      setComments((prev) => [optimisticComment, ...prev]);

      const created = await addTaskDetailsComment(
        taskId,
        { commentText: draft, commentedBy: currentUserId },
        selectedFile,
        currentUserId
      );
      if (created) {
        setComments((prev) => prev.map((comment) => (comment.id === optimisticComment.id ? created : comment)));
      }
      setSelectedFile(null);
      setCommentText("");
      setSuccess("Comment added");
      await loadAll({ silent: true });
    } catch (err) {
      setComments((prev) => prev.filter((comment) => String(comment.id) !== optimisticId));
      setError(`Failed to add comment: ${err.message}`);
    }
    finally       { setSubmitting(false); }
  };

  const handleEditComment = async (id, nextText) => {
    try {
      setComments((prev) => prev.map((comment) => (
        Number(comment.id) === Number(id)
          ? { ...comment, commentText: nextText, commentedAt: comment.commentedAt || comment.createdAt || new Date().toISOString() }
          : comment
      )));

      await editTaskDetailsComment(taskId, id, nextText, currentUserId);
      setSuccess("Comment updated");
      await loadAll({ silent: true });
    } catch (err) {
      await loadAll({ silent: true });
      setError(`Failed to update comment: ${err.message}`);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      setComments((prev) => prev.filter((comment) => Number(comment.id) !== Number(id)));
      await deleteTaskDetailsComment(taskId, id, currentUserId);
      setSuccess("Comment deleted");
      await loadAll({ silent: true });
    } catch (err) { setError(`Failed to delete comment: ${err.message}`); }
  };

  const handleDeleteAttachment = async (id) => {
    try {
      await deleteTaskDetailsAttachment(taskId, id, currentUserId);
      setSuccess("Attachment deleted");
      await loadAll();
    } catch (err) { setError(`Failed to delete attachment: ${err.message}`); }
  };

 
  const getUserName = (userId) => {
    const u = users.find(u => u.id === userId);
    return u?.fullName || `User ${userId}`;
  };

  const getProjectName = (projectId) => {
    const p = projects.find(p => String(p.id) === String(projectId));
    return p?.projectName || p?.name || (projectId ? `Project ${projectId}` : null);
  };

  const isCommentEditable = (createdAt) => {
    if (!createdAt) return true;
    return Date.now() - new Date(createdAt).getTime() < 3 * 60 * 60 * 1000;
  };


  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography color="text.secondary">Task not found.</Typography>
      </Box>
    );
  }

  const cardSx      = { boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderRadius: "12px", p: 0 };
  const sectionLabel = {
    fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af",
    textTransform: "uppercase", letterSpacing: "0.07em", mb: 1,
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

      {/* â”€â”€ ALERTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ borderRadius: "8px" }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} sx={{ borderRadius: "8px" }}>
          {success}
        </Alert>
      )}
      {usingMockData && (
        <Alert severity="info" sx={{ borderRadius: "8px" }}>
          Running in development mock mode
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon fontSize="small" />}
          onClick={() => navigate("/tasks")}
          sx={{
            borderRadius: "8px",
            fontSize: "0.78rem",
            fontWeight: 600,
            borderColor: "#e5e7eb",
            color: "#374151",
            "&:hover": { borderColor: "#2563eb", color: "#2563eb", bgcolor: "#eff6ff" },
          }}
        >
          Back to Tasks
        </Button>
      </Box>

      {/* â”€â”€ HEADER CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Card sx={cardSx}>
        <CardContent sx={{ p: "20px 24px !important" }}>
          <Breadcrumbs
            separator={<NavigateNextIcon sx={{ fontSize: "0.85rem", color: "#d1d5db" }} />}
            sx={{ mb: 1.5 }}
          >
            <Link
              underline="hover"
              onClick={() => navigate("/tasks")}
              sx={{ cursor: "pointer", fontSize: "0.78rem", color: "#6b7280", "&:hover": { color: "#2563eb" } }}
            >
              Tasks
            </Link>
            <Typography sx={{ fontSize: "0.78rem", color: "#374151" }}>{task.taskNo}</Typography>
          </Breadcrumbs>

          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 2 }}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#9ca3af", mb: 0.3 }}>
                {task.taskNo}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
                {task.issueActionItem}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.2,
                py: 0.9,
                borderRadius: "10px",
                bgcolor: "#f8fafc",
                border: "1px solid #e5e7eb",
                minWidth: 200,
              }}
            >
              <Avatar sx={{ width: 34, height: 34, fontSize: "0.8rem", fontWeight: 700, bgcolor: avatarColor(task.ownerId) }}>
                {getInitials(getUserName(task.ownerId))}
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: "0.68rem", color: "#9ca3af", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Assigned Engineer
                </Typography>
                <Typography sx={{ fontSize: "0.83rem", color: "#111827", fontWeight: 600 }}>
                  {getUserName(task.ownerId)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Meta strip */}
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "center" }}>
            {[
              { label: "Status",   node: <StatusChip status={task.status} /> },
              { label: "Priority", node: <PriorityChip priority={task.priority} /> },
              {
                label: "Owner",
                node: (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <Avatar sx={{ width: 20, height: 20, fontSize: "0.6rem", bgcolor: avatarColor(task.ownerId) }}>
                      {getInitials(getUserName(task.ownerId))}
                    </Avatar>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>
                      {getUserName(task.ownerId)}
                    </Typography>
                  </Box>
                ),
              },
              {
                label: "Target",
                node: (
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>
                    {fmtDate(task.targetDate)}
                  </Typography>
                ),
              },
              ...(task.projectId ? [{
                label: "Project",
                node: (
                  <Chip
                    label={getProjectName(task.projectId)}
                    size="small"
                    sx={{ bgcolor: "#EEF2FF", color: "#4F46E5", fontWeight: 600, fontSize: "0.72rem", height: 20 }}
                  />
                ),
              }] : []),
            ].map(({ label, node }) => (
              <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                <Typography sx={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: 500 }}>{label}</Typography>
                {node}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* ── ACTION BAR ──────────────────────────────────────────────────────── */}
      <Card sx={{ ...cardSx, bgcolor: "#FAFBFF" }}>
        <CardContent sx={{ p: "12px 20px !important" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <Button variant="contained" size="small" startIcon={<EditIcon fontSize="small" />}
              onClick={openEditTaskDialog}
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, fontSize: "0.82rem",
                   bgcolor: "#4F46E5", "&:hover": { bgcolor: "#4338CA" } }}>
              Edit Ticket
            </Button>
            <Button variant="outlined" size="small" startIcon={<SwapHorizIcon fontSize="small" />}
              onClick={() => setOpenStatusDialog(true)}
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, fontSize: "0.82rem",
                   borderColor: "#E2E8F0", color: "#374151",
                   "&:hover": { borderColor: "#4F46E5", color: "#4F46E5", bgcolor: "#EEF2FF" } }}>
              Change Status
            </Button>
            <Button variant="outlined" size="small"
              onClick={() => setOpenPriorityDialog(true)}
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, fontSize: "0.82rem",
                   borderColor: "#E2E8F0", color: "#374151",
                   "&:hover": { borderColor: "#4F46E5", color: "#4F46E5", bgcolor: "#EEF2FF" } }}>
              Change Priority
            </Button>
            <Button variant="outlined" size="small" startIcon={<PersonOutlineIcon fontSize="small" />}
              onClick={() => setOpenOwnershipDialog(true)}
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, fontSize: "0.82rem",
                   borderColor: "#E2E8F0", color: "#374151",
                   "&:hover": { borderColor: "#4F46E5", color: "#4F46E5", bgcolor: "#EEF2FF" } }}>
              Assign Engineer
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button variant="outlined" size="small" color="error" startIcon={<DeleteIcon fontSize="small" />}
              onClick={() => setOpenDeleteDialog(true)}
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, fontSize: "0.82rem" }}>
              Delete Ticket
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ── MAIN CONTENT (full-width) ───────────────────────────────────────── */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

          {/* TABS CARD */}
          <Card sx={cardSx}>
            <Box sx={{ borderBottom: "1px solid #f3f4f6" }}>
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{
                  px: 3,
                  "& .MuiTab-root": {
                    textTransform: "none", fontSize: "0.85rem", fontWeight: 500,
                    color: "#6b7280", minWidth: "auto", px: 2, py: 1.75,
                    "&.Mui-selected": { color: "#2563eb", fontWeight: 600 },
                  },
                  "& .MuiTabs-indicator": { bgcolor: "#2563eb", height: 2 },
                }}
              >
                <Tab label="Overview" />
                <Tab label={attachments.length ? `Attachments (${attachments.length})` : "Attachments"} />
                <Tab label={history.length ? `History (${history.length})` : "History"} />
                <Tab label="Related Tests" />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              {/* OVERVIEW */}
              {activeTab === 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Box>
                    <Typography sx={sectionLabel}>Description</Typography>
                    <Box sx={{ p: "14px 16px", bgcolor: "#f9fafb", borderRadius: "8px", border: "1px solid #f3f4f6" }}>
                      <Typography sx={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                        {task.description || "No description provided"}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography sx={sectionLabel}>Details</Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px 32px" }}>
                      {[
                        { label: "Status",      node: <StatusChip status={task.status} /> },
                        {
                          label: "Priority",
                          node: (
                            <Tooltip title="Change priority">
                              <Box sx={{ cursor: "pointer" }} onClick={() => setOpenPriorityDialog(true)}>
                                <PriorityChip priority={task.priority} />
                              </Box>
                            </Tooltip>
                          ),
                        },
                        {
                          label: "Owner",
                          node: (
                            <Tooltip title="Reassign owner">
                              <Box
                                sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, cursor: "pointer" }}
                                onClick={() => setOpenOwnershipDialog(true)}
                              >
                                <Avatar sx={{ width: 18, height: 18, fontSize: "0.6rem", bgcolor: avatarColor(task.ownerId) }}>
                                  {getUserName(task.ownerId)?.[0]}
                                </Avatar>
                                <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
                                  {getUserName(task.ownerId)}
                                </Typography>
                              </Box>
                            </Tooltip>
                          ),
                        },
                        { label: "Created By",  text: getUserName(task.createdBy) },
                        { label: "Target Date", text: fmtDate(task.targetDate) },
                        { label: "Created At",  text: fmtDate(task.createdAt) },
                      ].map(({ label, node, text }) => (
                        <Box key={label}>
                          <Typography sx={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 500, mb: 0.3 }}>
                            {label}
                          </Typography>
                          {node ?? (
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
                              {text}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* ATTACHMENTS */}
              {activeTab === 1 && (
                <AttachmentTable
                  attachments={attachments}
                  onDelete={handleDeleteAttachment}
                  onPreview={(att) => { setSelectedAttachment(att); setOpenAttachmentModal(true); }}
                />
              )}

              {/* HISTORY */}
              {activeTab === 2 && (
                <ActivityTimeline history={history} getUserName={getUserName} />
              )}

              {/* RELATED TESTS */}
              {activeTab === 3 && (
                <Box sx={{ py: 5, textAlign: "center" }}>
                  <Typography sx={{ fontSize: "0.9rem", color: "#9ca3af" }}>No related tests</Typography>
                </Box>
              )}
            </Box>
          </Card>

          {/* COMMENTS CARD */}
          <Card sx={{ ...cardSx, overflow: "hidden" }}>
            <CardContent sx={{ p: "0 !important" }}>
              {/* Header */}
              <Box sx={{
                px: 3, py: 2, borderBottom: "1px solid #f3f4f6",
                display: "flex", alignItems: "center", gap: 1,
              }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: "1rem", color: "#6b7280" }} />
                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>
                  Comments
                </Typography>
                {comments.length > 0 && (
                  <Box sx={{
                    ml: 0.25, px: "7px", bgcolor: "#e5e7eb", borderRadius: "10px",
                    display: "inline-flex", alignItems: "center",
                  }}>
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#374151", lineHeight: "18px" }}>
                      {comments.length}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Scrollable list */}
              <Box sx={{
                maxHeight: 380, overflowY: "auto", px: 3, pt: 2.5, pb: 1.5,
                "&::-webkit-scrollbar":       { width: "5px" },
                "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
                "&::-webkit-scrollbar-thumb": { bgcolor: "#e5e7eb", borderRadius: "4px" },
              }}>
                <CommentTimeline
                  comments={comments}
                  currentUserId={currentUserId}
                  getUserName={getUserName}
                  onDelete={handleDeleteComment}
                  onEdit={handleEditComment}
                />
              </Box>

              {/* Sticky composer */}
              <Box sx={{ px: 3, py: 2, borderTop: "1px solid #f3f4f6", bgcolor: "#fafafa" }}>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <Avatar sx={{
                    width: 32, height: 32, fontSize: "0.72rem",
                    bgcolor: avatarColor(currentUserId), fontWeight: 700, flexShrink: 0, mt: 0.5,
                  }}>
                    {getUserName(currentUserId)?.[0] ?? "U"}
                  </Avatar>
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                    <TextField
                      inputRef={commentInputRef}
                      fullWidth
                      multiline
                      minRows={commentText ? 3 : 1}
                      placeholder="Add a commentâ€¦ (Ctrl+Enter to send)"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && commentText.trim()) {
                          handleAddComment();
                        }
                      }}
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#fff", borderRadius: "8px", fontSize: "0.875rem", transition: "all 0.2s",
                          "& fieldset":             { borderColor: "#e5e7eb" },
                          "&:hover fieldset":       { borderColor: "#d1d5db" },
                          "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                        },
                      }}
                    />
                    {/* Send controls â€” slide in when text is present */}
                    <Box sx={{
                      display: "flex", gap: 1, justifyContent: "flex-end",
                      maxHeight: commentText.trim() ? "40px" : "0px",
                      opacity: commentText.trim() ? 1 : 0,
                      overflow: "hidden",
                      transition: "max-height 0.25s ease, opacity 0.2s ease",
                    }}>
                      <Button
                        size="small" variant="outlined"
                        onClick={() => setCommentText("")}
                        sx={{ borderRadius: "7px", fontSize: "0.78rem", borderColor: "#e5e7eb", color: "#6b7280" }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="small" variant="contained"
                        endIcon={<SendIcon sx={{ fontSize: "0.9rem" }} />}
                        onClick={handleAddComment}
                        disabled={submitting || !commentText.trim()}
                        sx={{ borderRadius: "7px", fontSize: "0.78rem", bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" } }}
                      >
                        {submitting ? "Sending…" : "Send"}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
      </Box>


      {/* â”€â”€ DIALOGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}

      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)}
        PaperProps={{ sx: { borderRadius: "12px", minWidth: 300 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", pb: 1 }}>Change Status</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 0.5 }}>
            {["To Do", "Open", "In Progress", "Blocked", "Done", "Completed"].map((s) => (
              <Button key={s} fullWidth
                variant={task.status === s ? "contained" : "outlined"}
                onClick={() => handleStatusChange(s)} disabled={submitting}
                sx={{ borderRadius: "8px", textTransform: "none", justifyContent: "flex-start", fontWeight: 500 }}
              >
                {s}
              </Button>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={openPriorityDialog} onClose={() => setOpenPriorityDialog(false)}
        PaperProps={{ sx: { borderRadius: "12px", minWidth: 300 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", pb: 1 }}>Change Priority</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 0.5 }}>
            {["Low", "Medium", "High", "Critical"].map((p) => (
              <Button key={p} fullWidth
                variant={task.priority === p ? "contained" : "outlined"}
                onClick={() => handlePriorityChange(p)} disabled={submitting}
                sx={{ borderRadius: "8px", textTransform: "none", justifyContent: "flex-start", fontWeight: 500 }}
              >
                {p}
              </Button>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={openOwnershipDialog} onClose={() => setOpenOwnershipDialog(false)}
        PaperProps={{ sx: { borderRadius: "12px" } }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", pb: 1 }}>Reassign Task</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 0.5 }}>
            {users.map((user) => (
              <Button key={user.id} fullWidth
                variant={String(task.ownerId) === String(user.id) ? "contained" : "outlined"}
                onClick={() => handleOwnershipChange(user.id)} disabled={submitting}
                sx={{ borderRadius: "8px", textTransform: "none", justifyContent: "flex-start", fontWeight: 500 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: "0.7rem", bgcolor: avatarColor(user.id) }}>
                    {(user.fullName || `U${user.id}`)[0]}
                  </Avatar>
                  {user.fullName || `User ${user.id}`}
                </Box>
              </Button>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}
        PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: "1.08rem",
            pb: 1.2,
            background: "linear-gradient(110deg, #f8fbff 0%, #f0fdf4 100%)",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          Edit Task
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1.2 }}>
            <TextField
              label="Task"
              value={editForm.issueActionItem}
              onChange={(e) => setEditForm((prev) => ({ ...prev, issueActionItem: e.target.value }))}
              fullWidth
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                },
              }}
            />
            <TextField
              label="Description"
              value={editForm.description}
              onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                },
              }}
            />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
              <TextField
                label="Priority"
                select
                value={editForm.priority}
                onChange={(e) => setEditForm((prev) => ({ ...prev, priority: e.target.value }))}
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "#fff",
                  },
                }}
              >
                {["Low", "Medium", "High", "Critical"].map((priority) => (
                  <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="Owner"
                select
                value={editForm.ownerId}
                onChange={(e) => setEditForm((prev) => ({ ...prev, ownerId: e.target.value }))}
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "#fff",
                  },
                }}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>{user.fullName || `User ${user.id}`}</MenuItem>
                ))}
              </TextField>
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Target Date"
                value={editForm.targetDate ? dayjs(editForm.targetDate) : null}
                onChange={(nextDate) =>
                  setEditForm((prev) => ({
                    ...prev,
                    targetDate: nextDate ? nextDate.format("YYYY-MM-DD") : "",
                  }))
                }
                format="DD MMM YYYY"
                slots={{ openPickerIcon: CalendarMonthIcon }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        backgroundColor: "#fff",
                      },
                    },
                  },
                  popper: {
                    sx: {
                      "& .MuiPaper-root": {
                        borderRadius: "14px",
                        border: "1px solid #dbeafe",
                        boxShadow: "0 18px 34px rgba(30, 64, 175, 0.18)",
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>

            <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>
              <Button
                size="small"
                variant="outlined"
                sx={{ textTransform: "none", borderRadius: 999 }}
                onClick={() => setEditForm((prev) => ({ ...prev, targetDate: dayjs().format("YYYY-MM-DD") }))}
              >
                Today
              </Button>
              <Button
                size="small"
                variant="outlined"
                sx={{ textTransform: "none", borderRadius: 999 }}
                onClick={() => setEditForm((prev) => ({ ...prev, targetDate: dayjs().add(3, "day").format("YYYY-MM-DD") }))}
              >
                +3 days
              </Button>
              <Button
                size="small"
                variant="outlined"
                sx={{ textTransform: "none", borderRadius: 999 }}
                onClick={() => setEditForm((prev) => ({ ...prev, targetDate: dayjs().add(7, "day").format("YYYY-MM-DD") }))}
              >
                +1 week
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <Box sx={{ p: 2, pt: 0, display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => setOpenEditDialog(false)}
            sx={{ borderRadius: "10px", textTransform: "none", px: 2.2, fontWeight: 700 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleEditSave} disabled={submitting}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              px: 2.2,
              fontWeight: 700,
              background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
              boxShadow: "0 8px 16px rgba(79, 70, 229, 0.25)",
            }}>
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{ sx: { borderRadius: "12px", minWidth: 320 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>Delete Task</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#6b7280", fontSize: "0.9rem" }}>
            Are you sure you want to delete this task? This action cannot be undone.
          </Typography>
        </DialogContent>
        <Box sx={{ p: 2, pt: 0, display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => setOpenDeleteDialog(false)}
            sx={{ borderRadius: "8px", textTransform: "none" }}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteTask} disabled={submitting}
            sx={{ borderRadius: "8px", textTransform: "none" }}>
            {submitting ? "Deletingâ€¦" : "Delete"}
          </Button>
        </Box>
      </Dialog>

      {/* â”€â”€ ATTACHMENT MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal
        open={openAttachmentModal}
        onClose={() => { setOpenAttachmentModal(false); setSelectedAttachment(null); }}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Fade in={openAttachmentModal}>
          <Box sx={{
            maxWidth: "90vw", maxHeight: "90vh", bgcolor: "#fff",
            borderRadius: "12px", p: 3, position: "relative",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)", outline: "none",
          }}>
            <IconButton
              onClick={() => { setOpenAttachmentModal(false); setSelectedAttachment(null); }}
              sx={{ position: "absolute", top: 8, right: 8 }}
            >
              <CloseIcon />
            </IconButton>
            {selectedAttachment && (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", pr: 4 }}>
                  {selectedAttachment.fileName}
                </Typography>
                {isImage(selectedAttachment.fileName) ? (
                  <Box
                    component="img"
                    src={`data:image/*;base64,${selectedAttachment.fileData}`}
                    alt={selectedAttachment.fileName}
                    sx={{ maxWidth: "100%", maxHeight: "65vh", borderRadius: "8px" }}
                  />
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography sx={{ fontSize: "3rem", mb: 1 }}>ðŸ“„</Typography>
                    <Typography color="text.secondary" sx={{ mb: 2, fontSize: "0.9rem" }}>
                      Preview not available for this file type
                    </Typography>
                    <Button variant="contained" startIcon={<DownloadIcon />}
                      onClick={() => window.open(`data:application/octet-stream;base64,${selectedAttachment.fileData}`, "_blank")}
                      sx={{ borderRadius: "8px" }}
                    >
                      Download File
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
