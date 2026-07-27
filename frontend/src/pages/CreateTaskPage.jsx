import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stack,
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Paper,
  Chip,
} from "@mui/material";
import dayjs from "dayjs";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { getAllProjects } from "../services/projectService";
import { getUsers } from "../services/userServices";
import { getAllTasks, createTask } from "../services/taskService";

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const currentUserId = Number(import.meta.env.VITE_DEFAULT_USER_ID || 1);

  // State
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [loadingWarning, setLoadingWarning] = useState("");
  
  const [form, setForm] = useState({
    issueActionItem: "",
    description: "",
    priority: "Medium",
    projectId: "",
    ownerId: "",
    targetDate: "",
    status: "Open"
  });

  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Load projects and users on mount
  useEffect(() => {
    loadData();
  }, []);

  const getErrorMessage = (err, fallback) => {
    const status = err?.response?.status;
    const apiMessage = err?.response?.data?.message;

    if (status === 401) {
      return "Session expired or unauthorized access. Please sign in again.";
    }
    if (status === 403) {
      return "You do not have permission for this action.";
    }
    return apiMessage || err?.message || fallback;
  };

  const loadData = async () => {
    setLoadingData(true);
    setLoadingError("");
    setLoadingWarning("");
    
    try {
      const [projectsResult, usersResult] = await Promise.allSettled([
        getAllProjects(),
        getUsers()
      ]);

      let nextError = "";
      let nextWarning = "";

      if (projectsResult.status === "fulfilled") {
        setProjects(projectsResult.value || []);
      } else {
        setProjects([]);
        nextError = getErrorMessage(projectsResult.reason, "Unable to load projects.");
      }

      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value || []);
      } else {
        setUsers([]);
        nextWarning = getErrorMessage(usersResult.reason, "Unable to load users. You can still create a task.");
      }

      if (projectsResult.status === "fulfilled" && (!projectsResult.value || projectsResult.value.length === 0)) {
        nextError = "No projects found. Please create a project first.";
      }

      if (usersResult.status === "fulfilled" && (!usersResult.value || usersResult.value.length === 0)) {
        nextWarning = "No users found. Task owner will default to current user.";
      }

      if (nextError && nextWarning && nextError === nextWarning) {
        nextWarning = "";
      }

      setLoadingError(nextError);
      setLoadingWarning(nextWarning);
    } catch (err) {
      setLoadingError(getErrorMessage(err, "Unable to load page data."));
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const mapPriorityForApi = (priority) => {
    if (priority === "Critical") {
      return "High";
    }
    return priority;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "#ef4444";
      case "High":
        return "#f97316";
      case "Medium":
        return "#3b82f6";
      case "Low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  // File upload handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  const addFiles = (files) => {
    Array.from(files).forEach(file => {
      setAttachments(prev => [...prev, { id: Date.now() + Math.random(), name: file.name, file }]);
    });
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.issueActionItem.trim()) {
      setSubmitError("Task name is required");
      return;
    }
    if (!form.priority) {
      setSubmitError("Priority is required");
      return;
    }
    if (!form.projectId) {
      setSubmitError("Project is required");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      // Get project code for task numbering
      const project = projects.find(p => p.id == form.projectId);
      const projectCode = (project?.projectCode || project?.name || "TSK").substring(0, 3).toUpperCase();

      // Get all tasks to calculate next number
      const allTasks = await getAllTasks();
      const projectTasks = allTasks.filter(t => t.projectId == Number(form.projectId));
      
      const maxNumber = projectTasks.length > 0 
        ? Math.max(...projectTasks.map(t => {
            const match = t.taskNo?.match(/\d+$/);
            return match ? parseInt(match[0]) : 0;
          }))
        : 0;

      const nextNumber = maxNumber + 1;
      const taskNo = `${projectCode}-${nextNumber}`;

      // Create task
      const newTask = {
        taskNo,
        projectId: Number(form.projectId),
        issueActionItem: form.issueActionItem,
        description: form.description,
        priority: mapPriorityForApi(form.priority),
        status: "Open",
        ownerId: form.ownerId ? Number(form.ownerId) : currentUserId,
        targetDate: form.targetDate,
        createdBy: currentUserId
      };

      const result = await createTask(newTask);

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate("/tasks");
      }, 1500);

    } catch (err) {
      setSubmitError(getErrorMessage(err, "Failed to create task."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2.5}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid #dbe7ff",
            background: "linear-gradient(115deg, #f8fbff 0%, #f0fdf4 100%)",
            boxShadow: "0 12px 26px rgba(30, 64, 175, 0.08)",
          }}
        >
          <CardContent sx={{ py: 3 }}>
            <Stack spacing={1}>
              <Chip
                label="Task Studio"
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: "#dbeafe",
                  color: "#1d4ed8",
                  fontWeight: 700,
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                Create Task
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add a new work item with owner, priority, deadline, and attachments.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {loadingError && <Alert severity="error">{loadingError}</Alert>}
        {loadingWarning && <Alert severity="warning">{loadingWarning}</Alert>}
        {submitError && <Alert severity="error">{submitError}</Alert>}
        {submitSuccess && <Alert severity="success">Task created successfully! Redirecting...</Alert>}

        <Card sx={{ borderRadius: 3, border: "1px solid #e5e7eb", boxShadow: "0 6px 24px rgba(15, 23, 42, 0.06)" }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
              Task Information
            </Typography>

            {/* PROJECT ROW */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2.5 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: "0.9rem" }}>
                  Project *
                </Typography>
                <TextField
                  fullWidth
                  select
                  value={form.projectId}
                  onChange={(e) => handleChange("projectId", e.target.value)}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fff",
                      borderRadius: "6px"
                    }
                  }}
                >
                  <MenuItem value="">Select Project</MenuItem>
                  {projects.map((proj) => (
                    <MenuItem key={proj.id} value={proj.id}>
                      {proj.projectCode ? `${proj.projectCode} - ${proj.projectName || proj.name}` : (proj.projectName || proj.name)}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: "0.9rem" }}>
                  Priority *
                </Typography>
                <TextField
                  fullWidth
                  select
                  value={form.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fff",
                      borderRadius: "6px"
                    }
                  }}
                >
                  {["Critical", "High", "Medium", "Low"].map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: getPriorityColor(priority)
                          }}
                        />
                        {priority}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            {/* TASK NAME ROW */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: "0.9rem" }}>
                Task *
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter task name"
                value={form.issueActionItem}
                onChange={(e) => handleChange("issueActionItem", e.target.value)}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fff",
                    borderRadius: "6px"
                  }
                }}
              />
            </Box>

            {/* DESCRIPTION ROW */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: "0.9rem" }}>
                Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter task description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fff",
                    borderRadius: "6px"
                  }
                }}
              />
            </Box>

            {/* OWNER & TARGET DATE ROW */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2.5 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: "0.9rem" }}>
                  Owner
                </Typography>
                <TextField
                  fullWidth
                  select
                  value={form.ownerId}
                  onChange={(e) => handleChange("ownerId", e.target.value)}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fff",
                      borderRadius: "6px"
                    }
                  }}
                >
                  <MenuItem value="">Assign to me</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: "0.7rem", bgcolor: "#1976d2" }}>
                          {user.fullName?.[0] || "U"}
                        </Avatar>
                        {user.fullName}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: "0.9rem" }}>
                  Target Date
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={form.targetDate ? dayjs(form.targetDate) : null}
                    onChange={(nextDate) => handleChange("targetDate", nextDate ? nextDate.format("YYYY-MM-DD") : "")}
                    format="DD MMM YYYY"
                    slots={{
                      openPickerIcon: CalendarMonthIcon,
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        placeholder: "Select date",
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#fff",
                            borderRadius: "10px",
                          },
                        },
                      },
                      popper: {
                        sx: {
                          "& .MuiPaper-root": {
                            borderRadius: "14px",
                            border: "1px solid #dbeafe",
                            boxShadow: "0 16px 32px rgba(30, 64, 175, 0.18)",
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
                <Stack direction="row" spacing={0.8} sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: "none", borderRadius: 999 }}
                    onClick={() => handleChange("targetDate", dayjs().format("YYYY-MM-DD"))}
                  >
                    Today
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: "none", borderRadius: 999 }}
                    onClick={() => handleChange("targetDate", dayjs().add(3, "day").format("YYYY-MM-DD"))}
                  >
                    +3 days
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: "none", borderRadius: 999 }}
                    onClick={() => handleChange("targetDate", dayjs().add(7, "day").format("YYYY-MM-DD"))}
                  >
                    +1 week
                  </Button>
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, border: "1px solid #e5e7eb", boxShadow: "0 6px 24px rgba(15, 23, 42, 0.06)" }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
              Attachments
            </Typography>

            {/* DRAG & DROP ZONE */}
            <Paper
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              sx={{
                p: 3,
                textAlign: "center",
                border: "2px dashed",
                borderColor: dragActive ? "#1976d2" : "#e0e0e0",
                backgroundColor: dragActive ? "#e3f2fd" : "#fafafa",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                mb: 2,
                "&:hover": {
                  borderColor: "#1976d2",
                  backgroundColor: "#e3f2fd"
                }
              }}
            >
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                style={{ display: "none" }}
                id="file-input"
              />
              <label htmlFor="file-input" style={{ cursor: "pointer", display: "block" }}>
                <CloudUploadIcon sx={{ fontSize: 48, color: "#1976d2", mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Drag & drop files here or click to browse
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  PDF, DOC, XLS, PNG, JPG, etc. (Max 10 MB)
                </Typography>
              </label>
            </Paper>

            {/* ATTACHMENTS LIST */}
            {attachments.length > 0 && (
              <Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: "0.9rem" }}>
                  Attached Files ({attachments.length})
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {attachments.map((att) => (
                    <Box
                      key={att.id}
                      sx={{
                        p: 1.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: "#f9f9f9",
                        borderRadius: "6px",
                        border: "1px solid #e0e0e0"
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
                        {att.name}
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => removeAttachment(att.id)}
                        sx={{ fontSize: "0.8rem" }}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/tasks")}
            disabled={submitting}
            sx={{ px: 3 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !form.issueActionItem || !form.projectId || projects.length === 0}
            sx={{
              px: 3,
              background: "linear-gradient(135deg, #2563eb 0%, #14b8a6 100%)",
              boxShadow: "0 8px 16px rgba(37, 99, 235, 0.24)",
            }}
          >
            {submitting ? "Creating..." : "Create Task"}
          </Button>
        </Box>
    </Stack>
  );
}
