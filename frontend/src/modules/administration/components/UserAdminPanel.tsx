import { useMemo, useState } from "react";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageSnackbar } from "@shared/ui/feedback/PageSnackbar";
import { LoadingState } from "@shared/ui/states/LoadingState";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { EmptyState } from "@shared/ui/states/EmptyState";
import {
  adminResetUserPassword,
  createUser,
  fetchDepartmentOptions,
  fetchUsers,
  resendUserInvite,
  updateUser,
  updateUserAccountStatus,
  type DepartmentOption,
  type UserRecord,
} from "@modules/users/services/usersApi";

type UserDto = UserRecord;

type FormState = {
  employeeId: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
  departmentId: number | null;
  designation: string;
  reportingManagerId: number | null;
};

const emptyForm: FormState = {
  employeeId: "",
  fullName: "",
  email: "",
  role: "CONTRIBUTOR",
  active: true,
  departmentId: null,
  designation: "",
  reportingManagerId: null,
};

const ROLE_OPTIONS = ["ADMIN", "PMO_MANAGER", "PROJECT_MANAGER", "TEAM_LEAD", "CONTRIBUTOR", "VIEWER", "KNOWLEDGE_CURATOR"];

function formatStatus(status?: string | null) {
  return status ? status.replaceAll("_", " ") : "Unknown";
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
}

