import React, { useEffect, useState } from "react";
import { Box, Button, Snackbar } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import { getAllProjects } from "../services/projectService";

export default function ProjectPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await getProjects();
      setRows(res || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // ✅ CREATE
  const handleCreate = async () => {
    try {
      await createProject({
        projectCode: "PRJ-" + Date.now(),
        projectName: "New Project",
        description: "Created from UI",
        active: true
      });
      setSuccess("Project created");
      loadProjects();
    } catch (e) {
      console.error(e);
      setError("Create failed");
    }
  };

  // ✅ UPDATE
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

  // ✅ DELETE
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
      <Button variant="contained" onClick={handleCreate} sx={{ mb: 2 }}>
        Create Project
      </Button>

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
