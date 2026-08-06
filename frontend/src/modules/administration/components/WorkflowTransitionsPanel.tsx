import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
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
import { Delete as DeleteIcon } from "@mui/icons-material";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@shared/api/httpClient";
import { PageSnackbar } from "@shared/ui/feedback/PageSnackbar";
import { LoadingState } from "@shared/ui/states/LoadingState";
import { EmptyState } from "@shared/ui/states/EmptyState";
import { ConfirmActionDialog } from "@shared/ui/feedback/ConfirmActionDialog";

type WorkflowOption = { id: number; workflowName: string; workflowKey: string };
type WorkflowState = { id: number; stateName: string; stateKey: string; color?: string };
type WorkflowTransition = {
  id: number;
  workflowId: number;
  fromStateId: number;
  fromStateName?: string;
  toStateId: number;
  toStateName?: string;
  toStateColor?: string;
  transitionKey: string;
  transitionName: string;
  buttonLabel?: string;
  displayOrder?: number;
  requiresComment: boolean;
  active: boolean;
};

type TransitionForm = {
  fromStateId: string;
  toStateId: string;
  transitionKey: string;
  transitionName: string;
  buttonLabel: string;
  displayOrder: string;
  requiresComment: boolean;
  active: boolean;
};

const emptyForm: TransitionForm = {
  fromStateId: "", toStateId: "", transitionKey: "", transitionName: "", buttonLabel: "", displayOrder: "0", requiresComment: false, active: true,
};

