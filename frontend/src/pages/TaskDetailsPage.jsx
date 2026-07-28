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
  Breadcrumbs,
  Link,
  Tooltip,
  Popover,
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
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import StatusChip from "../components/StatusChip";
import PriorityChip from "../components/PriorityChip";
import ActivityTimeline from "../components/ActivityTimeline";
import CommentTimeline from "../components/CommentTimeline";
import AttachmentTable from "../components/AttachmentTable";
import MarkdownRenderer from "../components/MarkdownRenderer";
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

// ─── helpers ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#3b82f6","#8b5cf6","#ec4899","#f59e0b","#10b981","#ef4444"];
const avatarColor = (id) => AVATAR_COLORS[(Number(id) || 0) % AVATAR_COLORS.length];

const IMAGE_EXTS = [".jpg",".jpeg",".png",".gif",".webp",".bmp"];
const isImage = (name) => IMAGE_EXTS.some(e => name?.toLowerCase().endsWith(e));

const fmtDate = (ts) =>
  ts
    ? new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Not set";

const fmtHours = (h) => {
  if (h === null || h === undefined || isNaN(Number(h))) return "—";
  const n = Math.abs(Number(h));
  const hours = Math.floor(n);
  const mins  = Math.round((n - hours) * 60);
  if (hours === 0 && mins === 0) return "0h";
  if (hours === 0) return `${mins}m`;
  if (mins  === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

const calcOpenDuration = (start, end) => {
  if (!start) return "—";
  const totalMins = Math.floor((new Date(end || Date.now()).getTime() - new Date(start).getTime()) / 60000);
  if (totalMins < 0) return "—";
  const days  = Math.floor(totalMins / 1440);
  const hours = Math.floor((totalMins % 1440) / 60);
  const mins  = totalMins % 60;
  if (days  > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

const getDueDateStyle = (targetDate) => {
  if (!targetDate) return null;
  const diffDays = Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)   return { label: "Overdue",     bg: "#fef2f2", border: "#fecaca", color: "#dc2626", pulse: true };
  if (diffDays === 0) return { label: "Due today",   bg: "#fff1f2", border: "#fecdd3", color: "#e11d48", pulse: true };
  if (diffDays === 1) return { label: "1 day left",  bg: "#fff1f2", border: "#fecdd3", color: "#e11d48", pulse: false };
  if (diffDays <= 2)  return { label: "2 days left", bg: "#fff7ed", border: "#fed7aa", color: "#c2410c", pulse: false };
  if (diffDays <= 3)  return { label: "3 days left", bg: "#fffbeb", border: "#fde68a", color: "#b45309", pulse: false };
  return null;
};

const STATUS_OPTIONS = [
  { value: "To Do",       color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
  { value: "Open",        color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  { value: "In Progress", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { value: "Blocked",     color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  { value: "Done",        color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  { value: "Completed",   color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
];

const PRIORITY_OPTIONS = [
  { value: "Low",      color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  { value: "Medium",   color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { value: "High",     color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  { value: "Critical", color: "#9a3412", bg: "#fff7ed", border: "#fed7aa" },
];

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
  const commentsBoxRef  = useRef(null);
  const commentsCardRef = useRef(null);
  const editFileRef     = useRef(null);
  const commentFileRef  = useRef(null);
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
  const [statusAnchorEl,      setStatusAnchorEl]      = useState(null);
  const [priorityAnchorEl,    setPriorityAnchorEl]    = useState(null);
  const [ownerAnchorEl,       setOwnerAnchorEl]       = useState(null);
  const [editingTitle,        setEditingTitle]        = useState(false);
  const [titleDraft,          setTitleDraft]          = useState("");
  const [openEditDialog,      setOpenEditDialog]      = useState(false);
  const [selectedAttachment,  setSelectedAttachment]  = useState(null);
  const [editPendingFiles,     setEditPendingFiles]     = useState([]);
  const [descPreview,          setDescPreview]          = useState(false);
  const [attachPopoverAnchor,  setAttachPopoverAnchor]  = useState(null);
  const [editForm, setEditForm] = useState({
    issueActionItem: "",
    description: "",
    priority: "Medium",
    ownerId: "",
    targetDate: "",
    estimatedHours: "",
  });
  const [openLogTimeDialog, setOpenLogTimeDialog] = useState(false);
  const [logHoursInput,     setLogHoursInput]     = useState("");
  const [logTimeNote,       setLogTimeNote]       = useState("");

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

  // Auto-scroll comments to bottom whenever a new comment is added
  useEffect(() => {
    const el = commentsBoxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [comments.length]);


  const handleStatusChange = async (newStatus) => {
    const snapshot = task;
    try {
      setOpenStatusDialog(false);
      setSubmitting(true);
      setTask((t) => (t ? { ...t, statusId: null, status: newStatus } : t));
      await updateTaskDetails(taskId, { ...task, statusId: null, status: newStatus }, currentUserId);
      setSuccess(`Status changed to ${newStatus}`);
    } catch (err) {
      setTask(snapshot);
      setError(`Failed to update status: ${err.message}`);
    } finally { setSubmitting(false); }
  };

  const handlePriorityChange = async (newPriority) => {
    const snapshot = task;
    try {
      setOpenPriorityDialog(false);
      setSubmitting(true);
      const mappedPriority = mapPriorityForApi(newPriority);
      setTask((t) => (t ? { ...t, priorityId: null, priority: mappedPriority } : t));
      await updateTaskDetails(taskId, { ...task, priorityId: null, priority: mappedPriority }, currentUserId);
      setSuccess(`Priority changed to ${newPriority}`);
    } catch (err) {
      setTask(snapshot);
      setError(`Failed to update priority: ${err.message}`);
    } finally { setSubmitting(false); }
  };

  const handleOwnershipChange = async (newOwnerId) => {
    const snapshot = task;
    try {
      setOpenOwnershipDialog(false);
      setSubmitting(true);
      const normalizedOwnerId = Number(newOwnerId);
      setTask((t) => (t ? { ...t, ownerId: normalizedOwnerId } : t));
      await updateTaskDetails(taskId, { ...task, ownerId: normalizedOwnerId }, currentUserId);
      const ownerName = users.find(u => Number(u.id) === normalizedOwnerId)?.fullName || `User ${normalizedOwnerId}`;
      setSuccess(`Task assigned to ${ownerName}`);
    } catch (err) {
      setTask(snapshot);
      setError(`Failed to update ownership: ${err.message}`);
    } finally { setSubmitting(false); }
  };

  const openEditTaskDialog = () => {
    setEditForm({
      issueActionItem: task.issueActionItem || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      ownerId: task.ownerId ?? "",
      targetDate: task.targetDate ? String(task.targetDate).slice(0, 10) : "",
      estimatedHours: task.estimatedHours != null ? String(task.estimatedHours) : "",
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
        estimatedHours: editForm.estimatedHours !== "" ? parseFloat(editForm.estimatedHours) : null,
        loggedHours: task.loggedHours ?? null,
      };

      const updated = await updateTaskDetails(taskId, payload, currentUserId);
      setTask(updated || { ...task, ...payload });
      if (editPendingFiles.length > 0) {
        const { uploadAttachment } = await import("../services/attachmentService");
        await Promise.allSettled(editPendingFiles.map(f => uploadAttachment(taskId, f, currentUserId)));
        setEditPendingFiles([]);
      }
      setOpenEditDialog(false);
      await loadAll({ silent: true });
      setSuccess("Task updated successfully");
    } catch (err) {
      setError(`Failed to update task: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogTime = async () => {
    const hours = parseFloat(logHoursInput);
    if (isNaN(hours) || hours <= 0) { setError("Please enter valid hours (e.g. 1.5)"); return; }
    const snapshot = task;
    try {
      setSubmitting(true);
      const newLogged = (Number(task.loggedHours) || 0) + hours;
      setTask((t) => (t ? { ...t, loggedHours: newLogged } : t));
      await updateTaskDetails(taskId, { ...task, loggedHours: newLogged }, currentUserId);
      setOpenLogTimeDialog(false);
      setLogHoursInput("");
      setLogTimeNote("");
      setSuccess(`Logged ${fmtHours(hours)}`);
    } catch (err) {
      setTask(snapshot);
      setError(`Failed to log time: ${err.message}`);
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

  const handleTitleSave = async () => {
    const trimmed = titleDraft.trim();
    setEditingTitle(false);
    if (!trimmed || trimmed === task.issueActionItem) return;
    const snapshot = task;
    try {
      setTask((t) => (t ? { ...t, issueActionItem: trimmed } : t));
      await updateTaskDetails(taskId, { ...task, issueActionItem: trimmed }, currentUserId);
      setSuccess("Task title updated");
    } catch (err) {
      setTask(snapshot);
      setError(`Failed to update title: ${err.message}`);
    }
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
      setComments((prev) => [...prev, optimisticComment]);

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
    const snapshot = comments;
    try {
      // Optimistic update with edited flag
      setComments((prev) => prev.map((c) =>
        Number(c.id) === Number(id)
          ? { ...c, commentText: nextText, updatedAt: new Date().toISOString() }
          : c
      ));
      const updated = await editTaskDetailsComment(taskId, id, nextText, currentUserId);
      // Apply server response so updatedAt is authoritative
      if (updated) {
        setComments((prev) => prev.map((c) =>
          Number(c.id) === Number(id) ? { ...c, ...updated } : c
        ));
      }
      setSuccess("Comment updated");
    } catch (err) {
      setComments(snapshot);
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

  const cardSx = {
    borderRadius: 4,
    border: "1px solid rgba(148, 163, 184, 0.18)",
    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.07)",
    p: 0,
  };
  const sectionLabel = {
    fontSize: "0.7rem", fontWeight: 700, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.08em", mb: 1,
  };
  const dueDateStyle = getDueDateStyle(task.targetDate);
  const daysUntilDue = task.targetDate
    ? Math.ceil((new Date(task.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const statusOpt   = STATUS_OPTIONS.find((o) => o.value === task.status)    ?? { color: "#374151", bg: "#f3f4f6", border: "#e5e7eb" };
  const priorityOpt = PRIORITY_OPTIONS.find((o) => o.value === task.priority) ?? { color: "#374151", bg: "#f3f4f6", border: "#e5e7eb" };

  const estimatedHrs  = Number(task.estimatedHours) || 0;
  const loggedHrs     = Number(task.loggedHours)    || 0;
  const remainingHrs  = Math.max(0, estimatedHrs - loggedHrs);
  const isOverLogged  = estimatedHrs > 0 && loggedHrs > estimatedHrs;
  const progressPct   = estimatedHrs > 0 ? Math.min(100, Math.round((loggedHrs / estimatedHrs) * 100)) : 0;
  const progressColor = isOverLogged ? "#ef4444" : progressPct >= 80 ? "#f59e0b" : "#3b82f6";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

      {/* ── ALERTS ──────────────────────────────────────────────────────── */}
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

      {/* ── HEADER CARD ─────────────────────────────────────────────────── */}
      <Card sx={{ ...cardSx, background: "linear-gradient(135deg, #f8fbff 0%, #eff6ff 52%, #ecfeff 100%)" }}>
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
              {editingTitle ? (
                <TextField
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleTitleSave(); }
                    if (e.key === "Escape") { setEditingTitle(false); }
                  }}
                  autoFocus
                  fullWidth
                  variant="standard"
                  InputProps={{
                    sx: {
                      fontSize: "1.5rem", fontWeight: 700, color: "#111827", lineHeight: 1.3,
                      "& .MuiInput-input": { padding: 0 },
                    },
                  }}
                  sx={{ "& .MuiInput-underline:after": { borderBottomColor: "#2563eb" } }}
                />
              ) : (
                <Typography
                  variant="h5"
                  onClick={() => { setTitleDraft(task.issueActionItem); setEditingTitle(true); }}
                  title="Click to edit title"
                  sx={{
                    fontWeight: 700, color: "#111827", lineHeight: 1.3,
                    cursor: "text", borderRadius: "6px", px: 0.5, mx: -0.5,
                    "&:hover": { bgcolor: "rgba(37,99,235,0.05)" },
                    transition: "background 0.15s",
                  }}
                >
                  {task.issueActionItem}
                </Typography>
              )}
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

          {/* Meta strip � styled pill chips */}
          <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", alignItems: "center", mt: 0.25 }}>

            {/* -- Status labeled pill -- */}
            <Box sx={{
              display: "flex", alignItems: "center", gap: 0.6,
              px: 1, py: 0.4, borderRadius: 999,
              bgcolor: statusOpt.bg, border: `1px solid ${statusOpt.border}`,
            }}>
              <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1 }}>Status</Typography>
              <Box sx={{ width: "1px", height: 11, bgcolor: "#d1d5db", flexShrink: 0 }} />
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: statusOpt.color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: statusOpt.color, lineHeight: 1 }}>{task.status}</Typography>
            </Box>

            {/* -- Priority labeled pill -- */}
            <Box sx={{
              display: "flex", alignItems: "center", gap: 0.6,
              px: 1, py: 0.4, borderRadius: 999,
              bgcolor: priorityOpt.bg, border: `1px solid ${priorityOpt.border}`,
            }}>
              <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1 }}>Priority</Typography>
              <Box sx={{ width: "1px", height: 11, bgcolor: "#d1d5db", flexShrink: 0 }} />
              <FlagRoundedIcon sx={{ fontSize: "0.78rem", color: priorityOpt.color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: priorityOpt.color, lineHeight: 1 }}>{task.priority}</Typography>
            </Box>

            {/* -- Assignee labeled pill -- */}
            <Box sx={{
              display: "flex", alignItems: "center", gap: 0.6,
              px: 1, py: 0.4, borderRadius: 999,
              bgcolor: "#f0fdf4", border: "1px solid #bbf7d0",
            }}>
              <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1 }}>Assignee</Typography>
              <Box sx={{ width: "1px", height: 11, bgcolor: "#d1d5db", flexShrink: 0 }} />
              <Avatar sx={{ width: 14, height: 14, fontSize: "0.48rem", bgcolor: avatarColor(task.ownerId), flexShrink: 0 }}>
                {getInitials(getUserName(task.ownerId))}
              </Avatar>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#059669", lineHeight: 1 }}>{getUserName(task.ownerId)}</Typography>
            </Box>

            {/* -- Due date labeled pill -- */}
            <Box sx={{
              display: "flex", alignItems: "center", gap: 0.6,
              px: 1, py: 0.4, borderRadius: 999,
              bgcolor: dueDateStyle?.bg ?? "#f8fafc",
              border: `1px solid ${dueDateStyle?.border ?? "#e2e8f0"}`,
              ...(dueDateStyle?.pulse ? { boxShadow: `0 0 0 2px ${dueDateStyle.border}55` } : {}),
            }}>
              <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1 }}>Due</Typography>
              <Box sx={{ width: "1px", height: 11, bgcolor: "#d1d5db", flexShrink: 0 }} />
              {dueDateStyle
                ? <WarningAmberRoundedIcon sx={{ fontSize: "0.78rem", color: dueDateStyle.color }} />
                : <CalendarMonthIcon sx={{ fontSize: "0.78rem", color: "#64748b" }} />}
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: dueDateStyle?.color ?? "#374151", lineHeight: 1 }}>
                {fmtDate(task.targetDate)}
              </Typography>
              {dueDateStyle && (
                <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: dueDateStyle.color, opacity: 0.85, lineHeight: 1 }}>
                  � {dueDateStyle.label}
                </Typography>
              )}
            </Box>

            {/* -- Project labeled pill -- */}
            {task.projectId && (
              <Box sx={{
                display: "flex", alignItems: "center", gap: 0.6,
                px: 1, py: 0.4, borderRadius: 999,
                bgcolor: "#EEF2FF", border: "1px solid #c7d2fe",
              }}>
                <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1 }}>Project</Typography>
                <Box sx={{ width: "1px", height: 11, bgcolor: "#c7d2fe", flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#4F46E5", lineHeight: 1 }}>
                  {getProjectName(task.projectId)}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* -- QUICK STATS RIBBON ----------------------------------------------- */}
      <Card sx={{ ...cardSx, background: "linear-gradient(135deg, #f8fbff 0%, #eef2ff 60%, #f0fdf9 100%)" }}>
        <CardContent sx={{ p: "0 !important" }}>
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {[
              { icon: <ChatBubbleOutlineIcon sx={{ fontSize: "1.1rem" }} />, label: "Comments",      value: comments.length,    color: "#2563eb", bg: "#eff6ff",  border: "#bfdbfe", onClick: () => commentsCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }) },
              { icon: <HistoryRoundedIcon sx={{ fontSize: "1.1rem" }} />,    label: "History Events", value: history.length,     color: "#7c3aed", bg: "#f5f3ff",  border: "#ddd6fe" },
              {
                icon: dueDateStyle ? <WarningAmberRoundedIcon sx={{ fontSize: "1.1rem" }} /> : <CalendarMonthIcon sx={{ fontSize: "1.1rem" }} />,
                label: "Days Until Due",
                value: daysUntilDue === null ? "Not set" : daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}d overdue` : daysUntilDue === 0 ? "Today" : `${daysUntilDue}d left`,
                color: dueDateStyle?.color ?? "#059669", bg: dueDateStyle?.bg ?? "#ecfdf5", border: dueDateStyle?.border ?? "#a7f3d0",
              },
            ].map((stat, i) => (
              <Box key={stat.label} onClick={stat.onClick} sx={{
                flex: "1 1 0", minWidth: 130,
                display: "flex", alignItems: "center", gap: 1.5,
                px: 2.5, py: 1.5,
                borderRight: i < 2 ? "1px solid rgba(148,163,184,0.18)" : "none",
                cursor: stat.onClick ? "pointer" : "default",
                "&:hover": stat.onClick ? { bgcolor: "rgba(37,99,235,0.04)", borderRadius: 1 } : {},
              }}>
                <Box sx={{ width: 38, height: 38, borderRadius: 2.5, bgcolor: stat.bg, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${stat.border}`, flexShrink: 0 }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, color: stat.color, lineHeight: 1.1 }}>{stat.value}</Typography>
                  <Typography sx={{ fontSize: "0.69rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* -- ACTION BAR -------------------------------------------------------- */}
      <Card sx={{ ...cardSx, background: "linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%)" }}>
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

      {/* -- MAIN CONTENT (full-width) ----------------------------------------- */}
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
                    color: "#64748b", minWidth: "auto", px: 2, py: 1.75,
                    "&.Mui-selected": { color: "#2563eb", fontWeight: 700 },
                  },
                  "& .MuiTabs-indicator": { bgcolor: "#2563eb", height: 2.5, borderRadius: 2 },
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
                    <Box sx={{ p: "14px 16px", background: "linear-gradient(135deg, #f8fbff 0%, #f0f6ff 100%)", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <MarkdownRenderer text={task.description} />
                    </Box>
                  </Box>

                  {/* TIME TRACKING */}
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <AccessTimeRoundedIcon sx={{ fontSize: "0.85rem", color: "#3b82f6" }} />
                        <Typography sx={sectionLabel}>Time Tracking</Typography>
                      </Box>
                      <Box
                        component="button"
                        onClick={() => setOpenLogTimeDialog(true)}
                        sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.25, py: 0.5, borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, color: "#3b82f6", bgcolor: "#eff6ff", border: "1px solid #bfdbfe", cursor: "pointer", transition: "all 0.15s", "&:hover": { bgcolor: "#dbeafe", boxShadow: "0 2px 6px rgba(59,130,246,0.2)" } }}
                      >
                        <AccessTimeRoundedIcon sx={{ fontSize: "0.8rem" }} />
                        Log Time
                      </Box>
                    </Box>
                    <Box sx={{ p: "16px", bgcolor: "#f8fbff", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      {/* Stat tiles */}
                      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1.5, mb: estimatedHrs > 0 ? 2 : 0 }}>
                        {/* Estimated */}
                        <Box sx={{ p: "10px 12px", borderRadius: "8px", bgcolor: "#eff6ff", border: "1px solid #bfdbfe", borderLeft: "3px solid #3b82f6" }}>
                          <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>Estimated</Typography>
                          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#1d4ed8", lineHeight: 1.2 }}>{fmtHours(task.estimatedHours)}</Typography>
                        </Box>
                        {/* Logged */}
                        <Box sx={{ p: "10px 12px", borderRadius: "8px", bgcolor: "#f5f3ff", border: "1px solid #ddd6fe", borderLeft: "3px solid #7c3aed" }}>
                          <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>Logged</Typography>
                          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#6d28d9", lineHeight: 1.2 }}>{fmtHours(task.loggedHours)}</Typography>
                        </Box>
                        {/* Remaining / Over */}
                        <Box sx={{ p: "10px 12px", borderRadius: "8px", bgcolor: isOverLogged ? "#fef2f2" : "#ecfdf5", border: `1px solid ${isOverLogged ? "#fecaca" : "#a7f3d0"}`, borderLeft: `3px solid ${isOverLogged ? "#ef4444" : "#10b981"}` }}>
                          <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>{isOverLogged ? "Over by" : "Remaining"}</Typography>
                          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: isOverLogged ? "#dc2626" : "#059669", lineHeight: 1.2 }}>{isOverLogged ? fmtHours(loggedHrs - estimatedHrs) : fmtHours(remainingHrs)}</Typography>
                        </Box>
                        {/* Open Duration */}
                        <Box sx={{ p: "10px 12px", borderRadius: "8px", bgcolor: task.dateResolved ? "#f0fdf4" : "#f8fafc", border: `1px solid ${task.dateResolved ? "#bbf7d0" : "#e2e8f0"}`, borderLeft: `3px solid ${task.dateResolved ? "#10b981" : "#94a3b8"}` }}>
                          <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>{task.dateResolved ? "Resolved In" : "Open For"}</Typography>
                          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: task.dateResolved ? "#059669" : "#475569", lineHeight: 1.2 }}>{calcOpenDuration(task.createdAt, task.dateResolved)}</Typography>
                        </Box>
                      </Box>
                      {/* Progress bar — only when estimate is set */}
                      {estimatedHrs > 0 && (
                        <Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                            <Typography sx={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Progress</Typography>
                            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: progressColor }}>
                              {progressPct}%{isOverLogged ? " — over estimate" : ""}
                            </Typography>
                          </Box>
                          <Box sx={{ position: "relative", height: 8, borderRadius: 4, bgcolor: "#e2e8f0", overflow: "hidden" }}>
                            <Box sx={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${progressPct}%`, borderRadius: 4, bgcolor: progressColor, transition: "width 0.5s ease" }} />
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography sx={sectionLabel}>Details</Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
                      {/* Status */}
                      <Box sx={{ p: "12px 16px", borderRadius: "12px", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", border: "1px solid #e2e8f0", borderLeft: "3px solid #2563eb" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.75 }}>
                          <CheckCircleOutlineRoundedIcon sx={{ fontSize: "0.85rem", color: "#2563eb" }} />
                          <Typography sx={{ fontSize: "0.67rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Status</Typography>
                        </Box>
                        <StatusChip status={task.status} />
                      </Box>
                      {/* Priority */}
                      <Tooltip title="Click to change priority">
                        <Box sx={{ p: "12px 16px", borderRadius: "12px", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", border: "1px solid #e2e8f0", borderLeft: "3px solid #f59e0b", cursor: "pointer", "&:hover": { bgcolor: "#fffbeb", boxShadow: "0 2px 10px rgba(245,158,11,0.1)" } }} onClick={() => setOpenPriorityDialog(true)}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.75 }}>
                            <FlagRoundedIcon sx={{ fontSize: "0.85rem", color: "#f59e0b" }} />
                            <Typography sx={{ fontSize: "0.67rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Priority</Typography>
                          </Box>
                          <PriorityChip priority={task.priority} />
                        </Box>
                      </Tooltip>
                      {/* Owner */}
                      <Tooltip title="Click to reassign owner">
                        <Box sx={{ p: "12px 16px", borderRadius: "12px", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", border: "1px solid #e2e8f0", borderLeft: "3px solid #10b981", cursor: "pointer", "&:hover": { bgcolor: "#f0fdf4", boxShadow: "0 2px 10px rgba(16,185,129,0.1)" } }} onClick={() => setOpenOwnershipDialog(true)}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.75 }}>
                            <PersonOutlineIcon sx={{ fontSize: "0.85rem", color: "#10b981" }} />
                            <Typography sx={{ fontSize: "0.67rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Owner</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Avatar sx={{ width: 22, height: 22, fontSize: "0.65rem", bgcolor: avatarColor(task.ownerId) }}>{getUserName(task.ownerId)?.[0]}</Avatar>
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{getUserName(task.ownerId)}</Typography>
                          </Box>
                        </Box>
                      </Tooltip>
                      {/* Created By */}
                      <Box sx={{ p: "12px 16px", borderRadius: "12px", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", border: "1px solid #e2e8f0", borderLeft: "3px solid #8b5cf6" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.75 }}>
                          <PersonOutlineIcon sx={{ fontSize: "0.85rem", color: "#8b5cf6" }} />
                          <Typography sx={{ fontSize: "0.67rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Created By</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <Avatar sx={{ width: 22, height: 22, fontSize: "0.65rem", bgcolor: avatarColor(task.createdBy) }}>{getUserName(task.createdBy)?.[0]}</Avatar>
                          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{getUserName(task.createdBy)}</Typography>
                        </Box>
                      </Box>
                      {/* Target Date � due date warning */}
                      <Box sx={{
                        p: "12px 16px", borderRadius: "12px",
                        background: dueDateStyle ? `linear-gradient(135deg, ${dueDateStyle.bg}, ${dueDateStyle.bg})` : "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                        border: `1px solid ${dueDateStyle?.border ?? "#e2e8f0"}`,
                        borderLeft: `3px solid ${dueDateStyle?.color ?? "#2563eb"}`,
                        ...(dueDateStyle ? { boxShadow: `0 0 0 1px ${dueDateStyle.border}40` } : {}),
                      }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                            {dueDateStyle ? <WarningAmberRoundedIcon sx={{ fontSize: "0.85rem", color: dueDateStyle.color }} /> : <CalendarMonthIcon sx={{ fontSize: "0.85rem", color: "#2563eb" }} />}
                            <Typography sx={{ fontSize: "0.67rem", color: dueDateStyle?.color ?? "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Target Date</Typography>
                          </Box>
                          {dueDateStyle && <Chip label={dueDateStyle.label} size="small" sx={{ height: 18, fontSize: "0.63rem", fontWeight: 700, bgcolor: dueDateStyle.border, color: dueDateStyle.color, "& .MuiChip-label": { px: 0.75 } }} />}
                        </Box>
                        <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: dueDateStyle?.color ?? "#0f172a" }}>{fmtDate(task.targetDate)}</Typography>
                      </Box>
                      {/* Created At */}
                      <Box sx={{ p: "12px 16px", borderRadius: "12px", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", border: "1px solid #e2e8f0", borderLeft: "3px solid #64748b" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.75 }}>
                          <AccessTimeRoundedIcon sx={{ fontSize: "0.85rem", color: "#64748b" }} />
                          <Typography sx={{ fontSize: "0.67rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Created At</Typography>
                        </Box>
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{fmtDate(task.createdAt)}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* ATTACHMENTS */}
              {activeTab === 1 && (
                <AttachmentTable
                  attachments={attachments}
                  onDelete={handleDeleteAttachment}
                  onPreview={(att, e) => { setSelectedAttachment(att); setAttachPopoverAnchor(e?.currentTarget || null); }}
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
          <Card ref={commentsCardRef} sx={{ ...cardSx, overflow: "hidden" }}>
            <CardContent sx={{ p: "0 !important" }}>
              {/* Header */}
              <Box sx={{
                px: 3, py: 2,
                background: "linear-gradient(135deg, #f8fbff 0%, #eff6ff 100%)",
                borderBottom: "1px solid #dbeafe",
                display: "flex", alignItems: "center", gap: 1,
              }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: "1rem", color: "#2563eb" }} />
                <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a" }}>
                  Comments
                </Typography>
                {comments.length > 0 && (
                  <Box sx={{
                    ml: 0.25, px: "8px",
                    background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
                    borderRadius: "10px",
                    display: "inline-flex", alignItems: "center",
                  }}>
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#fff", lineHeight: "18px" }}>
                      {comments.length}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Scrollable list - newest at bottom */}
              <Box
                ref={commentsBoxRef}
                sx={{
                  maxHeight: 400, overflowY: "auto", px: 3, pt: 2.5, pb: 1.5,
                  background: "linear-gradient(180deg, #fafcff 0%, #fff 100%)",
                  "&::-webkit-scrollbar":       { width: "5px" },
                  "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
                  "&::-webkit-scrollbar-thumb": { bgcolor: "#bfdbfe", borderRadius: "4px" },
                }}
              >
                <CommentTimeline
                  comments={comments}
                  currentUserId={currentUserId}
                  getUserName={getUserName}
                  onDelete={handleDeleteComment}
                  onEdit={handleEditComment}
                />
              </Box>

              {/* Sticky composer */}
              <Box sx={{ px: 3, py: 2, borderTop: "1px solid #dbeafe", background: "linear-gradient(135deg, #f0f7ff 0%, #f8fbff 100%)" }}>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <Avatar sx={{
                    width: 32, height: 32, fontSize: "0.72rem",
                    bgcolor: avatarColor(currentUserId), fontWeight: 700, flexShrink: 0, mt: 0.5,
                  }}>
                    {getUserName(currentUserId)?.[0] ?? "U"}
                  </Avatar>
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                    {/* Hidden file input for comment attachment */}
                    <input
                      type="file"
                      ref={commentFileRef}
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files[0]) setSelectedFile(e.target.files[0]);
                        e.target.value = "";
                      }}
                    />
                    <TextField
                      inputRef={commentInputRef}
                      fullWidth
                      multiline
                      minRows={commentText ? 3 : 1}
                      placeholder="Add a comment� (Ctrl+Enter to send)"
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
                    {/* Attach file row */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Tooltip title="Attach a file">
                        <IconButton
                          size="small"
                          onClick={() => commentFileRef.current?.click()}
                          sx={{ color: "#94a3b8", "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" }, borderRadius: "6px" }}
                        >
                          <AttachFileRoundedIcon sx={{ fontSize: "1rem" }} />
                        </IconButton>
                      </Tooltip>
                      {selectedFile && (
                        <Chip
                          label={selectedFile.name}
                          size="small"
                          icon={<AttachFileRoundedIcon sx={{ fontSize: "0.75rem !important" }} />}
                          onDelete={() => setSelectedFile(null)}
                          sx={{
                            fontSize: "0.73rem", bgcolor: "#f0fdf4", border: "1px solid #bbf7d0",
                            color: "#059669", maxWidth: 220,
                            "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
                          }}
                        />
                      )}
                    </Box>
                    {/* Send controls — slide in when text is present */}
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
                        {submitting ? "Sending�" : "Send"}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
      </Box>


      {/* ── DIALOGS ─────────────────────────────────────────────────────── */}

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
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>Description</Typography>
                <Box sx={{ display: "flex", gap: 0 }}>
                  <Button
                    size="small"
                    variant={!descPreview ? "contained" : "text"}
                    onClick={() => setDescPreview(false)}
                    sx={{ textTransform: "none", fontSize: "0.73rem", minWidth: 0, px: 1.2, py: 0.3, borderRadius: "6px 0 0 6px", bgcolor: !descPreview ? "#3b82f6" : "transparent", color: !descPreview ? "#fff" : "#64748b" }}
                  >Write</Button>
                  <Button
                    size="small"
                    variant={descPreview ? "contained" : "text"}
                    onClick={() => setDescPreview(true)}
                    sx={{ textTransform: "none", fontSize: "0.73rem", minWidth: 0, px: 1.2, py: 0.3, borderRadius: "0 6px 6px 0", bgcolor: descPreview ? "#3b82f6" : "transparent", color: descPreview ? "#fff" : "#64748b" }}
                  >Preview</Button>
                </Box>
              </Box>
              {descPreview ? (
                <Box sx={{ p: "12px 14px", bgcolor: "#f8fbff", border: "1px solid #e2e8f0", borderRadius: "10px", minHeight: 80 }}>
                  <MarkdownRenderer text={editForm.description} />
                </Box>
              ) : (
                <TextField
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  fullWidth
                  multiline
                  minRows={4}
                  size="small"
                  placeholder="Supports Markdown: **bold**, *italic*, `code`, ```code blocks```, # heading, - list, [link](url), ![image](url)"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      backgroundColor: "#fff",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                    },
                  }}
                />
              )}
            </Box>
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

            {/* -- Estimated Hours -- */}
            <TextField
              label="Estimated Hours"
              type="number"
              inputProps={{ min: 0, step: 0.5 }}
              value={editForm.estimatedHours}
              onChange={(e) => setEditForm((prev) => ({ ...prev, estimatedHours: e.target.value }))}
              fullWidth
              size="small"
              placeholder="e.g. 8 (hours)"
              helperText={editForm.estimatedHours !== "" && !isNaN(Number(editForm.estimatedHours)) && Number(editForm.estimatedHours) > 0 ? `= ${fmtHours(Number(editForm.estimatedHours))}` : ""}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#fff" } }}
            />

            {/* -- Attachments -- */}
            <Box>
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", mb: 0.75 }}>
                Attachments
              </Typography>
              {attachments.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1 }}>
                  {attachments.map(att => (
                    <Chip
                      key={att.id}
                      label={att.fileName}
                      size="small"
                      icon={<AttachFileRoundedIcon sx={{ fontSize: "0.75rem !important" }} />}
                      sx={{ fontSize: "0.73rem", bgcolor: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", maxWidth: 220 }}
                    />
                  ))}
                </Box>
              )}
              {editPendingFiles.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1 }}>
                  {editPendingFiles.map((file, i) => (
                    <Chip
                      key={i}
                      label={file.name}
                      size="small"
                      icon={<AttachFileRoundedIcon sx={{ fontSize: "0.75rem !important" }} />}
                      onDelete={() => setEditPendingFiles(prev => prev.filter((_, idx) => idx !== i))}
                      sx={{ fontSize: "0.73rem", bgcolor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#059669", maxWidth: 220 }}
                    />
                  ))}
                </Box>
              )}
              <input
                type="file"
                ref={editFileRef}
                style={{ display: "none" }}
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length) setEditPendingFiles(prev => [...prev, ...files]);
                  e.target.value = "";
                }}
              />
              <Button
                size="small"
                variant="outlined"
                startIcon={<AttachFileRoundedIcon />}
                onClick={() => editFileRef.current?.click()}
                sx={{ borderRadius: 999, textTransform: "none", fontSize: "0.8rem", borderColor: "#e2e8f0", color: "#64748b", "&:hover": { borderColor: "#3b82f6", color: "#3b82f6" } }}
              >
                Add Attachment
              </Button>
            </Box>

          </Box>
        </DialogContent>
        <Box sx={{ p: 2, pt: 0, display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => { setOpenEditDialog(false); setEditPendingFiles([]); }}
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
            {submitting ? "Deleting…" : "Delete"}
          </Button>
        </Box>
      </Dialog>

      {/* ── ATTACHMENT PREVIEW POPOVER ───────────────────────────────────── */}
      <Popover
        open={Boolean(attachPopoverAnchor)}
        anchorEl={attachPopoverAnchor}
        onClose={() => { setAttachPopoverAnchor(null); setSelectedAttachment(null); }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            borderRadius: "14px",
            boxShadow: "0 20px 60px rgba(15,23,42,0.2)",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            maxWidth: 520,
          }
        }}
      >
        {selectedAttachment && (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              px: 2, py: 1.25,
              background: "linear-gradient(135deg, #f8fbff 0%, #eff6ff 100%)",
              borderBottom: "1px solid #e2e8f0",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                <AttachFileRoundedIcon sx={{ fontSize: "0.9rem", color: "#3b82f6", flexShrink: 0 }} />
                <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }}>
                  {selectedAttachment.fileName}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => { setAttachPopoverAnchor(null); setSelectedAttachment(null); }}
                sx={{ color: "#94a3b8", "&:hover": { color: "#374151", bgcolor: "#f1f5f9" } }}
              >
                <CloseIcon sx={{ fontSize: "0.9rem" }} />
              </IconButton>
            </Box>
            {/* Content */}
            <Box sx={{ p: 2, maxHeight: "60vh", overflowY: "auto" }}>
              {isImage(selectedAttachment.fileName) ? (
                <Box
                  component="img"
                  src={`data:image/*;base64,${selectedAttachment.fileData}`}
                  alt={selectedAttachment.fileName}
                  sx={{ maxWidth: "100%", borderRadius: "8px", display: "block" }}
                />
              ) : (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography sx={{ fontSize: "2.5rem", mb: 1 }}>📄</Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#64748b", mb: 2 }}>
                    Preview not available for this file type
                  </Typography>
                  <Button
                    variant="contained" size="small" startIcon={<DownloadIcon />}
                    onClick={() => window.open(`data:application/octet-stream;base64,${selectedAttachment.fileData}`, "_blank")}
                    sx={{ borderRadius: "8px", textTransform: "none", fontSize: "0.82rem", bgcolor: "#3b82f6" }}
                  >
                    Download
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Popover>

      {/* ── LOG TIME DIALOG ──────────────────────────────────────────────── */}
      <Dialog
        open={openLogTimeDialog}
        onClose={() => { setOpenLogTimeDialog(false); setLogHoursInput(""); setLogTimeNote(""); }}
        PaperProps={{ sx: { borderRadius: "14px", minWidth: 360 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", pb: 1, background: "linear-gradient(135deg, #f8fbff, #eff6ff)", borderBottom: "1px solid #e2e8f0" }}>
          Log Time
        </DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <TextField
                label="Hours worked"
                type="number"
                inputProps={{ min: 0.25, step: 0.25 }}
                value={logHoursInput}
                onChange={(e) => setLogHoursInput(e.target.value)}
                fullWidth
                size="small"
                autoFocus
                placeholder="e.g. 1.5 (for 1h 30m)"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#fff" } }}
              />
              {logHoursInput !== "" && !isNaN(Number(logHoursInput)) && Number(logHoursInput) > 0 && (
                <Typography sx={{ mt: 0.5, fontSize: "0.75rem", color: "#3b82f6", fontWeight: 600 }}>
                  = {fmtHours(Number(logHoursInput))}
                </Typography>
              )}
            </Box>
            <TextField
              label="Note (optional)"
              value={logTimeNote}
              onChange={(e) => setLogTimeNote(e.target.value)}
              fullWidth
              size="small"
              multiline
              minRows={2}
              placeholder="What did you work on?"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#fff" } }}
            />
            <Box sx={{ p: "10px 14px", bgcolor: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
              <Typography sx={{ fontSize: "0.8rem", color: "#374151" }}>
                Current logged: <strong>{fmtHours(loggedHrs)}</strong>
                {logHoursInput !== "" && !isNaN(Number(logHoursInput)) && Number(logHoursInput) > 0 && (
                  <> → after: <strong>{fmtHours(loggedHrs + Number(logHoursInput))}</strong></>
                )}
              </Typography>
              {estimatedHrs > 0 && (
                <Typography sx={{ fontSize: "0.8rem", color: "#374151", mt: 0.25 }}>
                  Estimated: <strong>{fmtHours(estimatedHrs)}</strong>
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <Box sx={{ p: 2, pt: 0, display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => { setOpenLogTimeDialog(false); setLogHoursInput(""); setLogTimeNote(""); }}
            sx={{ borderRadius: "10px", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleLogTime}
            disabled={submitting || logHoursInput === "" || isNaN(Number(logHoursInput)) || Number(logHoursInput) <= 0}
            sx={{ borderRadius: "10px", textTransform: "none", bgcolor: "#3b82f6" }}
          >
            {submitting ? "Saving…" : "Log Time"}
          </Button>
        </Box>
      </Dialog>

    </Box>
  );
}
