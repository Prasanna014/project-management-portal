import React, { useEffect, useState } from "react";
import {
  Box, Button, Alert, Typography, Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import {
  getAllProjects,
  createProject,
  deleteProject,
} from "../services/projectService";
import ProjectDialog from "./ProjectDialog";

export default function ProjectPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const projects = await getAllProjects();
      setRows(projects || []);
    } catch (e) {
      setError("Failed to load projects: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  const handleDialogSave = async (formData) => {
    try {
      await createProject({
        projectCode: formData.code,
        projectName: formData.name,
        description: formData.description,
        active: true,
      });
      setSuccess("Project created successfully!");
      setOpenDialog(false);
      loadProjects();
    } catch (e) {
      setError("Create failed: " + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await deleteProject(id);
      setSuccess("Project deleted");
      loadProjects();
    } catch (e) {
      setError("Delete failed: " + e.message);
    }
  };

  const columns = [
    { field: "id",          headerName: "ID",           width: 70 },
    { field: "projectCode", headerName: "Code",          width: 120 },
    { field: "projectName", headerName: "Project Name",  flex: 1, minWidth: 180 },
    { field: "description", headerName: "Description",   flex: 1, minWidth: 200 },
    {
      field: "active",
      headerName: "Status",
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          size="small"
          sx={{
            bgcolor: params.value ? "#DCFCE7" : "#FEE2E2",
            color: params.value ? "#059669" : "#DC2626",
            fontWeight: 600, fontSize: "0.72rem",
          }}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 140,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : "—",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          color="error"
          variant="outlined"
          onClick={() => handleDelete(params.row.id)}
          sx={{ borderRadius: "6px", textTransform: "none", fontSize: "0.72rem" }}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A" }}>Projects</Typography>
          <Typography variant="body2" sx={{ color: "#64748B", mt: 0.25 }}>
            {rows.length} project{rows.length !== 1 ? "s" : ""} total
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
        >
          + New Project
        </Button>
      </Box>

      {error   && <Alert severity="error"   onClose={() => setError("")}   sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>{success}</Alert>}

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        autoHeight
        getRowId={(row) => row.id}
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        sx={{
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          bgcolor: "#fff",
          "& .MuiDataGrid-columnHeaders": { bgcolor: "#f9fafb", borderBottom: "1px solid #e5e7eb" },
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": { outline: "none" },
        }}
      />

      <ProjectDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleDialogSave}
      />
    </Box>
  );
}