export function WorkflowTransitionsPanel() {
  const queryClient = useQueryClient();
  const [workflowId, setWorkflowId] = useState<string>("");
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editTransition, setEditTransition] = useState<WorkflowTransition | null>(null);
  const [form, setForm] = useState<TransitionForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkflowTransition | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" as "success" | "error" | "info" });

  const showSnackbar = (msg: string, sev: "success" | "error" | "info") =>
    setSnackbar({ open: true, message: msg, severity: sev });

  const workflowsQuery = useQuery({
    queryKey: ["workflows-list-for-transitions"],
    queryFn: async () => {
      const res = await httpClient.get<{ content: WorkflowOption[] }>("/admin/workflows?page=0&size=200");
      return res.data.content ?? [];
    },
  });

  const statesQuery = useQuery({
    queryKey: ["workflow-states-for-transitions", workflowId],
    queryFn: async () => {
      const res = await httpClient.get<{ content: WorkflowState[] }>(`/admin/workflows/${workflowId}/states?size=200`);
      return res.data.content ?? [];
    },
    enabled: !!workflowId,
  });

  const transitionsQuery = useQuery({
    queryKey: ["workflow-transitions", workflowId],
    queryFn: async () => {
      const res = await httpClient.get<{ content: WorkflowTransition[] }>(`/admin/workflows/${workflowId}/transitions?size=200`);
      return res.data.content ?? [];
    },
    enabled: !!workflowId,
  });

  const reloadTransitions = () => queryClient.invalidateQueries({ queryKey: ["workflow-transitions", workflowId] });

  const buildPayload = () => ({
    workflowId: Number(workflowId),
    fromStateId: Number(form.fromStateId),
    toStateId: Number(form.toStateId),
    transitionKey: form.transitionKey,
    transitionName: form.transitionName,
    buttonLabel: form.buttonLabel || null,
    displayOrder: Number(form.displayOrder) || 0,
    requiresComment: form.requiresComment,
    active: form.active,
  });

  const createMutation = useMutation({
    mutationFn: () => httpClient.post("/admin/workflows/transitions", buildPayload()),
    onSuccess: () => { reloadTransitions(); setDialogMode(null); showSnackbar("Transition created.", "success"); },
    onError: (e) => { setFormError((e as Error).message); showSnackbar((e as Error).message, "error"); },
  });

  const updateMutation = useMutation({
    mutationFn: () => httpClient.put(`/admin/workflows/transitions/${editTransition!.id}`, buildPayload()),
    onSuccess: () => { reloadTransitions(); setDialogMode(null); showSnackbar("Transition updated.", "success"); },
    onError: (e) => { setFormError((e as Error).message); showSnackbar((e as Error).message, "error"); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => httpClient.delete(`/admin/workflows/transitions/${deleteTarget!.id}`),
    onSuccess: () => { reloadTransitions(); setDeleteTarget(null); showSnackbar("Transition deleted.", "success"); },
    onError: (e) => showSnackbar((e as Error).message, "error"),
  });

  const states = statesQuery.data ?? [];
  const transitions = transitionsQuery.data ?? [];

  const handleOpenCreate = () => { setForm({ ...emptyForm }); setFormError(null); setDialogMode("create"); };
  const handleOpenEdit = (t: WorkflowTransition) => {
    setEditTransition(t);
    setForm({ fromStateId: String(t.fromStateId), toStateId: String(t.toStateId), transitionKey: t.transitionKey, transitionName: t.transitionName, buttonLabel: t.buttonLabel ?? "", displayOrder: String(t.displayOrder ?? 0), requiresComment: t.requiresComment, active: t.active });
    setFormError(null);
    setDialogMode("edit");
  };

  const stateName = (id: number) => states.find((s) => s.id === id)?.stateName ?? String(id);

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Workflow Transitions</Typography>
        <Typography variant="body2" color="text.secondary">Configure valid state transitions within a workflow.</Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            select size="small" label="Select Workflow" value={workflowId}
            onChange={(e) => setWorkflowId(e.target.value)} sx={{ minWidth: 280 }}
          >
            <MenuItem value="">-- Select Workflow --</MenuItem>
            {(workflowsQuery.data ?? []).map((w) => (
              <MenuItem key={w.id} value={String(w.id)}>{w.workflowName}</MenuItem>
            ))}
          </TextField>
          {workflowId ? (
            <Button variant="contained" size="small" onClick={handleOpenCreate}>+ Add Transition</Button>
          ) : null}
        </Stack>

        {!workflowId ? (
          <Alert severity="info">Select a workflow to manage its transitions.</Alert>
        ) : transitionsQuery.isLoading ? (
          <LoadingState variant="table" rows={5} />
        ) : transitions.length === 0 ? (
          <EmptyState title="No transitions" description="Add transitions for this workflow." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>From State</TableCell>
                  <TableCell>To State</TableCell>
                  <TableCell>Transition Name</TableCell>
                  <TableCell>Button Label</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Comment Req.</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {transitions.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>{t.id}</TableCell>
                    <TableCell>{t.fromStateName ?? stateName(t.fromStateId)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                        {t.toStateColor && <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: t.toStateColor, flexShrink: 0 }} />}
                        {t.toStateName ?? stateName(t.toStateId)}
                      </Box>
                    </TableCell>
                    <TableCell>{t.transitionName}</TableCell>
                    <TableCell>{t.buttonLabel || <span style={{ color: "#aaa" }}>—</span>}</TableCell>
                    <TableCell>{t.displayOrder ?? 0}</TableCell>
                    <TableCell><Chip size="small" label={t.requiresComment ? "Yes" : "No"} /></TableCell>
                    <TableCell><Chip size="small" label={t.active ? "Active" : "Inactive"} color={t.active ? "success" : "default"} /></TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Button size="small" onClick={() => handleOpenEdit(t)}>Edit</Button>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(t)}>
                            <DeleteIcon fontSize="small" />
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
      </Paper>

      <Dialog open={dialogMode !== null} onClose={() => setDialogMode(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogMode === "create" ? "Add Transition" : "Edit Transition"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}
            <TextField select size="small" fullWidth required label="From State" value={form.fromStateId} onChange={(e) => setForm((f) => ({ ...f, fromStateId: e.target.value }))}>
              <MenuItem value="">-- Select --</MenuItem>
              {states.map((s) => <MenuItem key={s.id} value={String(s.id)}>{s.stateName}</MenuItem>)}
            </TextField>
            <TextField select size="small" fullWidth required label="To State" value={form.toStateId} onChange={(e) => setForm((f) => ({ ...f, toStateId: e.target.value }))}>
              <MenuItem value="">-- Select --</MenuItem>
              {states.map((s) => <MenuItem key={s.id} value={String(s.id)}>{s.stateName}</MenuItem>)}
            </TextField>
            <TextField size="small" fullWidth required label="Transition Key" value={form.transitionKey} onChange={(e) => setForm((f) => ({ ...f, transitionKey: e.target.value }))} />
            <TextField size="small" fullWidth required label="Transition Name" value={form.transitionName} onChange={(e) => setForm((f) => ({ ...f, transitionName: e.target.value }))} helperText="Internal name (used in audit logs)" />
            <TextField size="small" fullWidth label="Button Label" value={form.buttonLabel} onChange={(e) => setForm((f) => ({ ...f, buttonLabel: e.target.value }))} helperText="Label shown on the action button in the UI (defaults to Transition Name if blank)" />
            <TextField size="small" fullWidth type="number" label="Display Order" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))} helperText="Lower numbers appear first in the Change Status dialog" />
            <FormControlLabel control={<Switch checked={form.requiresComment} onChange={(e) => setForm((f) => ({ ...f, requiresComment: e.target.checked }))} />} label="Requires Comment" />
            <FormControlLabel control={<Switch checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />} label="Active" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogMode(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => dialogMode === "create" ? createMutation.mutate() : updateMutation.mutate()} disabled={createMutation.isPending || updateMutation.isPending}>
            {dialogMode === "create" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmActionDialog open={deleteTarget !== null} title="Delete Transition" message={`Delete "${deleteTarget?.transitionName}"?`} confirmLabel="Delete" onConfirm={() => deleteMutation.mutate()} onCancel={() => setDeleteTarget(null)} loading={deleteMutation.isPending} />

      <PageSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} />
    </Stack>
  );
}
