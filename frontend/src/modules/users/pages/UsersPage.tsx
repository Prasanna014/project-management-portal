import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildActionPermissionCandidates, buildReadPermissionCandidates } from "@shared/auth/permissions";
import { EmptyState } from "@shared/ui/states/EmptyState";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { LoadingState } from "@shared/ui/states/LoadingState";
import { PageSnackbar, type SnackbarSeverity } from "@shared/ui/feedback/PageSnackbar";
import {
  adminResetUserPassword,
  createUser,
  fetchDepartmentOptions,
  fetchUsers,
  resendUserInvite,
  updateUser,
  updateUserAccountStatus,
  type DepartmentOption,
  type UpsertUserPayload,
  type UserRecord,
} from "@modules/users/services/usersApi";

type UserFormState = UpsertUserPayload;

type AccessBlueprint = {
  title: string;
  emphasis: string;
  description: string;
  recommendedPermissions: string[];
  visiblePages: string[];
};

const ROLE_OPTIONS = ["ADMIN", "PMO_MANAGER", "PROJECT_MANAGER", "TEAM_LEAD", "CONTRIBUTOR", "VIEWER", "KNOWLEDGE_CURATOR"];

const INITIAL_FORM: UserFormState = {
  employeeId: "",
  fullName: "",
  email: "",
  role: "CONTRIBUTOR",
  active: true,
  departmentId: null,
  designation: "",
  reportingManagerId: null,
};

const ACCESS_BLUEPRINT: AccessBlueprint[] = [
  {
    title: "Platform Admin",
    emphasis: "Platform governance",
    description: "Own user provisioning, security operations, policy changes, retention overrides, and audit review.",
    recommendedPermissions: ["Users CRUD", "Roles + permission mapping", "Knowledge base retention override", "Audit log read", "Workflow catalog admin"],
    visiblePages: ["Dashboard", "Workspace", "Projects", "Tasks", "Reports", "Users", "Knowledge Base", "Administration", "Settings"],
  },
  {
    title: "PMO / Delivery Manager",
    emphasis: "Cross-project delivery control",
    description: "Coordinate portfolios, manage escalations, review team workload, and standardize reporting.",
    recommendedPermissions: ["Projects read/update", "Tasks assign/export", "Reports read/export", "Knowledge base read", "Team dashboards"],
    visiblePages: ["Dashboard", "Workspace", "Projects", "Tasks", "Reports", "Users", "Knowledge Base", "Settings"],
  },
  {
    title: "Project Manager",
    emphasis: "Project execution",
    description: "Run a project end to end, assign work, maintain schedules, and publish delivery SOPs for the team.",
    recommendedPermissions: ["Project create/update", "Task create/update/assign", "Project member management", "Knowledge base contribute", "Comment moderation"],
    visiblePages: ["Dashboard", "Workspace", "Projects", "Tasks", "Reports", "Users", "Knowledge Base", "Settings"],
  },
  {
    title: "Contributor",
    emphasis: "Daily execution",
    description: "Work on assigned items, collaborate through comments, and maintain team-owned documents.",
    recommendedPermissions: ["Task read/update (own scope)", "Comment + attachment create", "Knowledge base read", "Restore own deleted documents up to 30 days", "Profile self-service"],
    visiblePages: ["Dashboard", "Workspace", "Projects", "Tasks", "Knowledge Base", "Settings"],
  },
  {
    title: "Executive Viewer",
    emphasis: "Decision visibility",
    description: "Consume dashboards, reports, milestone documents, and approved SOPs without operational edit rights.",
    recommendedPermissions: ["Dashboard read", "Reports read/export", "Project read", "Knowledge base read", "No operational mutations"],
    visiblePages: ["Dashboard", "Projects", "Tasks", "Reports", "Knowledge Base", "Settings"],
  },
  {
    title: "Knowledge Curator",
    emphasis: "Controlled documentation",
    description: "Maintain SOP quality, review version history, classify files, and coordinate retention with admins.",
    recommendedPermissions: ["Knowledge base create/update", "Version approval", "Metadata tagging", "User restore support", "SOP publishing"],
    visiblePages: ["Dashboard", "Projects", "Tasks", "Reports", "Knowledge Base", "Settings"],
  },
];

