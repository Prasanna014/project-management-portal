import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Paper
} from "@mui/material";

import { getAllProjects } from "../services/projectService";
import { getUsers } from "../services/userServices";
import { getAllTasks } from "../services/taskService";
import { createTask } from "../services/taskService";

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

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load projects and users on mount
  useEffect(() => {
    console.log("🟡 CreateTaskPage mounted, loading data...");
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    setLoadingError("");
    console.log("🟡 Loading projects and users...");
    
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
    console.log(`Updating form field: ${field} = ${value}`);
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    console.log("🟡 Attempting to create task...");
    
    // Validation
    if (!form.issueActionItem.trim()) {
      setSubmitError("Issue/Action Item is required");
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
    if (!form.ownerId) {
      setSubmitError("Owner is required");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      console.log("🟡 Creating task...");
      
      // ✅ Fetch all tasks to get the next sequential number for this project
      const allTasks = await getAllTasks();
      const selectedProject = projects.find(p => p.id == form.projectId);
      const projectCode = selectedProject?.projectCode || "TASK";
      
      // Filter tasks for this project and get the highest number
      const projectTasks = allTasks.filter(t => t.projectId == form.projectId);
      const maxNumber = projectTasks.length > 0 
        ? Math.max(...projectTasks.map(t => {
            const match = t.taskNo?.match(/\d+$/);
            return match ? parseInt(match[0]) : 0;
          }))
        : 0;
      const nextNumber = maxNumber + 1;
      
      const taskData = {
        taskNo: `${projectCode}-${nextNumber}`,  // ✅ Auto-increment: PROJ-1, PROJ-2, etc
        projectId: Number(form.projectId),
        issueActionItem: form.issueActionItem,
        description: form.description,
        priority: form.priority,
        status: form.status,
        ownerId: Number(form.ownerId),
        targetDate: form.targetDate || null,
        createdBy: currentUserId
      };

      console.log("📤 Sending task data:", taskData);
      const result = await createTask(taskData);
      
      console.log("✅ Task created successfully:", result);
      setSubmitSuccess(true);

      // Reset form
      setForm({
        issueActionItem: "",
        description: "",
        priority: "Medium",
        projectId: "",
        ownerId: "",
        targetDate: "",
        status: "Open"
      });

      // Redirect after success
      setTimeout(() => {
        console.log("Redirecting to /tasks");
        navigate("/tasks");
      }, 1500);
    } catch (err) {
      console.error("❌ Error creating task:", err.message);
      setSubmitError(`Failed to create task: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  console.log("🟢 CreateTaskPage rendering | loadingData:", loadingData, "| projects:", projects.length, "| users:", users.length);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
        ➕ Create New Task
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
        Fill in the form below to create a new task
      </Typography>

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
