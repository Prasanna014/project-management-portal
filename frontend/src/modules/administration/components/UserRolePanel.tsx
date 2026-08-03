import {
  Alert,
  Box,
  Button,
  Chip,
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

type UserOption = { id: number; fullName: string; email: string };
type RoleOption = { id: number; roleName: string; roleKey: string };
type UserRoleAssignment = {
  userId: number;
  roleId: number;
  roleName?: string;
  roleKey?: string;
  assignedAt?: string;
  active?: boolean;
};

export function UserRolePanel() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string>("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<UserRoleAssignment | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" as "success" | "error" | "info" });

  const showSnackbar = (msg: string, sev: "success" | "error" | "info") =>
    setSnackbar({ open: true, message: msg, severity: sev });

  const usersQuery = useQuery({
    queryKey: ["all-users-for-roles"],
    queryFn: async () => {
      const res = await httpClient.get<UserOption[]>("/api/users");
      return res.data;
    },
  });

  const rolesQuery = useQuery({
    queryKey: ["all-roles-for-assignment"],
    queryFn: async () => {
      const res = await httpClient.get<{ content: RoleOption[] }>("/api/admin/roles?page=0&size=200");
      return res.data.content ?? [];
    },
  });

  const assignmentsQuery = useQuery({
    queryKey: ["user-roles-assignments", userId],
    queryFn: async () => {
      const res = await httpClient.get<UserRoleAssignment[]>(`/api/admin/roles/assignments/users/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });

  const reload = () => queryClient.invalidateQueries({ queryKey: ["user-roles-assignments", userId] });

  const assignMutation = useMutation({
    mutationFn: () =>
      httpClient.post("/api/admin/roles/assignments/users", {
        userId: Number(userId),
        roleId: Number(selectedRoleId),
        assignedBy: null,
        active: true,
      }),
    onSuccess: () => { reload(); setAssignDialogOpen(false); setSelectedRoleId(""); showSnackbar("Role assigned.", "success"); },
    onError: (e) => { setFormError((e as Error).message); showSnackbar((e as Error).message, "error"); },
  });

  const removeMutation = useMutation({
    mutationFn: () =>
      httpClient.delete(`/api/admin/roles/assignments/users/${userId}/roles/${removeTarget!.roleId}`),
    onSuccess: () => { reload(); setRemoveTarget(null); showSnackbar("Role removed.", "success"); },
    onError: (e) => showSnackbar((e as Error).message, "error"),
  });

  const assignments = assignmentsQuery.data ?? [];
  const roleMap = new Map((rolesQuery.data ?? []).map((r) => [r.id, r]));

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">User Roles</Typography>
        <Typography variant="body2" color="text.secondary">Assign and remove roles from users.</Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            select size="small" label="Select User" value={userId}
            onChange={(e) => setUserId(e.target.value)} sx={{ minWidth: 280 }}
          >
            <MenuItem value="">-- Select User --</MenuItem>
            {(usersQuery.data ?? []).map((u) => (
              <MenuItem key={u.id} value={String(u.id)}>{u.fullName} ({u.email})</MenuItem>
            ))}
          </TextField>
          {userId ? (
            <Button variant="contained" size="small" onClick={() => { setSelectedRoleId(""); setFormError(null); setAssignDialogOpen(true); }}>
              + Assign Role
            </Button>
          ) : null}
        </Stack>

        {!userId ? (
          <Alert severity="info">Select a user to view and manage their roles.</Alert>
        ) : assignmentsQuery.isLoading ? (
          <LoadingState variant="table" rows={5} />
        ) : assignments.length === 0 ? (
          <EmptyState title="No roles assigned" description="Assign a role to this user." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Role Name</TableCell>
                  <TableCell>Role Key</TableCell>
                  <TableCell>Assigned At</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((a) => {
                  const role = roleMap.get(a.roleId);
                  return (
                    <TableRow key={a.roleId} hover>
                      <TableCell>{a.roleName ?? role?.roleName ?? a.roleId}</TableCell>
                      <TableCell>{role?.roleKey ?? "-"}</TableCell>
                      <TableCell>{a.assignedAt ? new Date(a.assignedAt).toLocaleDateString() : "-"}</TableCell>
                      <TableCell><Chip size="small" label={a.active !== false ? "Active" : "Inactive"} color={a.active !== false ? "success" : "default"} /></TableCell>
                      <TableCell align="right">
                        <Tooltip title="Remove Role">
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
        <DialogTitle>Assign Role</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}
            <TextField select size="small" fullWidth required label="Select Role" value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)}>
              <MenuItem value="">-- Select Role --</MenuItem>
              {(rolesQuery.data ?? []).map((r) => (
                <MenuItem key={r.id} value={String(r.id)}>{r.roleName} ({r.roleKey})</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => assignMutation.mutate()} disabled={!selectedRoleId || assignMutation.isPending}>Assign</Button>
        </DialogActions>
      </Dialog>

      <ConfirmActionDialog open={removeTarget !== null} title="Remove Role" message={`Remove role "${removeTarget?.roleName ?? removeTarget?.roleId}" from this user?`} confirmLabel="Remove" onConfirm={() => removeMutation.mutate()} onCancel={() => setRemoveTarget(null)} loading={removeMutation.isPending} />

      <PageSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} />
    </Stack>
  );
}