function validateForm(form: FormState) {
  if (!form.employeeId.trim()) {
    return "Employee ID is required.";
  }
  if (!form.fullName.trim()) {
    return "Full name is required.";
  }
  if (!form.email.trim()) {
    return "Email is required.";
  }
  if (!/\S+@\S+\.\S+/.test(form.email.trim())) {
    return "Enter a valid email address.";
  }
  return null;
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

  const showSnackbar = (message: string, severity: "success" | "error" | "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
  });

  const departmentsQuery = useQuery({
    queryKey: ["admin-user-departments"],
    queryFn: fetchDepartmentOptions,
  });

  const filtered = useMemo(
    () =>
      (usersQuery.data ?? []).filter((user) => {
        if (!keyword.trim()) {
          return true;
        }
        const search = keyword.trim().toLowerCase();
        return [user.fullName, user.email, user.employeeId, user.role ?? "", user.departmentName ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(search);
      }),
    [keyword, usersQuery.data]
  );

  const managerOptions = useMemo(
    () => (usersQuery.data ?? []).filter((user) => user.id !== editUser?.id),
    [editUser?.id, usersQuery.data]
  );

  const reload = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const createMutation = useMutation({
    mutationFn: () => createUser(form),
    onSuccess: async (response) => {
      await reload();
      setDialogMode(null);
      setCreatedUser(response);
      setForm(emptyForm);
      setFormError(null);
      showSnackbar("User created.", "success");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unable to create user.";
      setFormError(message);
      showSnackbar(message, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateUser(editUser!.id, form),
    onSuccess: async () => {
      await reload();
      setDialogMode(null);
      setEditUser(null);
      setForm(emptyForm);
      setFormError(null);
      showSnackbar("User updated.", "success");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unable to update user.";
      setFormError(message);
      showSnackbar(message, "error");
    },
  });

  const resendInviteMutation = useMutation({
    mutationFn: (userId: number) => resendUserInvite(userId),
    onSuccess: async (user) => {
      await reload();
      setCreatedUser(user);
      showSnackbar("Invite regenerated.", "success");
    },
    onError: (error) => showSnackbar(error instanceof Error ? error.message : "Unable to resend invite.", "error"),
  });

  const adminResetMutation = useMutation({
    mutationFn: (userId: number) => adminResetUserPassword(userId),
    onSuccess: async (user) => {
      await reload();
      setCreatedUser(user);
      showSnackbar("Reset link generated.", "success");
    },
    onError: (error) => showSnackbar(error instanceof Error ? error.message : "Unable to generate reset link.", "error"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, accountStatus }: { userId: number; accountStatus: string }) =>
      updateUserAccountStatus(userId, accountStatus),
    onSuccess: async (user) => {
      await reload();
      setCreatedUser(user);
      showSnackbar("Status updated.", "success");
    },
    onError: (error) => showSnackbar(error instanceof Error ? error.message : "Unable to update status.", "error"),
  });

  const handleOpenCreate = () => {
    setEditUser(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogMode("create");
  };

  const handleOpenEdit = (user: UserDto) => {
    setEditUser(user);
    setForm({
      employeeId: user.employeeId,
      fullName: user.fullName,
      email: user.email,
      role: user.role ?? "CONTRIBUTOR",
      active: user.active ?? true,
      departmentId: user.departmentId ?? null,
      designation: user.designation ?? "",
      reportingManagerId: user.reportingManagerId ?? null,
    });
    setFormError(null);
    setDialogMode("edit");
  };

  const handleSubmit = () => {
    const validationError = validateForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    if (dialogMode === "create") {
      createMutation.mutate();
      return;
    }
    if (dialogMode === "edit") {
      updateMutation.mutate();
    }
  };

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5">Users</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage enterprise onboarding, reporting lines, and user account lifecycle.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" onClick={() => void reload()}>
              Refresh
            </Button>
            <Button variant="contained" size="small" onClick={handleOpenCreate}>
              + Create User
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Search by name, email, employee ID, role, or department"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          sx={{ mb: 2 }}
        />

        {usersQuery.isLoading ? (
          <LoadingState variant="table" rows={7} />
        ) : usersQuery.isError ? (
          <ErrorState message={(usersQuery.error as Error).message} onRetry={() => void reload()} />
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
                  <TableCell>Department</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>Reporting Manager</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
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
                    <TableCell>{user.departmentName ?? "-"}</TableCell>
                    <TableCell>{user.designation ?? "-"}</TableCell>
                    <TableCell>{user.reportingManagerName ?? "-"}</TableCell>
                    <TableCell>{user.role ?? "-"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
                        <Chip size="small" label={user.active ? "Active" : "Inactive"} color={user.active ? "success" : "default"} />
                        <Chip size="small" label={formatStatus(user.accountStatus)} color={user.accountStatus === "ACTIVE" ? "success" : "default"} />
                        {user.passwordChangeRequired ? <Chip size="small" label="Password setup required" color="warning" /> : null}
                      </Stack>
                    </TableCell>
                    <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                        <Button size="small" onClick={() => handleOpenEdit(user)}>
                          Edit
                        </Button>
                        <Button size="small" onClick={() => resendInviteMutation.mutate(user.id)} disabled={resendInviteMutation.isPending}>
                          Resend invite
                        </Button>
                        <Button size="small" onClick={() => adminResetMutation.mutate(user.id)} disabled={adminResetMutation.isPending}>
                          Reset password
                        </Button>
                        {user.accountStatus === "SUSPENDED" ? (
                          <Button size="small" onClick={() => statusMutation.mutate({ userId: user.id, accountStatus: "ACTIVE" })} disabled={statusMutation.isPending}>
                            Reactivate
                          </Button>
                        ) : (
                          <Button size="small" onClick={() => statusMutation.mutate({ userId: user.id, accountStatus: "SUSPENDED" })} disabled={statusMutation.isPending}>
                            Suspend
                          </Button>
                        )}
                        <Button
                          size="small"
                          color="warning"
                          onClick={() => statusMutation.mutate({ userId: user.id, accountStatus: "DEACTIVATED" })}
                          disabled={statusMutation.isPending || user.accountStatus === "DEACTIVATED"}
                        >
                          Deactivate
                        </Button>
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
            <TextField size="small" fullWidth required label="Employee ID" value={form.employeeId} onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))} />
            <TextField size="small" fullWidth required label="Full Name" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
            <TextField size="small" fullWidth required label="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            <TextField select size="small" fullWidth label="Role" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>
              {ROLE_OPTIONS.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              fullWidth
              label="Department"
              value={form.departmentId ? String(form.departmentId) : ""}
              onChange={(event) => setForm((current) => ({ ...current, departmentId: event.target.value ? Number(event.target.value) : null }))}
            >
              <MenuItem value="">No department</MenuItem>
              {(departmentsQuery.data ?? []).map((department: DepartmentOption) => (
                <MenuItem key={department.id} value={department.id}>
                  {department.departmentName} ({department.departmentCode})
                </MenuItem>
              ))}
            </TextField>
            <TextField size="small" fullWidth label="Designation" value={form.designation} onChange={(event) => setForm((current) => ({ ...current, designation: event.target.value }))} />
            <TextField
              select
              size="small"
              fullWidth
              label="Reporting Manager"
              value={form.reportingManagerId ? String(form.reportingManagerId) : ""}
              onChange={(event) => setForm((current) => ({ ...current, reportingManagerId: event.target.value ? Number(event.target.value) : null }))}
            >
              <MenuItem value="">No reporting manager</MenuItem>
              {managerOptions.map((manager) => (
                <MenuItem key={manager.id} value={manager.id}>
                  {manager.fullName} ({manager.employeeId})
                </MenuItem>
              ))}
            </TextField>
            {dialogMode === "edit" ? (
              <FormControlLabel
                control={<Switch checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />}
                label="Active"
              />
            ) : (
              <Alert severity="info">New users start in invited state and become active after setting their own password from the activation link.</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogMode(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
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
            <TextField size="small" fullWidth label="Department" value={createdUser?.departmentName ?? "-"} InputProps={{ readOnly: true }} />
            <TextField size="small" fullWidth label="Designation" value={createdUser?.designation ?? "-"} InputProps={{ readOnly: true }} />
            <TextField size="small" fullWidth label="Reporting manager" value={createdUser?.reportingManagerName ?? "-"} InputProps={{ readOnly: true }} />
            <TextField size="small" fullWidth label="Account status" value={formatStatus(createdUser?.accountStatus)} InputProps={{ readOnly: true }} />
            {createdUser?.emailDeliveryStatus ? <Alert severity="info">{createdUser.emailDeliveryStatus}</Alert> : null}
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

      <PageSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((current) => ({ ...current, open: false }))} />
    </Stack>
  );
}
