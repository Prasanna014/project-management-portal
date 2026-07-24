import React, { useEffect, useState } from "react";
import { Box, Button, Snackbar, Alert } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject
} from "../services/projectService";

export default function ProjectPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProjects = async () => {
    try {
      console.log("🟡 Starting to load projects...");
      console.log("📍 API URL:", import.meta.env.VITE_API_BASE_URL);
      setLoading(true);
      setError("");
      
      const projects = await getAllProjects();
      console.log("🟢 Projects loaded successfully:", projects);
      console.log("🔢 Total projects:", projects?.length || 0);
      
      setRows(projects || []);
      
    } catch (e) {
      console.error("🔴 ERROR loading projects:", e);
      console.error("Error message:", e.message);
      console.error("Error details:", e);
      setError(`Failed to load projects: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("📌 Component mounted - loading projects");
    loadProjects();
  }, []);

  const handleCreate = async () => {
    try {
      const newProject = {
        projectCode: "PRJ-" + Date.now(),
        projectName: "New Project",
        description: "Created from UI",
        active: true
      };
      console.log("Creating project:", newProject);
      await createProject(newProject);
      setSuccess("Project created");
      loadProjects();
    } catch (e) {
      console.error("Create failed:", e);
      setError("Create failed: " + e.message);
    }
  };

  const handleUpdate = async (row) => {
    try {
      await updateProject(row.id, {
        ...row,
        projectName: row.projectName + " (Updated)"
      });
      setSuccess("Project updated");
      loadProjects();
    } catch (e) {
      console.error(e);
      setError("Update failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProject(id);
      setSuccess("Project deleted");
      loadProjects();
    } catch (e) {
      console.error(e);
      setError("Delete failed");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "projectCode", headerName: "Project Code", width: 150 },
    { field: "projectName", headerName: "Project Name", width: 200 },
    { field: "description", headerName: "Description", width: 250 },
    { field: "active", headerName: "Status", width: 120 },
    { field: "createdAt", headerName: "Created Date", width: 180 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
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
      <h1>📊 Projects Page</h1>
      <p>💻 API Base URL: {import.meta.env.VITE_API_BASE_URL}</p>
      <p>📊 Total Rows: {rows.length}</p>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Button variant="contained" onClick={handleCreate} sx={{ mb: 2 }}>
        Create Project
      </Button>

      {loading && <p>⏳ Loading...</p>}

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        autoHeight
        getRowId={(row) => row.id}
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
