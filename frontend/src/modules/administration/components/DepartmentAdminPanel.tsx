import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { httpClient } from "@shared/api/httpClient";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeptSummary {
  id: number;
  departmentName: string;
}

interface UserSummary {
  id: number;
  fullName: string;
  employeeId: string;
}

interface WorkflowSummary {
  id: number;
  workflowName: string;
}

interface DepartmentRecord {
  id: number;
  departmentCode: string;
  departmentName: string;
  description?: string;
  parentDepartmentId?: number;
  parentDepartmentName?: string;
  departmentHeadId?: number;
  departmentHeadName?: string;
  costCenter?: string;
  departmentEmail?: string;
  departmentPhone?: string;
  workingHours?: string;
  defaultWorkflowId?: number;
  defaultWorkflowName?: string;
  active: boolean;
}

interface DeptFormState {
  departmentCode: string;
  departmentName: string;
  description: string;
  parentDepartmentId: string;
  departmentHeadId: string;
  costCenter: string;
  departmentEmail: string;
  departmentPhone: string;
  workingHours: string;
  defaultWorkflowId: string;
  active: boolean;
}

const emptyForm: DeptFormState = {
  departmentCode: "",
  departmentName: "",
  description: "",
  parentDepartmentId: "",
  departmentHeadId: "",
  costCenter: "",
  departmentEmail: "",
  departmentPhone: "",
  workingHours: "",
  defaultWorkflowId: "",
  active: true,
};

function formToPayload(form: DeptFormState) {
  return {
    departmentCode: form.departmentCode,
    departmentName: form.departmentName,
    description: form.description || null,
    parentDepartmentId: form.parentDepartmentId ? Number(form.parentDepartmentId) : null,
    departmentHeadId: form.departmentHeadId ? Number(form.departmentHeadId) : null,
    costCenter: form.costCenter || null,
    departmentEmail: form.departmentEmail || null,
    departmentPhone: form.departmentPhone || null,
    workingHours: form.workingHours || null,
    defaultWorkflowId: form.defaultWorkflowId ? Number(form.defaultWorkflowId) : null,
    active: form.active,
  };
}

