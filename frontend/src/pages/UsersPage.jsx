import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Snackbar
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from "../services/userService";

export default function UsersPage() {

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ LOAD USERS
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setRows(res.data);
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
    <Box sx={{ p: 3 }}>

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
  );
}
