import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Alert,
  Typography,
  Chip,
  Avatar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { handleApiError } from "../utils/errorHandler";
import StatusChip from "../components/StatusChip";
import PriorityChip from "../components/PriorityChip";
import { getAllTasks, deleteTask } from "../services/taskService";
import { getUsers } from "../services/userServices";
import { useProject } from "../contexts/ProjectContext";

const DEBOUNCE_MS = 400;


export default function TasksPage() {
  const navigate = useNavigate();
  const { selectedProjectId, setSelectedProjectId, projects } = useProject();

  const [rows,     setRows]     = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [search,   setSearch]   = useState("");
  const [usersMap, setUsersMap] = useState({});
  const [status,   setStatus]   = useState("");
  const [priority, setPriority] = useState("");

  const debounceRef = useRef(null);

  // Load users for owner column
  useEffect(() => {
    getUsers()
      .then(list => {
        const map = {};
        (list || []).forEach(u => { map[u.id] = u; });
        setUsersMap(map);
      })
      .catch(() => {});
  }, []);

  // Keep latest values accessible in callbacks without adding them as deps
  const filtersRef = useRef({ search, status, priority });
  filtersRef.current = { search, status, priority };

  const applyFilters = useCallback((tasks, s, st, pr, pid) => {
    let data = tasks || [];
    if (pid) data = data.filter(t => String(t.projectId) === String(pid));
    if (s)   data = data.filter(t => t.issueActionItem?.toLowerCase().includes(s.toLowerCase()));
    if (st)  data = data.filter(t => t.status   === st);
    if (pr)  data = data.filter(t => t.priority === pr);
    return data;
  }, []);

  const loadTasks = useCallback(async (s, st, pr, pid) => {
    setLoading(true);
    setError("");
    try {
      const tasks = await getAllTasks();
      setRows(applyFilters(tasks, s, st, pr, pid));
    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  }, [applyFilters]);

  // Debounce only when search changes; instant for dropdown filters
  useEffect(() => {
    const timer = setTimeout(
      () => loadTasks(search, status, priority, selectedProjectId),
      search ? DEBOUNCE_MS : 0
    );
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, priority, selectedProjectId]);

  const handleDelete = useCallback(async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setLoading(true);
    try {
      await deleteTask(id);
      setSuccess("Task deleted successfully.");
      const { search: s, status: st, priority: pr } = filtersRef.current;
      await loadTasks(s, st, pr, selectedProjectId);
    } catch (err) {
      handleApiError(err, setError);
      setLoading(false);
    }
  }, [loadTasks]);

  const handleEdit = useCallback((e, row) => {
    e.stopPropagation();
    navigate(`/task/${row.id}`);
  }, [navigate]);

  const columns = useMemo(() => [
    { field: "taskNo",          headerName: "Task No",            width: 120 },
    { field: "issueActionItem", headerName: "Issue / Action Item", flex: 1, minWidth: 200 },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 120,
      renderCell: (params) => <PriorityChip priority={params.value} />,
    },
    { field: "ownerId", headerName: "Owner", width: 160,
      renderCell: (params) => {
        const user = usersMap[params.value];
        if (!user) return <Typography variant="body2" color="text.secondary">—</Typography>;
        const initials = (user.fullName || "?")
          .split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
        const palette = ["#4F46E5","#0EA5E9","#8B5CF6","#059669","#D97706","#DC2626"];
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: "100%" }}>
            <Avatar sx={{
              width: 26, height: 26, fontSize: "0.65rem", fontWeight: 700, flexShrink: 0,
              bgcolor: palette[(params.value || 0) % palette.length],
            }}>
              {initials}
            </Avatar>
            <Typography variant="body2" sx={{ fontSize: "0.8rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.fullName}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: "targetDate",
      headerName: "Due Date",
      width: 120,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : "—",
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 120,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : "—",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 165,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.75, alignItems: "center", height: "100%" }}>
          <Button
            size="small"
            variant="contained"
            onClick={(e) => handleEdit(e, params.row)}
            sx={{
              fontSize: "0.72rem",
              px: 1.5,
              py: 0.25,
              minWidth: 0,
              bgcolor: "#2563eb",
              "&:hover": { bgcolor: "#1d4ed8" },
              textTransform: "none",
              borderRadius: "6px",
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={(e) => handleDelete(e, params.row.id)}
            sx={{
              fontSize: "0.72rem",
              px: 1.5,
              py: 0.25,
              minWidth: 0,
              textTransform: "none",
              borderRadius: "6px",
            }}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ], [handleEdit, handleDelete]);

  return (
    <Box>
      {/* Page header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2.5,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
            Tasks
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
            {selectedProjectId ? (
              <Chip
                label={projects.find(p => String(p.id) === selectedProjectId)?.name ||
                       projects.find(p => String(p.id) === selectedProjectId)?.projectName ||
                       `Project ${selectedProjectId}`}
                size="small"
                sx={{ bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 600, fontSize: "0.72rem" }}
              />
            ) : null}
            <Typography variant="body2" sx={{ color: "#6b7280" }}>
              {rows.length} task{rows.length !== 1 ? "s" : ""} found
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          color="success"
          onClick={() => navigate("/create-task")}
          sx={{ fontWeight: 600, borderRadius: "8px", textTransform: "none" }}
        >
          + Create Task
        </Button>
      </Box>

      {/* Alerts */}
      {error   && <Alert severity="error"   onClose={() => setError("")}   sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>{success}</Alert>}

      {/* Filter toolbar */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by issue / action item…"
          size="small"
          sx={{ minWidth: 240 }}
        />
        {/* Project filter — drives the same selectedProjectId used for task loading */}
        <TextField
          select
          label="Project"
          value={selectedProjectId || ""}
          onChange={(e) => setSelectedProjectId(e.target.value || "")}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Projects</MenuItem>
          {projects.map((p) => (
            <MenuItem key={p.id} value={String(p.id)}>
              {p.projectName || p.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          size="small"
          sx={{ width: 155 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="Open">Open</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Closed">Closed</MenuItem>
          <MenuItem value="On Hold">On Hold</MenuItem>
        </TextField>
        <TextField
          select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          size="small"
          sx={{ width: 155 }}
        >
          <MenuItem value="">All Priorities</MenuItem>
          <MenuItem value="Critical">Critical</MenuItem>
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </TextField>
      </Box>

      {/* DataGrid */}
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        autoHeight
        getRowId={(row) => row.id ?? row.taskNo}
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        onRowClick={(params) => navigate(`/task/${params.row.id}`)}
        sx={{
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          bgcolor: "#fff",
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "#f9fafb",
            borderBottom: "1px solid #e5e7eb",
          },
          "& .MuiDataGrid-row": {
            cursor: "pointer",
            "&:hover": { bgcolor: "#eff6ff" },
          },
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
            outline: "none",
          },
        }}
      />
    </Box>
  );
}

