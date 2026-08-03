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

type RoleOption = { id: number; roleName: string; roleKey: string };
type PermissionOption = { id: number; permissionName: string; permissionKey: string };
type RolePermAssignment = {
  roleId: number;
  permissionId: number;
  permissionName?: string;
  permissionKey?: string;
  grantedAt?: string;
};

export function RolePermissionPanel() {
  const queryClient = useQueryClient();
  const [roleId, setRoleId] = useState<string>("");
  const [selectedPermissionId, setSelectedPermissionId] = useState<string>("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<RolePermAssignment | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" as "success" | "error" | "info" });

  const showSnackbar = (msg: string, sev: "success" | "error" | "info") =>
    setSnackbar({ open: true, message: msg, severity: sev });

  const rolesQuery = useQuery({
    queryKey: ["all-roles-list"],
    queryFn: async () => {
      const res = await httpClient.get<{ content: RoleOption[] }>("/admin/roles?page=0&size=200");
      return res.data.content ?? [];
    },
  });

  const permissionsQuery = useQuery({
    queryKey: ["all-permissions-list"],
    queryFn: async () => {
      const res = await httpClient.get<{ content: PermissionOption[] }>("/admin/permissions?page=0&size=500");
      return res.data.content ?? [];
    },
  });

  const assignmentsQuery = useQuery({
    queryKey: ["role-permissions-assignments", roleId],
    queryFn: async () => {
      const res = await httpClient.get<RolePermAssignment[]>(`/api/admin/roles/assignments/permissions/${roleId}`);
      return res.data;
    },
    enabled: !!roleId,
  });

  const reload = () => queryClient.invalidateQueries({ queryKey: ["role-permissions-assignments", roleId] });

  const assignMutation = useMutation({
    mutationFn: () =>
      httpClient.post("/admin/roles/assignments/permissions", {
        roleId: Number(roleId),
        permissionId: Number(selectedPermissionId),
        grantedBy: null,
      }),
    onSuccess: () => { reload(); setAssignDialogOpen(false); setSelectedPermissionId(""); showSnackbar("Permission granted.", "success"); },
    onError: (e) => { setFormError((e as Error).message); showSnackbar((e as Error).message, "error"); },
  });

  const removeMutation = useMutation({
    mutationFn: () =>
      httpClient.delete(`/api/admin/roles/assignments/permissions/${roleId}/${removeTarget!.permissionId}`),
    onSuccess: () => { reload(); setRemoveTarget(null); showSnackbar("Permission removed.", "success"); },
    onError: (e) => showSnackbar((e as Error).message, "error"),
  });

  const assignments = assignmentsQuery.data ?? [];
  const permMap = new Map((permissionsQuery.data ?? []).map((p) => [p.id, p]));

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Role Permissions</Typography>
        <Typography variant="body2" color="text.secondary">Grant and revoke permissions for roles.</Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            select size="small" label="Select Role" value={roleId}
            onChange={(e) => setRoleId(e.target.value)} sx={{ minWidth: 260 }}
          >
            <MenuItem value="">-- Select Role --</MenuItem>
            {(rolesQuery.data ?? []).map((r) => (
              <MenuItem key={r.id} value={String(r.id)}>{r.roleName} ({r.roleKey})</MenuItem>
            ))}
          </TextField>
          {roleId ? (
            <Button variant="contained" size="small" onClick={() => { setSelectedPermissionId(""); setFormError(null); setAssignDialogOpen(true); }}>
              + Grant Permission
            </Button>
          ) : null}
        </Stack>

        {!roleId ? (
          <Alert severity="info">Select a role to view and manage its permissions.</Alert>
        ) : assignmentsQuery.isLoading ? (
          <LoadingState variant="table" rows={5} />
        ) : assignments.length === 0 ? (
          <EmptyState title="No permissions" description="Grant a permission to this role." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Permission Name</TableCell>
                  <TableCell>Permission Key</TableCell>
                  <TableCell>Granted At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((a) => {
                  const perm = permMap.get(a.permissionId);
                  return (
                    <TableRow key={a.permissionId} hover>
                      <TableCell>{a.permissionName ?? perm?.permissionName ?? a.permissionId}</TableCell>
                      <TableCell>{perm?.permissionKey ?? "-"}</TableCell>
                      <TableCell>{a.grantedAt ? new Date(a.grantedAt).toLocaleDateString() : "-"}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Remove Permission">
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
        <DialogTitle>Grant Permission</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}
            <TextField select size="small" fullWidth required label="Select Permission" value={selectedPermissionId} onChange={(e) => setSelectedPermissionId(e.target.value)}>
              <MenuItem value="">-- Select --</MenuItem>
              {(permissionsQuery.data ?? []).map((p) => (
                <MenuItem key={p.id} value={String(p.id)}>{p.permissionName} ({p.permissionKey})</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => assignMutation.mutate()} disabled={!selectedPermissionId || assignMutation.isPending}>Grant</Button>
        </DialogActions>
      </Dialog>

      <ConfirmActionDialog open={removeTarget !== null} title="Remove Permission" message={`Revoke "${removeTarget?.permissionName ?? removeTarget?.permissionId}" from this role?`} confirmLabel="Revoke" onConfirm={() => removeMutation.mutate()} onCancel={() => setRemoveTarget(null)} loading={removeMutation.isPending} />

      <PageSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} />
    </Stack>
  );
}