const DELIVERY_RECOMMENDATIONS = [
  "Replace single-string roles with DB-driven role assignments everywhere to align with the backend role-permission model.",
  "Introduce invite onboarding, password reset, and identity federation (SSO/SCIM) before production rollout.",
  "Add department, business unit, and location mapping to user records for approvals, reporting, and access boundaries.",
  "Track lifecycle states separately from active/inactive (invited, active, suspended, offboarded, archived).",
  "Record user changes in audit history and expose self-service profile, MFA status, and recent session visibility.",
];

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
}

function formatAccountStatus(status?: string | null) {
  return status ? status.replaceAll("_", " ") : "Unknown";
}

function validateForm(form: UserFormState) {
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

export function UsersPage() {
  const queryClient = useQueryClient();
  const { hasAnyPermission } = useAuth();
  const canRead = hasAnyPermission(buildReadPermissionCandidates("users"));
  const canCreate = hasAnyPermission(buildActionPermissionCandidates("users", "create"));
  const canUpdate = hasAnyPermission(buildActionPermissionCandidates("users", "update"));

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [createdUser, setCreatedUser] = useState<UserRecord | null>(null);
  const [form, setForm] = useState<UserFormState>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: SnackbarSeverity }>({
    open: false,
    message: "",
    severity: "info",
  });

  const usersQuery = useQuery({
    queryKey: ["users-directory"],
    queryFn: fetchUsers,
    enabled: canRead,
  });

  const departmentsQuery = useQuery({
    queryKey: ["user-departments"],
    queryFn: fetchDepartmentOptions,
    enabled: canRead,
  });

  const reloadUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: ["users-directory"] });
  };

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const createMutation = useMutation({
    mutationFn: (payload: UpsertUserPayload) => createUser(payload),
    onSuccess: async (createdRecord) => {
      await reloadUsers();
      setDialogMode(null);
      setForm(INITIAL_FORM);
      setFormError(null);
      setCreatedUser(createdRecord);
      showSnackbar("User created successfully.", "success");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unable to create user.";
      setFormError(message);
      showSnackbar(message, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: UpsertUserPayload }) => updateUser(userId, payload),
    onSuccess: async () => {
      await reloadUsers();
      setDialogMode(null);
      setSelectedUser(null);
      setForm(INITIAL_FORM);
      setFormError(null);
      showSnackbar("User updated successfully.", "success");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unable to update user.";
      setFormError(message);
      showSnackbar(message, "error");
    },
  });

  const resendInviteMutation = useMutation({
    mutationFn: (userId: number) => resendUserInvite(userId),
    onSuccess: async () => {
      await reloadUsers();
      showSnackbar("Invitation refreshed successfully.", "success");
    },
    onError: (error) => showSnackbar(error instanceof Error ? error.message : "Unable to resend invite.", "error"),
  });

  const adminResetMutation = useMutation({
    mutationFn: (userId: number) => adminResetUserPassword(userId),
    onSuccess: async (result) => {
      await reloadUsers();
      setCreatedUser(result);
      showSnackbar("Password reset link generated.", "success");
    },
    onError: (error) => showSnackbar(error instanceof Error ? error.message : "Unable to create reset link.", "error"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, accountStatus }: { userId: number; accountStatus: string }) =>
      updateUserAccountStatus(userId, accountStatus),
    onSuccess: async (result) => {
      await reloadUsers();
      setCreatedUser(result);
      showSnackbar("User status updated.", "success");
    },
    onError: (error) => showSnackbar(error instanceof Error ? error.message : "Unable to update status.", "error"),
  });

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return (usersQuery.data ?? []).filter((user) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? user.active
            : !user.active;

      const haystack = `${user.employeeId} ${user.fullName} ${user.email} ${user.role ?? ""}`.toLowerCase();
      const matchesKeyword = keyword ? haystack.includes(keyword) : true;
      return matchesStatus && matchesKeyword;
    });
  }, [search, statusFilter, usersQuery.data]);

  const managerOptions = useMemo(
    () => (usersQuery.data ?? []).filter((user) => user.id !== selectedUser?.id),
    [selectedUser?.id, usersQuery.data]
  );

  const stats = useMemo(() => {
    const users = usersQuery.data ?? [];
    return {
      total: users.length,
      active: users.filter((user) => user.active).length,
      inactive: users.filter((user) => !user.active).length,
      privileged: users.filter((user) => ["ADMIN", "PMO_MANAGER", "PROJECT_MANAGER"].includes(user.role ?? "")).length,
    };
  }, [usersQuery.data]);

  if (!canRead) {
    return <Alert severity="warning">You do not have read permission for users.</Alert>;
  }

  const openCreateDialog = () => {
    setSelectedUser(null);
    setForm(INITIAL_FORM);
    setFormError(null);
    setDialogMode("create");
  };

  const openEditDialog = (user: UserRecord) => {
    setSelectedUser(user);
    setForm({
      employeeId: user.employeeId,
      fullName: user.fullName,
      email: user.email,
      role: user.role ?? "CONTRIBUTOR",
      active: user.active,
      departmentId: user.departmentId ?? null,
      designation: user.designation ?? "",
      reportingManagerId: user.reportingManagerId ?? null,
    });
    setFormError(null);
    setDialogMode("edit");
  };

  const handleSubmit = async () => {
    const validationError = validateForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload: UpsertUserPayload = {
      employeeId: form.employeeId.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      role: form.role?.trim() || undefined,
      active: form.active,
      departmentId: form.departmentId ?? null,
      designation: form.designation?.trim() || null,
      reportingManagerId: form.reportingManagerId ?? null,
    };

    if (dialogMode === "create") {
      createMutation.mutate(payload);
      return;
    }

    if (dialogMode === "edit" && selectedUser) {
      updateMutation.mutate({ userId: selectedUser.id, payload });
    }
  };

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 5,
          overflow: "hidden",
          background: "linear-gradient(135deg, #f8fbff 0%, #eff6ff 52%, #f5f3ff 100%)",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          boxShadow: "0 24px 50px rgba(15, 23, 42, 0.08)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.25 } }}>
          <Stack direction={{ xs: "column", xl: "row" }} spacing={2.5} justifyContent="space-between">
            <Stack spacing={1.4} sx={{ maxWidth: 720 }}>
              <Chip
                label="Enterprise user management"
                sx={{ alignSelf: "flex-start", bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 700 }}
              />
              <Typography variant="h3" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
                Users
              </Typography>
              <Typography sx={{ color: "#475569", maxWidth: 620 }}>
                Create and govern user accounts while shaping the enterprise access model for delivery teams,
                administrators, and leadership stakeholders.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.1} flexWrap="wrap">
                <Chip icon={<GroupRoundedIcon />} label={`${stats.total} total users`} sx={{ bgcolor: "#ffffff", color: "#0f172a", fontWeight: 600 }} />
                <Chip icon={<ManageAccountsRoundedIcon />} label={`${stats.active} active`} sx={{ bgcolor: "#dcfce7", color: "#166534", fontWeight: 700 }} />
                <Chip icon={<ShieldRoundedIcon />} label={`${stats.privileged} elevated access`} sx={{ bgcolor: "#ede9fe", color: "#6d28d9", fontWeight: 700 }} />
              </Stack>
            </Stack>

            <Stack spacing={1.1} alignItems={{ xs: "stretch", xl: "flex-end" }}>
              <Button
                variant="outlined"
                component={RouterLink}
                to="/knowledge-base"
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 999 }}
              >
                Open Knowledge Base Blueprint
              </Button>
              {canCreate ? (
                <Button
                  variant="contained"
                  startIcon={<AddCircleRoundedIcon />}
                  onClick={openCreateDialog}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 999,
                    px: 2.25,
                    bgcolor: "#2563eb",
                    "&:hover": { bgcolor: "#1d4ed8" },
                  }}
                >
                  Create User
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" },
        }}
      >
        {[
          { label: "Total accounts", value: stats.total, tone: "#0f172a", bg: "#ffffff" },
          { label: "Active accounts", value: stats.active, tone: "#166534", bg: "#dcfce7" },
          { label: "Inactive accounts", value: stats.inactive, tone: "#9a3412", bg: "#ffedd5" },
          { label: "Elevated-access users", value: stats.privileged, tone: "#6d28d9", bg: "#ede9fe" },
        ].map((item) => (
          <Paper key={item.label} sx={{ p: 2.25, borderRadius: 4, border: "1px solid rgba(148, 163, 184, 0.18)" }}>
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 800, color: item.tone }}>
              {item.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Paper sx={{ p: 2.5, borderRadius: 4 }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2} justifyContent="space-between">
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Search by employee ID, name, email, or role"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | "active" | "inactive")}
              sx={{ minWidth: { xs: "100%", md: 180 } }}
            >
              <MenuItem value="all">All users</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
          <Button variant="outlined" onClick={() => usersQuery.refetch()} sx={{ alignSelf: "flex-start", textTransform: "none" }}>
            Refresh
          </Button>
        </Stack>

        <Box sx={{ mt: 2 }}>
          {usersQuery.isLoading ? (
            <LoadingState variant="table" rows={6} />
          ) : usersQuery.isError ? (
            <ErrorState message="Unable to load users." onRetry={() => usersQuery.refetch()} />
          ) : filteredUsers.length === 0 ? (
            <EmptyState title="No users found" description="Adjust your filters or create a new user to get started." />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Full Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Reporting Manager</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{user.employeeId}</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.departmentName ?? "-"}</TableCell>
                      <TableCell>{user.designation ?? "-"}</TableCell>
                      <TableCell>{user.reportingManagerName ?? "-"}</TableCell>
                      <TableCell>{user.role ?? "-"}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
                          <Chip size="small" label={user.active ? "Active" : "Inactive"} color={user.active ? "success" : "default"} />
                          <Chip size="small" label={formatAccountStatus(user.accountStatus)} color={user.accountStatus === "ACTIVE" ? "success" : "default"} />
                          {user.passwordChangeRequired ? <Chip size="small" label="Password setup required" color="warning" /> : null}
                        </Stack>
                      </TableCell>
                      <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell align="right">
                        {canUpdate ? (
                          <Stack direction="row" spacing={0.75} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                            <Button size="small" onClick={() => openEditDialog(user)}>
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
                            <Button size="small" color="warning" onClick={() => statusMutation.mutate({ userId: user.id, accountStatus: "DEACTIVATED" })} disabled={statusMutation.isPending || user.accountStatus === "DEACTIVATED"}>
                              Deactivate
                            </Button>
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Read only
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 4 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <AutoAwesomeRoundedIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Recommended access model
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Architectural guidance for which personas should exist in the platform and what they should be allowed to do.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" },
          }}
        >
          {ACCESS_BLUEPRINT.map((role) => (
            <Paper key={role.title} variant="outlined" sx={{ p: 2.25, borderRadius: 3 }}>
              <Typography variant="overline" sx={{ color: "#6366f1", fontWeight: 700 }}>
                {role.emphasis}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {role.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.1, mb: 1.6 }}>
                {role.description}
              </Typography>
              <Typography variant="caption" sx={{ color: "#475569", fontWeight: 700, display: "block", mb: 0.8 }}>
                Visible pages after login
              </Typography>
              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mb: 1.4 }}>
                {role.visiblePages.map((page) => (
                  <Chip key={page} label={page} size="small" color="primary" variant="outlined" />
                ))}
              </Stack>
              <Typography variant="caption" sx={{ color: "#475569", fontWeight: 700, display: "block", mb: 0.8 }}>
                Core actions
              </Typography>
              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                {role.recommendedPermissions.map((permission) => (
                  <Chip key={permission} label={permission} size="small" sx={{ bgcolor: "#f8fafc" }} />
                ))}
              </Stack>
            </Paper>
          ))}
        </Box>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
          Enterprise rollout focus
        </Typography>
        <Stack spacing={1.1}>
          {DELIVERY_RECOMMENDATIONS.map((item) => (
            <Box key={item} sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#2563eb", mt: 0.9, flexShrink: 0 }} />
              <Typography variant="body2" color="text.secondary">
                {item}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Dialog open={dialogMode !== null} onClose={() => setDialogMode(null)} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === "create" ? "Create user" : "Edit user"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}
            <TextField
              size="small"
              required
              fullWidth
              label="Employee ID"
              value={form.employeeId}
              onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))}
            />
            <TextField
              size="small"
              required
              fullWidth
              label="Full name"
              value={form.fullName}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            />
            <TextField
              size="small"
              required
              fullWidth
              type="email"
              label="Email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            <TextField
              select
              size="small"
              fullWidth
              label="Role"
              value={form.role ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
            >
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
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  departmentId: event.target.value ? Number(event.target.value) : null,
                }))
              }
            >
              <MenuItem value="">No department</MenuItem>
              {(departmentsQuery.data ?? []).map((department: DepartmentOption) => (
                <MenuItem key={department.id} value={department.id}>
                  {department.departmentName} ({department.departmentCode})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              fullWidth
              label="Designation"
              value={form.designation ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, designation: event.target.value }))}
            />
            <TextField
              select
              size="small"
              fullWidth
              label="Reporting manager"
              value={form.reportingManagerId ? String(form.reportingManagerId) : ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  reportingManagerId: event.target.value ? Number(event.target.value) : null,
                }))
              }
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
                control={
                  <Switch
                    checked={form.active}
                    onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
                  />
                }
                label="Active"
              />
            ) : (
              <Alert severity="info">
                New users are created as invited accounts. They become active after opening the activation link and setting their password.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogMode(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {dialogMode === "create" ? "Create user" : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(createdUser)} onClose={() => setCreatedUser(null)} fullWidth maxWidth="sm">
        <DialogTitle>User onboarding</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Alert severity="success">
              Jira-style onboarding is now invite based. Admin creates the account, then the user sets their own password from the secure link.
            </Alert>
            <TextField
              label="Login email"
              value={createdUser?.email ?? ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <TextField label="Department" value={createdUser?.departmentName ?? "-"} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Designation" value={createdUser?.designation ?? "-"} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Reporting manager" value={createdUser?.reportingManagerName ?? "-"} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Account status" value={formatAccountStatus(createdUser?.accountStatus)} fullWidth InputProps={{ readOnly: true }} />
            {createdUser?.emailDeliveryStatus ? <Alert severity="info">{createdUser.emailDeliveryStatus}</Alert> : null}
            {createdUser?.onboardingAccessLink ? (
              <Alert severity="info">
                Invite link:{" "}
                <Link href={createdUser.onboardingAccessLink} target="_blank" rel="noreferrer">
                  open activation page
                </Link>
                {createdUser.invitationExpiresAt ? ` (expires ${formatDate(createdUser.invitationExpiresAt)})` : ""}
              </Alert>
            ) : null}
            {createdUser?.passwordResetLink ? (
              <Alert severity="warning">
                Reset link:{" "}
                <Link href={createdUser.passwordResetLink} target="_blank" rel="noreferrer">
                  open password reset page
                </Link>
                {createdUser.passwordResetExpiresAt ? ` (expires ${formatDate(createdUser.passwordResetExpiresAt)})` : ""}
              </Alert>
            ) : null}
            {createdUser?.lastLoginAt ? (
              <TextField label="Last login" value={formatDate(createdUser.lastLoginAt)} fullWidth InputProps={{ readOnly: true }} />
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatedUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <PageSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      />
    </Stack>
  );
}
