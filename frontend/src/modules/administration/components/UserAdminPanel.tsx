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
  Link,
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
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageSnackbar } from "@shared/ui/feedback/PageSnackbar";
import { LoadingState } from "@shared/ui/states/LoadingState";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { EmptyState } from "@shared/ui/states/EmptyState";
import {
  adminResetUserPassword,
  createUser,
  fetchUsers,
  resendUserInvite,
  updateUser,
  updateUserAccountStatus,
  type UserRecord,
} from "@modules/users/services/usersApi";

type UserDto = UserRecord;

type FormState = {
  employeeId: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
};

const emptyForm: FormState = { employeeId: "", fullName: "", email: "", role: "", active: true };

function formatStatus(status?: string | null) {
  return status ? status.replaceAll("_", " ") : "Unknown";
}

export function UserAdminPanel() {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editUser, setEditUser] = useState<UserDto | null>(null);
  const [createdUser, setCreatedUser] = useState<UserDto | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" as "success" | "error" | "info" });

  const showSnackbar = (message: string, severity: "success" | "error" | "info") =>
    setSnackbar({ open: true, message, severity });

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
  });

  const filtered = (usersQuery.data ?? []).filter((u) =>
    !keyword || u.fullName?.toLowerCase().includes(keyword.toLowerCase()) || u.email?.toLowerCase().includes(keyword.toLowerCase())
  );

  const reload = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const createMutation = useMutation({
    mutationFn: () => createUser(form),
    onSuccess: (response) => {
      reload();
      setDialogMode(null);
      setCreatedUser(response);
      showSnackbar("User created.", "success");
    },
    onError: (e) => { setFormError((e as Error).message); showSnackbar((e as Error).message, "error"); },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateUser(editUser!.id, form),
    onSuccess: () => { reload(); setDialogMode(null); showSnackbar("User updated.", "success"); },
    onError: (e) => { setFormError((e as Error).message); showSnackbar((e as Error).message, "error"); },
  });

  const resendInviteMutation = useMutation({
    mutationFn: (userId: number) => resendUserInvite(userId),
    onSuccess: (user) => { reload(); setCreatedUser(user); showSnackbar("Invite regenerated.", "success"); },
    onError: (e) => showSnackbar((e as Error).message, "error"),
  });

  const adminResetMutation = useMutation({
    mutationFn: (userId: number) => adminResetUserPassword(userId),
    onSuccess: (user) => { reload(); setCreatedUser(user); showSnackbar("Reset link generated.", "success"); },
    onError: (e) => showSnackbar((e as Error).message, "error"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, accountStatus }: { userId: number; accountStatus: string }) => updateUserAccountStatus(userId, accountStatus),
    onSuccess: (user) => { reload(); setCreatedUser(user); showSnackbar("Status updated.", "success"); },
    onError: (e) => showSnackbar((e as Error).message, "error"),
  });

  const handleOpenCreate = () => {
    setForm(emptyForm);
    setFormError(null);
    setDialogMode("create");
  };

  const handleOpenEdit = (user: UserDto) => {
    setEditUser(user);
    setForm({ employeeId: user.employeeId, fullName: user.fullName, email: user.email, role: user.role ?? "", active: user.active ?? true });
    setFormError(null);
    setDialogMode("edit");
  };

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5">Users</Typography>
            <Typography variant="body2" color="text.secondary">Manage system user accounts.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" onClick={reload}>Refresh</Button>
            <Button variant="contained" size="small" onClick={handleOpenCreate}>+ Create User</Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Search by name or email"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          sx={{ mb: 2 }}
        />

        {usersQuery.isLoading ? (
          <LoadingState variant="table" rows={7} />
        ) : usersQuery.isError ? (
          <ErrorState message={(usersQuery.error as Error).message} onRetry={reload} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No users found" description="Create a user to get started." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.employeeId}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role ?? "-"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
                        <Chip size="small" label={user.active ? "Active" : "Inactive"} color={user.active ? "success" : "default"} />
                        <Chip size="small" label={formatStatus(user.accountStatus)} color={user.accountStatus === "ACTIVE" ? "success" : "default"} />
                        {user.passwordChangeRequired ? <Chip size="small" label="Password setup required" color="warning" /> : null}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                        <Button size="small" onClick={() => handleOpenEdit(user)}>Edit</Button>
                        <Button size="small" onClick={() => resendInviteMutation.mutate(user.id)} disabled={resendInviteMutation.isPending}>Resend invite</Button>
                        <Button size="small" onClick={() => adminResetMutation.mutate(user.id)} disabled={adminResetMutation.isPending}>Reset password</Button>
                        {user.accountStatus === "SUSPENDED" ? (
                          <Button size="small" onClick={() => statusMutation.mutate({ userId: user.id, accountStatus: "ACTIVE" })} disabled={statusMutation.isPending}>Reactivate</Button>
                        ) : (
                          <Button size="small" onClick={() => statusMutation.mutate({ userId: user.id, accountStatus: "SUSPENDED" })} disabled={statusMutation.isPending}>Suspend</Button>
                        )}
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
        <DialogTitle>{dialogMode === "create" ? "Create User" : "Edit User"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}
            <TextField size="small" fullWidth required label="Employee ID" value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))} />
            <TextField size="small" fullWidth required label="Full Name" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
            <TextField size="small" fullWidth required label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <TextField select size="small" fullWidth label="Role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              <MenuItem value="">-- None --</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="MANAGER">Manager</MenuItem>
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="VIEWER">Viewer</MenuItem>
            </TextField>
            <FormControlLabel
              control={<Switch checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />}
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogMode(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => dialogMode === "create" ? createMutation.mutate() : updateMutation.mutate()} disabled={createMutation.isPending || updateMutation.isPending}>
            {dialogMode === "create" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(createdUser)} onClose={() => setCreatedUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>User onboarding</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Alert severity="success">
              Admin now provisions accounts using invite and reset links instead of sharing passwords directly.
            </Alert>
            <TextField size="small" fullWidth label="Login email" value={createdUser?.email ?? ""} InputProps={{ readOnly: true }} />
            <TextField size="small" fullWidth label="Account status" value={formatStatus(createdUser?.accountStatus)} InputProps={{ readOnly: true }} />
            {createdUser?.onboardingAccessLink ? (
              <Alert severity="info">
                Invite link:{" "}
                <Link href={createdUser.onboardingAccessLink} target="_blank" rel="noreferrer">
                  activate account
                </Link>
              </Alert>
            ) : null}
            {createdUser?.passwordResetLink ? (
              <Alert severity="warning">
                Reset link:{" "}
                <Link href={createdUser.passwordResetLink} target="_blank" rel="noreferrer">
                  reset password
                </Link>
              </Alert>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatedUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <PageSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} />
    </Stack>
  );
}