function recordToForm(rec: DepartmentRecord): DeptFormState {
  return {
    departmentCode: rec.departmentCode ?? "",
    departmentName: rec.departmentName ?? "",
    description: rec.description ?? "",
    parentDepartmentId: rec.parentDepartmentId ? String(rec.parentDepartmentId) : "",
    departmentHeadId: rec.departmentHeadId ? String(rec.departmentHeadId) : "",
    costCenter: rec.costCenter ?? "",
    departmentEmail: rec.departmentEmail ?? "",
    departmentPhone: rec.departmentPhone ?? "",
    workingHours: rec.workingHours ?? "",
    defaultWorkflowId: rec.defaultWorkflowId ? String(rec.defaultWorkflowId) : "",
    active: rec.active ?? true,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export const DepartmentAdminPanel: React.FC = () => {
  // list
  const [rows, setRows] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "true" | "false">("all");

  // lookups
  const [deptLookup, setDeptLookup] = useState<DeptSummary[]>([]);
  const [userLookup, setUserLookup] = useState<UserSummary[]>([]);
  const [workflowLookup, setWorkflowLookup] = useState<WorkflowSummary[]>([]);

  // dialog
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<DeptFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // delete
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // snackbar
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // ─── Loaders ──────────────────────────────────────────────────────────────

  const loadRows = () => {
    setLoading(true);
    const params: Record<string, string> = {
      page: String(page),
      size: "20",
      sortBy: "departmentName",
      sortDir: "asc",
    };
    if (keyword.trim()) params.keyword = keyword.trim();
    if (activeFilter !== "all") params.active = activeFilter;

    httpClient
      .get<{ content: DepartmentRecord[]; totalPages: number; totalElements: number }>("/admin/departments", { params })
      .then((res) => {
        setRows(res.data?.content ?? []);
        setTotalPages(res.data?.totalPages ?? 0);
        setTotalElements(res.data?.totalElements ?? 0);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  const loadLookups = () => {
    httpClient
      .get<{ content: DeptSummary[] }>("/admin/departments", { params: { page: "0", size: "200", active: "true" } })
      .then((r) => setDeptLookup(r.data?.content ?? []));

    httpClient
      .get<UserSummary[]>("/users")
      .then((r) => setUserLookup(r.data ?? []));

    httpClient
      .get<{ content: WorkflowSummary[] }>("/admin/workflows", { params: { page: "0", size: "200", active: "true" } })
      .then((r) => setWorkflowLookup(r.data?.content ?? []));
  };

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    loadRows();
  }, [page, keyword, activeFilter]);

  // ─── Dialog helpers ───────────────────────────────────────────────────────

  const openCreate = () => {
    setForm(emptyForm);
    setFormError("");
    setEditId(null);
    setDialogMode("create");
  };

  const openEdit = (rec: DepartmentRecord) => {
    setForm(recordToForm(rec));
    setFormError("");
    setEditId(rec.id);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setFormError("");
  };

  const handleField =
    (field: keyof DeptFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = () => {
    if (!form.departmentCode.trim()) { setFormError("Department Code is required."); return; }
    if (!form.departmentName.trim()) { setFormError("Department Name is required."); return; }
    setFormError("");
    setSaving(true);

    const promise =
      dialogMode === "create"
        ? httpClient.post("/admin/departments", formToPayload(form))
        : httpClient.put(`/api/admin/departments/${editId}`, formToPayload(form));

    promise
      .then(() => {
        closeDialog();
        loadRows();
        setSnack({ open: true, message: dialogMode === "create" ? "Department created." : "Department updated.", severity: "success" });
      })
      .catch((err) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Operation failed.";
        setFormError(msg);
      })
      .finally(() => setSaving(false));
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setDeleting(true);
    httpClient
      .delete(`/api/admin/departments/${deleteId}`)
      .then(() => {
        setDeleteId(null);
        loadRows();
        setSnack({ open: true, message: "Department deleted.", severity: "success" });
      })
      .catch((err) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Delete failed.";
        setSnack({ open: true, message: msg, severity: "error" });
        setDeleteId(null);
      })
      .finally(() => setDeleting(false));
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Stack spacing={2.5}>
      {/* Header */}
      <Paper sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
          <Box>
            <Typography variant="h5" fontWeight={600}>Departments</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Manage department master data — structure, heads, cost centres, and working hours.
            </Typography>
          </Box>
          <Button variant="contained" onClick={openCreate}>+ Create Department</Button>
        </Stack>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <TextField
            fullWidth
            size="small"
            label="Search departments"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value as "all" | "true" | "false"); setPage(0); }}
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </TextField>
          <Button variant="outlined" onClick={() => { loadRows(); }}>Refresh</Button>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
        ) : rows.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography color="text.secondary">No departments found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Parent Dept</TableCell>
                  <TableCell>Head</TableCell>
                  <TableCell>Cost Centre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Working Hours</TableCell>
                  <TableCell>Workflow</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.departmentName}</TableCell>
                    <TableCell>{row.departmentCode}</TableCell>
                    <TableCell>{row.parentDepartmentName ?? "-"}</TableCell>
                    <TableCell>{row.departmentHeadName ?? "-"}</TableCell>
                    <TableCell>{row.costCenter ?? "-"}</TableCell>
                    <TableCell>{row.departmentEmail ?? "-"}</TableCell>
                    <TableCell>{row.departmentPhone ?? "-"}</TableCell>
                    <TableCell>{row.workingHours ?? "-"}</TableCell>
                    <TableCell>{row.defaultWorkflowName ?? "-"}</TableCell>
                    <TableCell>
                      <Chip label={row.active ? "Active" : "Inactive"} color={row.active ? "success" : "default"} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(row)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {totalPages > 1 && (
          <Box p={2} display="flex" alignItems="center" gap={2}>
            <Typography variant="caption" color="text.secondary">{totalElements} total</Typography>
            <Pagination count={totalPages} page={page + 1} onChange={(_, p) => setPage(p - 1)} size="small" />
          </Box>
        )}
      </Paper>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogMode !== null} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>{dialogMode === "create" ? "Create Department" : "Edit Department"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {/* Row 1 */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Department Name *"
                value={form.departmentName}
                onChange={handleField("departmentName")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Department Code *"
                value={form.departmentCode}
                onChange={handleField("departmentCode")}
                fullWidth
                size="small"
              />
            </Grid>

            {/* Row 2 */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Parent Department"
                value={form.parentDepartmentId}
                onChange={handleField("parentDepartmentId")}
                fullWidth
                size="small"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {deptLookup
                  .filter((d) => d.id !== editId)
                  .map((d) => (
                    <MenuItem key={d.id} value={String(d.id)}>{d.departmentName}</MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Department Head"
                value={form.departmentHeadId}
                onChange={handleField("departmentHeadId")}
                fullWidth
                size="small"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {userLookup.map((u) => (
                  <MenuItem key={u.id} value={String(u.id)}>{u.fullName} ({u.employeeId})</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Row 3 */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cost Center"
                value={form.costCenter}
                onChange={handleField("costCenter")}
                fullWidth
                size="small"
                placeholder="e.g. CC-1001"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Default Workflow"
                value={form.defaultWorkflowId}
                onChange={handleField("defaultWorkflowId")}
                fullWidth
                size="small"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {workflowLookup.map((w) => (
                  <MenuItem key={w.id} value={String(w.id)}>{w.workflowName}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Row 4 */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Department Email"
                value={form.departmentEmail}
                onChange={handleField("departmentEmail")}
                fullWidth
                size="small"
                type="email"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Department Phone"
                value={form.departmentPhone}
                onChange={handleField("departmentPhone")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Working Hours"
                value={form.workingHours}
                onChange={handleField("workingHours")}
                fullWidth
                size="small"
                placeholder="e.g. 09:00 – 17:00"
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={form.description}
                onChange={handleField("description")}
                fullWidth
                size="small"
                multiline
                minRows={2}
              />
            </Grid>

            {/* Active toggle */}
            <Grid item xs={12}>
              <Divider />
              <FormControlLabel
                sx={{ mt: 1 }}
                control={
                  <Switch
                    checked={form.active}
                    onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>

          {formError && (
            <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? "Saving…" : dialogMode === "create" ? "Create" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Department</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone. Proceed with deletion?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default DepartmentAdminPanel;
