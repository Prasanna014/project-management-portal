import React, { useEffect, useState } from "react";
import { Box, Button, Snackbar, Alert, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

import SidebarPanel from "../components/SidebarPanel";
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject
} from "../services/projectService";
import ProjectDialog from "./ProjectDialog";

export default function ProjectPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

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

  const handleCreate = () => {
    setOpenDialog(true);
  };

  const handleDialogSave = async (formData) => {
    try {
      console.log("Creating project from dialog:", formData);
      await createProject({
        projectCode: formData.code,
        projectName: formData.name,
        description: formData.description,
        active: true
      });
      setSuccess("Project created successfully!");
      setOpenDialog(false);
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
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* MAIN CONTENT */}
      <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
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

        <ProjectDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onSave={handleDialogSave}
        />
      </Box>

      {/* SIDEBAR */}
      <SidebarPanel title="Project Actions">
        <Button variant="outlined" fullWidth sx={{ mb: 1.5, color: "#fff", borderColor: "#fff" }}>
          Export Projects
        </Button>
        <Button variant="outlined" fullWidth sx={{ mb: 1.5, color: "#fff", borderColor: "#fff" }}>
          Import Projects
        </Button>
        <Button variant="outlined" fullWidth sx={{ color: "#fff", borderColor: "#fff" }}>
          Settings
        </Button>
      </SidebarPanel>
    </Box>
  );
}
