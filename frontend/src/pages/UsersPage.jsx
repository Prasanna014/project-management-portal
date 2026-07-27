import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Snackbar,
  Typography
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import SidebarPanel from "../components/SidebarPanel";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from "../services/userServices";

export default function UsersPage() {

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ LOAD USERS
  const loadUsers = async () => {
    try {
      setLoading(true);
      const users = await getUsers();
      setRows(users || []);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ✅ CREATE USER
  const handleCreate = async () => {
    try {
      await createUser({
        fullName: "New User",
        email: "user" + Date.now() + "@test.com",
        employeeId: "EMP-" + Date.now(),
        role: "USER",
        active: true
      });

      setSuccess("User created");
      loadUsers();
    } catch {
      setError("Create failed");
    }
  };

  // ✅ UPDATE USER
  const handleUpdate = async (row) => {
    try {
      await updateUser(row.id, {
        ...row,
        fullName: row.fullName + " (Updated)"
      });

      setSuccess("User updated");
      loadUsers();
    } catch {
      setError("Update failed");
    }
  };

  // ✅ DELETE USER
  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      setSuccess("User deleted");
      loadUsers();
    } catch {
      setError("Delete failed");
    }
  };

  // ✅ GRID COLUMNS (UNCHANGED STRUCTURE)
  const columns = [
    { field: "fullName", headerName: "Name", width: 200 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "employeeId", headerName: "Employee ID", width: 150 },
    { field: "role", headerName: "Role", width: 120 },
    { field: "active", headerName: "Active", width: 100 },
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
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* MAIN CONTENT */}
      <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>

        {/* ✅ CREATE BUTTON */}
        <Button variant="contained" onClick={handleCreate} sx={{ mb: 2 }}>
          Create User
        </Button>

        {/* ✅ DATA GRID */}
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          autoHeight
          getRowId={(row) => row.id}
        />

        {/* ✅ SNACKBARS */}
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

      {/* SIDEBAR */}
      <SidebarPanel title="User Management">
        <Button variant="outlined" fullWidth sx={{ mb: 1.5, color: "#fff", borderColor: "#fff" }}>
          Export Users
        </Button>
        <Button variant="outlined" fullWidth sx={{ mb: 1.5, color: "#fff", borderColor: "#fff" }}>
          Import Users
        </Button>
        <Button variant="outlined" fullWidth sx={{ color: "#fff", borderColor: "#fff" }}>
          Settings
        </Button>
      </SidebarPanel>
    </Box>
  );
}
