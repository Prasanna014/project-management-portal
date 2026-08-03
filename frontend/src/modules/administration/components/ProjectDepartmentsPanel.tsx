import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
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
import { Delete as DeleteIcon } from "@mui/icons-material";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@shared/api/httpClient";
import { PageSnackbar } from "@shared/ui/feedback/PageSnackbar";
import { LoadingState } from "@shared/ui/states/LoadingState";
import { EmptyState } from "@shared/ui/states/EmptyState";
import { ConfirmActionDialog } from "@shared/ui/feedback/ConfirmActionDialog";

type ProjectOption = { id: number; projectName: string; projectCode: string };
type DepartmentOption = { id: number; departmentName: string; departmentCode: string };
type ProjectDeptAssignment = { projectId: number; departmentId: number; departmentName?: string; departmentCode?: string };

export function ProjectDepartmentsPanel() {
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState<string>("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<ProjectDeptAssignment | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" as "success" | "error" | "info" });

  const showSnackbar = (msg: string, sev: "success" | "error" | "info") =>
    setSnackbar({ open: true, message: msg, severity: sev });

  const projectsQuery = useQuery({
    queryKey: ["all-projects-for-depts"],
    queryFn: async () => {
      const res = await httpClient.get<ProjectOption[]>("/projects");
      return Array.isArray(res.data) ? res.data : (res.data as { content?: ProjectOption[] }).content ?? [];
    },
  });

  const deptsQuery = useQuery({
    queryKey: ["all-departments-for-assignment"],
    queryFn: async () => {
      const res = await httpClient.get<{ content: DepartmentOption[] }>("/admin/departments?page=0&size=200");
      return res.data.content ?? [];
    },
  });

  const assignmentsQuery = useQuery({
    queryKey: ["project-dept-assignments", projectId],
    queryFn: async () => {
      const res = await httpClient.get<ProjectDeptAssignment[]>(`/api/admin/departments/assignments/projects/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
  });

  const reload = () => queryClient.invalidateQueries({ queryKey: ["project-dept-assignments", projectId] });

  const assignMutation = useMutation({
    mutationFn: () =>
      httpClient.post("/admin/departments/assignments/projects", {
        projectId: Number(projectId),
        departmentId: Number(selectedDeptId),
      }),
    onSuccess: () => { reload(); setAssignDialogOpen(false); setSelectedDeptId(""); showSnackbar("Department assigned.", "success"); },
    onError: (e) => { setFormError((e as Error).message); showSnackbar((e as Error).message, "error"); },
  });

  const removeMutation = useMutation({
    mutationFn: () =>
      httpClient.delete(`/api/admin/departments/assignments/projects/${projectId}/departments/${removeTarget!.departmentId}`),
    onSuccess: () => { reload(); setRemoveTarget(null); showSnackbar("Department removed.", "success"); },
    onError: (e) => showSnackbar((e as Error).message, "error"),
  });

  const assignments = assignmentsQuery.data ?? [];
  const deptMap = new Map((deptsQuery.data ?? []).map((d) => [d.id, d]));

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Project Departments</Typography>
        <Typography variant="body2" color="text.secondary">Link departments to projects for access boundary management.</Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField select size="small" label="Select Project" value={projectId} onChange={(e) => setProjectId(e.target.value)} sx={{ minWidth: 280 }}>
            <MenuItem value="">-- Select Project --</MenuItem>
            {(projectsQuery.data ?? []).map((p) => (
              <MenuItem key={p.id} value={String(p.id)}>{p.projectName} ({p.projectCode})</MenuItem>
            ))}
          </TextField>
          {projectId ? (
            <Button variant="contained" size="small" onClick={() => { setSelectedDeptId(""); setFormError(null); setAssignDialogOpen(true); }}>
              + Assign Department
            </Button>
          ) : null}
        </Stack>

        {!projectId ? (
          <Alert severity="info">Select a project to manage its department assignments.</Alert>
        ) : assignmentsQuery.isLoading ? (
          <LoadingState variant="table" rows={4} />
        ) : assignments.length === 0 ? (
          <EmptyState title="No departments assigned" description="Assign a department to this project." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Department Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((a) => {
                  const dept = deptMap.get(a.departmentId);
                  return (
                    <TableRow key={a.departmentId} hover>
                      <TableCell>{a.departmentName ?? dept?.departmentName ?? a.departmentId}</TableCell>
                      <TableCell>{dept?.departmentCode ?? "-"}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Remove Assignment">
                          <IconButton size="small" color="error" onClick={() => setRemoveTarget(a)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Department</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}
            <TextField select size="small" fullWidth required label="Department" value={selectedDeptId} onChange={(e) => setSelectedDeptId(e.target.value)}>
              <MenuItem value="">-- Select --</MenuItem>
              {(deptsQuery.data ?? []).map((d) => (
                <MenuItem key={d.id} value={String(d.id)}>{d.departmentName}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => assignMutation.mutate()} disabled={!selectedDeptId || assignMutation.isPending}>Assign</Button>
        </DialogActions>
      </Dialog>

      <ConfirmActionDialog open={removeTarget !== null} title="Remove Department" message={`Remove this department assignment from the project?`} confirmLabel="Remove" onConfirm={() => removeMutation.mutate()} onCancel={() => setRemoveTarget(null)} loading={removeMutation.isPending} />

      <PageSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} />
    </Stack>
  );
}
