import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Snackbar,
  TextField,
  MenuItem
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import { handleApiError } from "../utils/errorHandler";


import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask
} from "../services/taskService"


export default function TasksPage() {

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await getAllTasks();

      let data = res.data || [];

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

      setRows(data);

    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [search, status, priority]);

  const handleCreate = async () => {
    try {
      await createTask({
        taskNo: "TASK-" + Date.now(),
        projectId: 1,
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
          <Button onClick={() => handleUpdate(params.row)}>Edit</Button>
          <Button color="error" onClick={() => handleDelete(params.row.id)}>
            Delete
          </Button>
        </>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>

        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ width: 150 }}
        >
          <MenuItem value="">All</MenuItem>
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
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </TextField>

        <Button variant="contained" onClick={handleCreate}>
          Create Task
        </Button>

      </Box>

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        autoHeight
        getRowId={(row) => row.id || row.taskNo}
      />

      <Snackbar
        open={!!error}
        message={error}
        autoHideDuration={3000}
        onClose={() => setError("")}
      />

      <Snackbar
        open={!!success}
        message={success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
      />

    </Box>
  );
}

