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

type ProjectOption = { id: number; projectName: string; projectCode: string };
type UserOption = { id: number; fullName: string; email: string };
type ProjectMember = {
  id: number;
  projectId: number;
  userId: number;
  userName?: string;
  memberRole: string;
  active: boolean;
  createdAt?: string;
};

type MemberForm = { userId: string; memberRole: string; active: boolean };
const emptyForm: MemberForm = { userId: "", memberRole: "MEMBER", active: true };

export function ProjectMembersPanel() {
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState<string>("");
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editMember, setEditMember] = useState<ProjectMember | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectMember | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" as "success" | "error" | "info" });

  const showSnackbar = (msg: string, sev: "success" | "error" | "info") =>
    setSnackbar({ open: true, message: msg, severity: sev });

  const projectsQuery = useQuery({
    queryKey: ["all-projects-for-members"],
    queryFn: async () => {
      const res = await httpClient.get<ProjectOption[]>("/api/projects");
      return Array.isArray(res.data) ? res.data : (res.data as { content?: ProjectOption[] }).content ?? [];
    },
  });

  const usersQuery = useQuery({
    queryKey: ["all-users-for-members"],
    queryFn: async () => {
      const res = await httpClient.get<UserOption[]>("/api/users");
      return res.data;
    },
  });

  const membersQuery = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      const res = await httpClient.get<{ content?: ProjectMember[] }>(`/api/admin/project-members?projectId=${projectId}&page=0&size=200`);
      return (res.data as { content?: ProjectMember[] }).content ?? (Array.isArray(res.data) ? res.data as ProjectMember[] : []);
    },
    enabled: !!projectId,
  });

  const reload = () => queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });

  const createMutation = useMutation({
    mutationFn: () =>
      httpClient.post("/api/admin/project-members", {
        projectId: Number(projectId),
        userId: Number(form.userId),
        memberRole: form.memberRole || "MEMBER",
        active: form.active,
      }),
    onSuccess: () => { reload(); setDialogMode(null); showSnackbar("Member added.", "success"); },
    onError: (e) => { setFormError((e as Error).message); showSnackbar((e as Error).message, "error"); },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      httpClient.put(`/api/admin/project-members/${editMember!.id}`, {
        projectId: Number(projectId),
        userId: Number(form.userId),
        memberRole: form.memberRole,
        active: form.active,
      }),
    onSuccess: () => { reload(); setDialogMode(null); showSnackbar("Member updated.", "success"); },
    onError: (e) => { setFormError((e as Error).message); showSnackbar((e as Error).message, "error"); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => httpClient.delete(`/api/admin/project-members/${deleteTarget!.id}`),
    onSuccess: () => { reload(); setDeleteTarget(null); showSnackbar("Member removed.", "success"); },
    onError: (e) => showSnackbar((e as Error).message, "error"),
  });

  const members = membersQuery.data ?? [];
  const handleOpenCreate = () => { setForm({ ...emptyForm }); setFormError(null); setDialogMode("create"); };
  const handleOpenEdit = (m: ProjectMember) => {
    setEditMember(m);
    setForm({ userId: String(m.userId), memberRole: m.memberRole, active: m.active });
    setFormError(null);
    setDialogMode("edit");
  };

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Project Members</Typography>
        <Typography variant="body2" color="text.secondary">Manage project team members and their roles.</Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField select size="small" label="Select Project" value={projectId} onChange={(e) => setProjectId(e.target.value)} sx={{ minWidth: 280 }}>
            <MenuItem value="">-- Select Project --</MenuItem>
            {(projectsQuery.data ?? []).map((p) => (
              <MenuItem key={p.id} value={String(p.id)}>{p.projectName}</MenuItem>
            ))}
          </TextField>
          {projectId ? <Button variant="contained" size="small" onClick={handleOpenCreate}>+ Add Member</Button> : null}
        </Stack>

        {!projectId ? (
          <Alert severity="info">Select a project to manage its members.</Alert>
        ) : membersQuery.isLoading ? (
          <LoadingState variant="table" rows={5} />
        ) : members.length === 0 ? (
          <EmptyState title="No members" description="Add team members to this project." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>{m.id}</TableCell>
                    <TableCell>{m.userName ?? m.userId}</TableCell>
                    <TableCell>{m.memberRole}</TableCell>
                    <TableCell><Chip size="small" label={m.active ? "Active" : "Inactive"} color={m.active ? "success" : "default"} /></TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Button size="small" onClick={() => handleOpenEdit(m)}>Edit</Button>
                        <Tooltip title="Remove Member">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(m)}>
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

      <Dialog open={dialogMode !== null} onClose={() => setDialogMode(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{dialogMode === "create" ? "Add Member" : "Edit Member"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}
            {dialogMode === "create" ? (
              <TextField select size="small" fullWidth required label="User" value={form.userId} onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}>
                <MenuItem value="">-- Select User --</MenuItem>
                {(usersQuery.data ?? []).map((u) => (
                  <MenuItem key={u.id} value={String(u.id)}>{u.fullName} ({u.email})</MenuItem>
                ))}
              </TextField>
            ) : null}
            <TextField select size="small" fullWidth required label="Member Role" value={form.memberRole} onChange={(e) => setForm((f) => ({ ...f, memberRole: e.target.value }))}>
              <MenuItem value="MEMBER">Member</MenuItem>
              <MenuItem value="LEAD">Lead</MenuItem>
              <MenuItem value="REVIEWER">Reviewer</MenuItem>
              <MenuItem value="OBSERVER">Observer</MenuItem>
            </TextField>
            <FormControlLabel control={<Switch checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />} label="Active" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogMode(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => dialogMode === "create" ? createMutation.mutate() : updateMutation.mutate()} disabled={createMutation.isPending || updateMutation.isPending}>
            {dialogMode === "create" ? "Add" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmActionDialog open={deleteTarget !== null} title="Remove Member" message={`Remove "${deleteTarget?.userName ?? deleteTarget?.userId}" from this project?`} confirmLabel="Remove" onConfirm={() => deleteMutation.mutate()} onCancel={() => setDeleteTarget(null)} loading={deleteMutation.isPending} />

      <PageSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} />
    </Stack>
  );
}
