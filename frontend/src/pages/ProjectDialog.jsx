// ================= src/pages/ProjectDialog.jsx =================
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
} from "@mui/material";

export default function ProjectDialog({ open, onClose, onSave }) {

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    members: "",
    status: "Active",
    createdAt: new Date().toISOString().split("T")[0],
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.code || !form.name) return;
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Create Project</DialogTitle>

      <DialogContent>

        <Grid container spacing={2} mt={1}>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Project Code"
              value={form.code}
              onChange={(e) => handleChange("code", e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Project Name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Members"
              type="number"
              value={form.members}
              onChange={(e) => handleChange("members", e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              label="Status"
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>

        </Grid>

      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Create
        </Button>
      </DialogActions>

    </Dialog>
  );
}
