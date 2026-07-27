import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Snackbar,
  TextField,
  MenuItem,
  Alert,
  Typography
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import SidebarPanel from "../components/SidebarPanel";
import { handleApiError } from "../utils/errorHandler";


import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask
} from "../services/taskService";


export default function TasksPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const loadTasks = async () => {
    try {
      console.log("🟡 Loading tasks...");
      console.log("📍 API URL:", import.meta.env.VITE_API_BASE_URL);
      setLoading(true);
      
      const tasks = await getAllTasks();
      console.log("🟢 Tasks loaded:", tasks);

      let data = tasks || [];

      if (search) {
        data = data.filter(t =>
          t.issueActionItem?.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (status) {
        data = data.filter(t => t.status === status);
      }

      if (priority) {
        data = data.filter(t => t.priority === priority);
      }

      console.log("🔢 Filtered tasks count:", data.length);
      setRows(data);

    } catch (err) {
      console.error("🔴 ERROR loading tasks:", err);
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [search, status, priority]);

  const handleCreate = () => {
    console.log("🟡 Navigating to create task page...");
    navigate("/create-task");  // ✅ USE REACT ROUTER - No page reload!
  };

  const handleEdit = (row) => {
    console.log("🟡 Navigating to edit task:", row.id);
    navigate(`/task/${row.id}`, { state: { isEdit: true, task: row } });
  };

  const handleCreateOld = async () => {
    try {
      const fallbackProjectId = rows.find((r) => r.projectId)?.projectId;
      if (!fallbackProjectId) {
        setError("Create a project first before creating tasks");
        return;
      }
      await createTask({
        taskNo: "TASK-" + Date.now(),
        projectId: fallbackProjectId,
        issueActionItem: "New Task",
        description: "Created from UI",
        status: "Open",
        priority: "Medium"
      });
      setSuccess("Task created");
      loadTasks();
    } catch (err) {
      handleApiError(err, setError);
    }
  };

  const handleUpdate = async (row) => {
    try {
      await updateTask(row.id, {
        ...row,
        issueActionItem: row.issueActionItem + " (Updated)"
      });
      setSuccess("Task updated");
      loadTasks();
    } catch (err) {
      handleApiError(err, setError);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setSuccess("Task deleted");
      loadTasks();
    } catch (err) {
      handleApiError(err, setError);
    }
  };

  const columns = [
    { field: "taskNo", headerName: "Task Number", width: 150 },
    { field: "issueActionItem", headerName: "Issue", width: 200 },
    { field: "description", headerName: "Description", width: 250 },
    { field: "priority", headerName: "Priority", width: 120 },
    { field: "ownerId", headerName: "Owner", width: 120 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "targetDate", headerName: "Target Date", width: 150 },
    { field: "createdAt", headerName: "Created Date", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 220,
      renderCell: (params) => (
        <>
          <Button onClick={() => handleEdit(params.row)}>Edit</Button>
          <Button color="error" onClick={() => handleDelete(params.row.id)}>
            Delete
          </Button>
        </>
      )
    }
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* MAIN CONTENT */}
      <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>📋 All Tasks</Typography>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          🌐 API: {import.meta.env.VITE_API_BASE_URL} | 📊 Total: {rows.length} tasks
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center", flexWrap: "wrap" }}>

          <TextField
            label="🔍 Search Tasks"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by issue"
            size="small"
            sx={{ minWidth: 200 }}
          />

          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ width: 150 }}
            size="small"
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
        </TextField>

        <TextField
          select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          sx={{ width: 150 }}
          size="small"
        >
          <MenuItem value="">All Priority</MenuItem>
          <MenuItem value="Critical">Critical</MenuItem>
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </TextField>

        <Button 
          variant="contained" 
          color="success"
          onClick={handleCreate}
          sx={{ ml: "auto" }}
        >
          ➕ Create Task
        </Button>

      </Box>

      {loading && <Typography>⏳ Loading tasks...</Typography>}

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        autoHeight
        getRowId={(row) => row.id || row.taskNo}
        pageSizeOptions={[5, 10, 25]}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
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

      {/* SIDEBAR */}
      <SidebarPanel title="Task Filters">
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: "#fff" }}>
          Filter Options
        </Typography>
        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { backgroundColor: "rgba(255,255,255,0.1)" } }}
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="Open">Open</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
        </TextField>

        <TextField
          select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          fullWidth
          size="small"
          sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "rgba(255,255,255,0.1)" } }}
        >
          <MenuItem value="">All Priority</MenuItem>
          <MenuItem value="Critical">Critical</MenuItem>
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </TextField>
      </SidebarPanel>
    </Box>
  );
}

