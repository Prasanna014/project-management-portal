// ================= src/pages/CreateTaskPage.jsx =================
import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  MenuItem,
  Autocomplete,
  Chip
} from "@mui/material";

const priorities = ["Critical", "High", "Medium", "Low"];
const statuses = ["Open", "Waiting", "In Progress", "Blocked", "Completed", "Scheduled"];

const users = ["Prasanna", "Ajay", "John", "Mike"];

export default function CreateTaskPage() {

  const [form, setForm] = useState({
    taskNumber: "CTS-2026-001",
    title: "",
    description: "",
    priority: "",
    submittedDate: new Date().toISOString().split("T")[0],
    submittedBy: "Prasanna",
    targetDate: "",
    owner: null,
    status: "Open",
    comment: "",
    attachments: []
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setForm(prev => ({ ...prev, attachments: files }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: "1600px", margin: "auto" }}>
      <Grid container spacing={3}>

        {/* MAIN FORM */}
        <Grid item xs={12} md={9}>

          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Create Task</Typography>

              <Grid container spacing={2}>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Task Number"
                    value={form.taskNumber}
                    disabled
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Date Submitted"
                    value={form.submittedDate}
                    disabled
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Issue / Action Item"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={5}
                    label="Detailed Description"
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    select
                    fullWidth
                    label="Priority"
                    value={form.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                  >
                    {priorities.map(p => (
                      <MenuItem key={p}>{p}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Submitted By"
                    value={form.submittedBy}
                    disabled
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    type="date"
                    fullWidth
                    label="Target Date To Resolve"
                    InputLabelProps={{ shrink: true }}
                    value={form.targetDate}
                    onChange={(e) => handleChange("targetDate", e.target.value)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Autocomplete
                    options={users}
                    value={form.owner}
                    onChange={(e, val) => handleChange("owner", val)}
                    renderInput={(params) => (
                      <TextField {...params} label="Owner" />
                    )}
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
                    {statuses.map(s => (
                      <MenuItem key={s}>{s}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Initial Comment"
                    value={form.comment}
                    onChange={(e) => handleChange("comment", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button component="label" variant="outlined">
                    Upload Attachments
                    <input hidden type="file" multiple onChange={handleFileUpload} />
                  </Button>

                  <Box mt={2}>
                    {form.attachments.map((file, index) => (
                      <Chip key={index} label={file.name} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Button variant="contained">Create Task</Button>
                </Grid>

              </Grid>
            </CardContent>
          </Card>

        </Grid>

        {/* RIGHT PANEL */}
        <Grid item xs={12} md={3}>
          <Card sx={{ position: "sticky", top: 16 }}>
            <CardContent>
              <Typography variant="h6">Preview</Typography>

              <Typography mt={2}>Task: {form.title}</Typography>
              <Typography>Priority: {form.priority}</Typography>
              <Typography>Status: {form.status}</Typography>
              <Typography>Owner: {form.owner}</Typography>
              <Typography>Target: {form.targetDate}</Typography>

              <Box mt={2}>
                {form.attachments.map((file, i) => (
                  <Chip key={i} label={file.name} sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}
