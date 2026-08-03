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
import { httpClient } from "@shared/api/httpClient";
import { PageSnackbar } from "@shared/ui/feedback/PageSnackbar";
import { LoadingState } from "@shared/ui/states/LoadingState";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { EmptyState } from "@shared/ui/states/EmptyState";

type UserDto = {
  id: number;
  employeeId: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
};

type FormState = {
  employeeId: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
};

const emptyForm: FormState = { employeeId: "", fullName: "", email: "", role: "", active: true };

export function UserAdminPanel() {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editUser, setEditUser] = useState<UserDto | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" as "success" | "error" | "info" });

  const showSnackbar = (message: string, severity: "success" | "error" | "info") =>
    setSnackbar({ open: true, message, severity });

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await httpClient.get<UserDto[]>("/api/users");
      return res.data;
    },
  });

  const filtered = (usersQuery.data ?? []).filter((u) =>
    !keyword || u.fullName?.toLowerCase().includes(keyword.toLowerCase()) || u.email?.toLowerCase().includes(keyword.toLowerCase())
  );

  const reload = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const createMutation = useMutation({
    mutationFn: () => httpClient.post("/api/users", form),
    onSuccess: () => { reload(); setDialogMode(null); showSnackbar("User created.", "success"); },
    onError: (e) => { setFormError((e as Error).message); showSnackbar((e as Error).message, "error"); },
  });

  const updateMutation = useMutation({
    mutationFn: () => httpClient.put(`/api/users/${editUser!.id}`, form),
    onSuccess: () => { reload(); setDialogMode(null); showSnackbar("User updated.", "success"); },
    onError: (e) => { setFormError((e as Error).message); showSnackbar((e as Error).message, "error"); },
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
                      <Chip size="small" label={user.active ? "Active" : "Inactive"} color={user.active ? "success" : "default"} />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => handleOpenEdit(user)}>Edit</Button>
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

      <PageSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} />
    </Stack>
  );
}
