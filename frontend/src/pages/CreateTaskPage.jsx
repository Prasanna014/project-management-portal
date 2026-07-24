import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  MenuItem,
  Snackbar,
  Chip,
  Alert,
  CircularProgress
} from "@mui/material";

import { getAllProjects } from "../services/projectService";
import { getUsers } from "../services/userServices";
import { createTask } from "../services/taskService";
import { addComment } from "../services/taskCommentService";
import { uploadAttachment } from "../services/attachmentService";

const priorities = ["Critical", "High", "Medium", "Low"];
const statuses = ["Open", "Waiting", "In Progress", "Blocked", "Completed", "Scheduled"];

export default function CreateTaskPage() {
  const currentUserId = Number(import.meta.env.VITE_DEFAULT_USER_ID || 1);

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    issueActionItem: "",
    description: "",
    priority: "",
    projectId: "",
    ownerId: "",
    targetDate: "",
    status: "Open",
    comment: "",
    attachments: []
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingLookup, setLoadingLookup] = useState(true);

  useEffect(() => {
    const loadLookupData = async () => {
      try {
        setLoadingLookup(true);
        console.log("🟡 Loading projects and users for task creation...");
        console.log("📍 API URL:", import.meta.env.VITE_API_BASE_URL);
        
        const [projectData, userData] = await Promise.all([
          getAllProjects(),
          getUsers()
        ]);
        
        console.log("🟢 Raw project data:", projectData);
        console.log("🟢 Raw user data:", userData);
        
        // Load ALL projects/users, not just active ones
        const allProjects = projectData || [];
        const allUsers = userData || [];
        
        console.log("✅ All projects:", allProjects);
        console.log("✅ All users:", allUsers);
        
        setProjects(allProjects);
        setUsers(allUsers);
        
        if (allProjects.length === 0) {
          setError("⚠️ No projects found. Please create a project first.");
        }
        if (allUsers.length === 0) {
          setError("⚠️ No users found. Please add users first.");
        }
      } catch (err) {
        console.error("🔴 ERROR loading projects/users:", err);
        console.error("Error details:", err.response?.data || err.message);
        setError(`🔴 Failed to load data: ${err.message}`);
      } finally {
        setLoadingLookup(false);
      }
    };

    loadLookupData();
  }, []);

  const preview = useMemo(() => ({
    taskNo: `TASK-${Date.now()}`,
    issueActionItem: form.issueActionItem,
    priority: form.priority,
    status: form.status,
    ownerId: form.ownerId,
    targetDate: form.targetDate
  }), [form]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setForm((prev) => ({ ...prev, attachments: files }));
  };

  const handleSubmit = async () => {
    if (!form.issueActionItem || !form.priority || !form.projectId || !form.ownerId) {
      setError("Issue, priority, project, and owner are required");
      return;
    }

    try {
      setSubmitting(true);

      const created = await createTask({
        taskNo: `TASK-${Date.now()}`,
        projectId: Number(form.projectId),
        issueActionItem: form.issueActionItem,
        description: form.description,
        priority: form.priority,
        status: form.status,
        ownerId: Number(form.ownerId),
        targetDate: form.targetDate || null,
        createdBy: currentUserId
      });

      if (form.comment && created?.id) {
        await addComment(created.id, {
          commentText: form.comment,
          commentedBy: currentUserId
        });
      }

      if (created?.id && form.attachments.length > 0) {
        await Promise.all(
          form.attachments.map((file) => uploadAttachment(created.id, file, currentUserId))
        );
      }

      setSuccess("Task created successfully");
      setForm({
        issueActionItem: "",
        description: "",
        priority: "",
        projectId: "",
        ownerId: "",
        targetDate: "",
        status: "Open",
        comment: "",
        attachments: []
      });
    } catch {
      setError("Task creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: "1600px", margin: "auto" }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loadingLookup && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <CircularProgress size={30} />
          <Typography>🟡 Loading projects and users...</Typography>
        </Box>
      )}
      
      {!loadingLookup && projects.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ⚠️ No projects available. Please <a href="/projects">create a project first</a>.
        </Alert>
      )}
      
      {!loadingLookup && users.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ⚠️ No users available. Please check your database.
        </Alert>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Create Task</Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField fullWidth label="Task Number" value={preview.taskNo} disabled />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Issue / Action Item"
                    value={form.issueActionItem}
                    onChange={(e) => handleChange("issueActionItem", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={5}
                    label="Detailed Description"
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    select
                    fullWidth
                    label="Priority"
                    value={form.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                  >
                    {priorities.map((p) => (
                      <MenuItem key={p} value={p}>{p}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

      {/* PROJECTS DROPDOWN */}
                <Grid item xs={6}>
                  <TextField
                    select
                    fullWidth
                    label="Project"
                    value={form.projectId}
                    onChange={(e) => handleChange("projectId", e.target.value)}
                    disabled={loadingLookup || projects.length === 0}
                  >
                    {projects.length === 0 ? (
                      <MenuItem disabled>No projects available</MenuItem>
                    ) : (
                      projects.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.projectName} {p.active ? "" : "(Inactive)"}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    type="date"
                    fullWidth
                    label="Target Date"
                    InputLabelProps={{ shrink: true }}
                    value={form.targetDate}
                    onChange={(e) => handleChange("targetDate", e.target.value)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    select
                    fullWidth
                    label="Owner"
                    value={form.ownerId}
                    onChange={(e) => handleChange("ownerId", e.target.value)}
                    disabled={loadingLookup || users.length === 0}
                  >
                    {users.length === 0 ? (
                      <MenuItem disabled>No users available</MenuItem>
                    ) : (
                      users.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {u.fullName} {u.active ? "" : "(Inactive)"}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    {statuses.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Initial Comment"
                    value={form.comment}
                    onChange={(e) => handleChange("comment", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button component="label" variant="outlined">
                    Upload Attachments
                    <input hidden type="file" multiple onChange={handleFileUpload} />
                  </Button>

                  <Box mt={2}>
                    {form.attachments.map((file, index) => (
                      <Chip key={index} label={file.name} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
                    Create Task
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ position: "sticky", top: 16 }}>
            <CardContent>
              <Typography variant="h6">Preview</Typography>
              <Typography mt={2}>Task: {preview.issueActionItem}</Typography>
              <Typography>Priority: {preview.priority}</Typography>
              <Typography>Status: {preview.status}</Typography>
              <Typography>Owner ID: {preview.ownerId}</Typography>
              <Typography>Target: {preview.targetDate}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError("")}
      >
        <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
      >
        <Alert onClose={() => setSuccess("")} severity="success" sx={{ width: "100%" }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}
