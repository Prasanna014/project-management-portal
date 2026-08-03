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
type WorkflowState = {
  id: number;
  workflowId: number;
  stateKey: string;
  stateName: string;
  description?: string;
  displayOrder: number;
  initial: boolean;
  terminal: boolean;
  active: boolean;
};

type StateForm = {
  stateKey: string;
  stateName: string;
  description: string;
  displayOrder: string;
  initial: boolean;
  terminal: boolean;
  active: boolean;
};

const emptyStateForm: StateForm = {
  stateKey: "", stateName: "", description: "", displayOrder: "0",
  initial: false, terminal: false, active: true,
};

export function WorkflowStatesPanel() {
  const queryClient = useQueryClient();
  const [workflowId, setWorkflowId] = useState<string>("");
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editState, setEditState] = useState<WorkflowState | null>(null);
  const [form, setForm] = useState<StateForm>(emptyStateForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkflowState | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" as "success" | "error" | "info" });

  const showSnackbar = (msg: string, sev: "success" | "error" | "info") =>
    setSnackbar({ open: true, message: msg, severity: sev });

  const workflowsQuery = useQuery({
    queryKey: ["workflows-list-for-states"],
    queryFn: async () => {
      const res = await httpClient.get<{ content: WorkflowOption[] }>("/api/admin/workflows?page=0&size=200");
      return res.data.content ?? [];
    },
  });

  const statesQuery = useQuery({
    queryKey: ["workflow-states", workflowId],
    queryFn: async () => {
      const res = await httpClient.get<WorkflowState[]>(`/api/admin/workflows/${workflowId}/states`);
      return res.data;
    },
    enabled: !!workflowId,
  });

  const reloadStates = () => queryClient.invalidateQueries({ queryKey: ["workflow-states", workflowId] });

  const createMutation = useMutation({
    mutationFn: () =>
      httpClient.post("/api/admin/workflows/states", {
        workflowId: Number(workflowId),
        stateKey: form.stateKey,
        stateName: form.stateName,
        description: form.description || null,
        displayOrder: Number(form.displayOrder),
        initial: form.initial,
        terminal: form.terminal,
        active: form.active,
      }),
    onSuccess: () => { reloadStates(); setDialogMode(null); showSnackbar("State created.", "success"); },
    onError: (e) => { setFormError((e as Error).message); showSnackbar((e as Error).message, "error"); },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      httpClient.put(`/api/admin/workflows/states/${editState!.id}`, {
        workflowId: Number(workflowId),
        stateKey: form.stateKey,
        stateName: form.stateName,
        description: form.description || null,
        displayOrder: Number(form.displayOrder),
        initial: form.initial,
        terminal: form.terminal,
        active: form.active,
      }),
    onSuccess: () => { reloadStates(); setDialogMode(null); showSnackbar("State updated.", "success"); },
    onError: (e) => { setFormError((e as Error).message); showSnackbar((e as Error).message, "error"); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => httpClient.delete(`/api/admin/workflows/states/${deleteTarget!.id}`),
    onSuccess: () => { reloadStates(); setDeleteTarget(null); showSnackbar("State deleted.", "success"); },
    onError: (e) => showSnackbar((e as Error).message, "error"),
  });

  const handleOpenCreate = () => {
    setForm({ ...emptyStateForm });
    setFormError(null);
    setDialogMode("create");
  };

  const handleOpenEdit = (state: WorkflowState) => {
    setEditState(state);
    setForm({
      stateKey: state.stateKey,
      stateName: state.stateName,
      description: state.description ?? "",
      displayOrder: String(state.displayOrder),
      initial: state.initial,
      terminal: state.terminal,
      active: state.active,
    });
    setFormError(null);
    setDialogMode("edit");
  };

  const states = statesQuery.data ?? [];

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Workflow States</Typography>
        <Typography variant="body2" color="text.secondary">Manage states within a workflow. Select a workflow first.</Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            select
            size="small"
            label="Select Workflow"
            value={workflowId}
            onChange={(e) => setWorkflowId(e.target.value)}
            sx={{ minWidth: 280 }}
          >
            <MenuItem value="">-- Select Workflow --</MenuItem>
            {(workflowsQuery.data ?? []).map((w) => (
              <MenuItem key={w.id} value={String(w.id)}>{w.workflowName} ({w.workflowKey})</MenuItem>
            ))}
          </TextField>
          {workflowId ? (
            <Button variant="contained" size="small" onClick={handleOpenCreate}>+ Add State</Button>
          ) : null}
        </Stack>

        {!workflowId ? (
          <Alert severity="info">Please select a workflow above to view and manage its states.</Alert>
        ) : statesQuery.isLoading ? (
          <LoadingState variant="table" rows={5} />
        ) : states.length === 0 ? (
          <EmptyState title="No states" description="Add states to this workflow." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>State Name</TableCell>
                  <TableCell>Key</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Initial</TableCell>
                  <TableCell>Terminal</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {states.map((state) => (
                  <TableRow key={state.id} hover>
                    <TableCell>{state.id}</TableCell>
                    <TableCell>{state.stateName}</TableCell>
                    <TableCell>{state.stateKey}</TableCell>
                    <TableCell>{state.displayOrder}</TableCell>
                    <TableCell><Chip size="small" label={state.initial ? "Yes" : "No"} color={state.initial ? "primary" : "default"} /></TableCell>
                    <TableCell><Chip size="small" label={state.terminal ? "Yes" : "No"} color={state.terminal ? "warning" : "default"} /></TableCell>
                    <TableCell><Chip size="small" label={state.active ? "Active" : "Inactive"} color={state.active ? "success" : "default"} /></TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Button size="small" onClick={() => handleOpenEdit(state)}>Edit</Button>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(state)}>
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
        <DialogTitle>{dialogMode === "create" ? "Add Workflow State" : "Edit Workflow State"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}
            <TextField size="small" fullWidth required label="State Key" value={form.stateKey} onChange={(e) => setForm((f) => ({ ...f, stateKey: e.target.value }))} />
            <TextField size="small" fullWidth required label="State Name" value={form.stateName} onChange={(e) => setForm((f) => ({ ...f, stateName: e.target.value }))} />
            <TextField size="small" fullWidth label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <TextField size="small" fullWidth type="number" label="Display Order" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))} />
            <FormControlLabel control={<Switch checked={form.initial} onChange={(e) => setForm((f) => ({ ...f, initial: e.target.checked }))} />} label="Initial State" />
            <FormControlLabel control={<Switch checked={form.terminal} onChange={(e) => setForm((f) => ({ ...f, terminal: e.target.checked }))} />} label="Terminal State" />
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

      <ConfirmActionDialog
        open={deleteTarget !== null}
        title="Delete Workflow State"
        message={`Delete state "${deleteTarget?.stateName}"?`}
        confirmLabel="Delete"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />

      <PageSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} />
    </Stack>
  );
}
