import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
  Paper
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";

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
    console.log("🟡 CreateTaskPage mounted, loading data...");
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    setLoadingError("");
    
    try {
      const [projectsRes, usersRes] = await Promise.all([
        getAllProjects(),
        getUsers()
      ]);

      console.log("✅ Projects loaded:", projectsRes?.length);
      console.log("✅ Users loaded:", usersRes?.length);

      setProjects(projectsRes || []);
      setUsers(usersRes || []);

      if (!projectsRes || projectsRes.length === 0) {
        setLoadingError("❌ No projects found. Please create a project first.");
      }
      if (!usersRes || usersRes.length === 0) {
        setLoadingError("❌ No users found. Please add users first.");
      }
    } catch (err) {
      console.error("❌ Error loading data:", err.message);
      setLoadingError(`Error: ${err.message}`);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
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
    console.log("🟡 Attempting to create task...");
    
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
      const projectCode = project?.name?.substring(0, 3).toUpperCase() || "TSK";

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
        priority: form.priority,
        status: "Open",
        ownerId: form.ownerId ? Number(form.ownerId) : currentUserId,
        targetDate: form.targetDate,
        createdBy: currentUserId
      };

      console.log("🟡 Creating task:", newTask);
      const result = await createTask(newTask);
      console.log("✅ Task created:", result);

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate("/tasks");
      }, 1500);

    } catch (err) {
      console.error("❌ Error creating task:", err);
      setSubmitError(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", p: 3 }}>
      <Box sx={{ maxWidth: "800px", mx: "auto" }}>
        {/* HEADER */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Create Task
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Tasks / Create Task
          </Typography>
        </Box>

        {/* ALERTS */}
        {loadingError && <Alert severity="error" sx={{ mb: 2 }}>{loadingError}</Alert>}
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
        {submitSuccess && <Alert severity="success" sx={{ mb: 2 }}>Task created successfully! Redirecting...</Alert>}

        {/* TASK INFORMATION CARD */}
        <Card sx={{ mb: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5 }}>
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
                      {proj.name}
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
                  <MenuItem value="">Select Owner</MenuItem>
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
                <TextField
                  fullWidth
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => handleChange("targetDate", e.target.value)}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fff",
                      borderRadius: "6px"
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* ATTACHMENTS CARD */}
        <Card sx={{ mb: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5 }}>
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
                        📄 {att.name}
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

        {/* ACTION BUTTONS */}
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
            disabled={submitting || !form.issueActionItem || !form.projectId}
            sx={{ px: 3 }}
          >
            {submitting ? "Creating..." : "Create Task"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

      {/* Error Messages */}
      {loadingError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadingError}
          <Button size="small" onClick={loadData} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✅ Task created successfully! Redirecting...
        </Alert>
      )}

      {/* Loading State */}
      {loadingData && (
        <Paper sx={{ p: 3, mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Loading projects and users...</Typography>
        </Paper>
      )}

      {/* Main Form */}
      <Grid container spacing={3}>
        {/* Left Column - Form */}
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Task Details
              </Typography>

              <Grid container spacing={2}>
                {/* Task Number (Read-only) */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Task Number"
                    value={`TASK-${Date.now()}`}
                    disabled
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                {/* Status */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    variant="outlined"
                    size="small"
                  >
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Waiting">Waiting</MenuItem>
                    <MenuItem value="Blocked">Blocked</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Scheduled">Scheduled</MenuItem>
                  </TextField>
                </Grid>

                {/* Issue/Action Item - REQUIRED */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Issue / Action Item *"
                    value={form.issueActionItem}
                    onChange={(e) => handleChange("issueActionItem", e.target.value)}
                    multiline
                    rows={2}
                    variant="outlined"
                    placeholder="Enter the task description"
                    error={!form.issueActionItem && submitError !== ""}
                  />
                </Grid>

                {/* Description - OPTIONAL */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    multiline
                    rows={4}
                    variant="outlined"
                    placeholder="Enter detailed description (optional)"
                  />
                </Grid>

                {/* Priority - REQUIRED */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Priority *"
                    value={form.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                    variant="outlined"
                    size="small"
                    error={!form.priority && submitError !== ""}
                  >
                    <MenuItem value="Critical">🔴 Critical</MenuItem>
                    <MenuItem value="High">🟠 High</MenuItem>
                    <MenuItem value="Medium">🟡 Medium</MenuItem>
                    <MenuItem value="Low">🟢 Low</MenuItem>
                  </TextField>
                </Grid>

                {/* Project - REQUIRED */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Project *"
                    value={form.projectId}
                    onChange={(e) => handleChange("projectId", e.target.value)}
                    variant="outlined"
                    size="small"
                    disabled={loadingData || projects.length === 0}
                    error={!form.projectId && submitError !== ""}
                    helperText={loadingData ? "Loading..." : `${projects.length} available`}
                  >
                    <MenuItem value="">Select a project</MenuItem>
                    {projects.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.projectName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Target Date - OPTIONAL */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="date"
                    fullWidth
                    label="Target Date"
                    value={form.targetDate}
                    onChange={(e) => handleChange("targetDate", e.target.value)}
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Owner - REQUIRED */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Owner *"
                    value={form.ownerId}
                    onChange={(e) => handleChange("ownerId", e.target.value)}
                    variant="outlined"
                    size="small"
                    disabled={loadingData || users.length === 0}
                    error={!form.ownerId && submitError !== ""}
                    helperText={loadingData ? "Loading..." : `${users.length} available`}
                  >
                    <MenuItem value="">Select an owner</MenuItem>
                    {users.map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.fullName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      fullWidth
                      onClick={handleSubmit}
                      disabled={submitting || loadingData || projects.length === 0 || users.length === 0}
                    >
                      {submitting ? "Creating..." : "✓ Create Task"}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate("/tasks")}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Preview */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: "sticky", top: 16, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                📋 Preview
              </Typography>
              <Box sx={{ borderTop: "1px solid #ddd", pt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Task:</strong> {form.issueActionItem || "(Enter task)"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Priority:</strong> {form.priority || "(Select)"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Project:</strong> {projects.find(p => p.id == form.projectId)?.projectName || "(Select)"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Owner:</strong> {users.find(u => u.id == form.ownerId)?.fullName || "(Select)"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Status:</strong> {form.status}
                </Typography>
                <Typography variant="body2">
                  <strong>Target Date:</strong> {form.targetDate || "(Not set)"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
