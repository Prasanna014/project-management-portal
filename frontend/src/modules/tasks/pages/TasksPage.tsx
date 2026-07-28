import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { EmptyState } from "@shared/ui/states/EmptyState";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { LoadingState } from "@shared/ui/states/LoadingState";
import { httpClient } from "@shared/api/httpClient";
import { fetchTasks } from "@modules/tasks/services/tasksApi";
import { ConfirmActionDialog } from "@shared/ui/feedback/ConfirmActionDialog";
import { PageSnackbar, type SnackbarSeverity } from "@shared/ui/feedback/PageSnackbar";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildActionPermissionCandidates, buildReadPermissionCandidates } from "@shared/auth/permissions";
import { fetchProjects } from "@modules/projects/services/projectsApi";
import { useProjectScope } from "@shared/context/ProjectScopeContext";
import { useNavigate, useSearchParams } from "react-router-dom";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
};

type UserDto = {
  id: number;
  fullName?: string;
  email?: string;
};

const normalizeStatus = (value: string | undefined | null) =>
  (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

const statusAliasMap: Record<string, string[]> = {
  open: ["open", "todo"],
  waiting: ["waiting"],
  inprogress: ["inprogress"],
  blocked: ["blocked"],
  completed: ["completed", "done", "resolved"],
  scheduled: ["scheduled"],
  overdue: ["overdue"],
};

const headerBubblePalette = [
  { bg: "#eff6ff", fg: "#1e40af" },
  { bg: "#ecfeff", fg: "#155e75" },
  { bg: "#f0fdf4", fg: "#166534" },
  { bg: "#fff7ed", fg: "#9a3412" },
  { bg: "#fef2f2", fg: "#991b1b" },
  { bg: "#f5f3ff", fg: "#5b21b6" },
];

const taskTableHeaders = [
  "ID",
  "Task No",
  "Project",
  "Issue",
  "Description",
  "Status",
  "Priority",
  "Assigned To",
  "Target Date",
  "Updated",
];

export function TasksPage() {
  const navigate = useNavigate();
  const { hasAnyPermission } = useAuth();
  const { selectedProjectId, setSelectedProjectId } = useProjectScope();
  const [searchParams, setSearchParams] = useSearchParams();
  const canRead = hasAnyPermission(buildReadPermissionCandidates("tasks"));
  const canCreate = hasAnyPermission(buildActionPermissionCandidates("tasks", "create"));

  const statusFilter = searchParams.get("status") ?? "";
  const queryProjectId = Number(searchParams.get("projectId"));
  const hasQueryProjectId = Number.isFinite(queryProjectId) && queryProjectId > 0;
  const effectiveProjectId = hasQueryProjectId ? queryProjectId : selectedProjectId;

  const [refreshConfirmOpen, setRefreshConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    enabled: canRead,
  });

  const projectsQuery = useQuery({
    queryKey: ["tasks-project-list"],
    queryFn: fetchProjects,
    enabled: canRead,
  });

  const usersQuery = useQuery({
    queryKey: ["tasks-user-list"],
    queryFn: async () => {
      const response = await httpClient.get<UserDto[]>("/users");
      return response.data;
    },
    enabled: canRead,
  });

  if (!canRead) {
    return <Alert severity="warning">You do not have read permission for tasks.</Alert>;
  }

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRefresh = async () => {
    setRefreshConfirmOpen(false);
    const result = await tasksQuery.refetch();
    showSnackbar(result.isError ? "Refresh failed." : "Tasks refreshed.", result.isError ? "error" : "success");
  };

  if (tasksQuery.isLoading) {
    return <LoadingState variant="table" rows={8} />;
  }

  if (tasksQuery.isError) {
    return <ErrorState message="Unable to load tasks." onRetry={() => tasksQuery.refetch()} />;
  }

  const tasks = tasksQuery.data ?? [];
  const projects = (projectsQuery.data ?? []).filter((project) => project.active);
  const users = usersQuery.data ?? [];
  const usersById = new Map(users.map((user) => [user.id, user]));
  const projectsById = new Map(projects.map((project) => [project.id, project]));
  const projectOptionExists =
    effectiveProjectId != null && projects.some((project) => project.id === effectiveProjectId);
  const projectSelectorValue = projectOptionExists ? effectiveProjectId : "ALL";

  const normalizedStatus = normalizeStatus(statusFilter);
  const acceptableStatuses = statusAliasMap[normalizedStatus] ?? [normalizedStatus];
  const filteredTasks = tasks.filter((task) => {
    const byProject = effectiveProjectId ? task.projectId === effectiveProjectId : true;
    const taskStatus = normalizeStatus(task.status);
    const byStatus = normalizedStatus ? acceptableStatuses.includes(taskStatus) : true;
    return byProject && byStatus;
  });

  if (tasks.length === 0) {
    return <EmptyState title="No tasks found" description="Create tasks from backend to see them here." />;
  }

  const clearFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("status");
    nextParams.delete("projectId");
    setSearchParams(nextParams, { replace: true });
    setSelectedProjectId(null);
  };

  const formatDate = (value?: string) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  const getOwnerLabel = (ownerId?: number) => {
    if (!ownerId) {
      return "Unassigned";
    }

    const user = usersById.get(ownerId);
    if (!user) {
      return `User #${ownerId}`;
    }

    return user.fullName || user.email || `User #${ownerId}`;
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
        <Stack spacing={0.8}>
          <Typography variant="h4">Tasks</Typography>
          <Stack direction="row" spacing={0.8}>
            {effectiveProjectId ? <Chip size="small" color="primary" label={`Project #${effectiveProjectId}`} /> : null}
            {statusFilter ? <Chip size="small" color="secondary" label={`Status: ${statusFilter}`} /> : null}
            {effectiveProjectId || statusFilter ? (
              <Button size="small" onClick={clearFilters} sx={{ textTransform: "none", p: 0, minWidth: 0 }}>
                Clear Filters
              </Button>
            ) : null}
          </Stack>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
          <FormControl
            size="small"
            sx={{
              minWidth: 240,
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                backgroundColor: "#FFFFFF",
              },
            }}
          >
            <Select
              value={projectSelectorValue}
              onChange={(event) => {
                const value = event.target.value;
                const nextProjectId = value === "ALL" ? null : Number(value);
                const nextParams = new URLSearchParams(searchParams);
                if (nextProjectId) {
                  nextParams.set("projectId", String(nextProjectId));
                } else {
                  nextParams.delete("projectId");
                }
                setSearchParams(nextParams, { replace: true });
                setSelectedProjectId(nextProjectId);
              }}
              displayEmpty
              inputProps={{ "aria-label": "Project selector" }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    mt: 1,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #f8fbff 0%, #eff6ff 60%, #ecfeff 100%)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    boxShadow: "0 20px 48px rgba(15, 23, 42, 0.14)",
                    "& .MuiMenuItem-root": {
                      borderRadius: 2,
                      mx: 0.75,
                      my: 0.25,
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "#0f172a",
                      "&:hover": {
                        bgcolor: "rgba(37, 99, 235, 0.08)",
                        color: "#2563eb",
                      },
                      "&.Mui-selected": {
                        bgcolor: "rgba(37, 99, 235, 0.12)",
                        color: "#1d4ed8",
                        "&:hover": { bgcolor: "rgba(37, 99, 235, 0.16)" },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="ALL">All Projects</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.projectCode} - {project.projectName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {canCreate ? (
            <Button variant="contained" onClick={() => navigate("/create-task")} sx={{ textTransform: "none", fontWeight: 700 }}>
              + Create Task
            </Button>
          ) : null}
          <Button variant="outlined" onClick={() => setRefreshConfirmOpen(true)}>Refresh</Button>
        </Stack>
      </Stack>
      <Card>
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead
                sx={{
                  background: "linear-gradient(90deg, #f8fbff 0%, #f9fffb 100%)",
                }}
              >
                <TableRow>
                  {taskTableHeaders.map((header, index) => {
                    const palette = headerBubblePalette[index % headerBubblePalette.length];
                    return (
                      <TableCell key={header} sx={{ borderBottomColor: "#e2e8f0", py: 1.1 }}>
                        <Box
                          component="span"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            px: 1.15,
                            py: 0.55,
                            borderRadius: 999,
                            bgcolor: palette.bg,
                            color: palette.fg,
                            border: "1px solid rgba(15, 23, 42, 0.08)",
                            boxShadow: "0 1px 0 rgba(15,23,42,0.03)",
                            fontWeight: 700,
                            fontSize: "0.76rem",
                            letterSpacing: "0.02em",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {header}
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    hover
                    onClick={() => navigate(`/task/${task.id}`)}
                    sx={{
                      cursor: "pointer",
                      transition: "background-color 120ms ease",
                      "&:hover": { backgroundColor: "#f8fbff" },
                    }}
                  >
                    <TableCell>{task.id}</TableCell>
                    <TableCell>
                      <Typography sx={{ color: "#1d4ed8", fontWeight: 700 }}>
                        {task.taskNo ?? "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {task.projectId ? (
                        <Chip
                          size="small"
                          label={projectsById.get(task.projectId)?.projectCode || `Project #${task.projectId}`}
                          sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700 }}
                        />
                      ) : "-"}
                    </TableCell>
                    <TableCell>{task.issueActionItem ?? "-"}</TableCell>
                    <TableCell>{task.description ?? "-"}</TableCell>
                    <TableCell>{task.status ?? "-"}</TableCell>
                    <TableCell>{task.priority ?? "-"}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: "0.72rem", bgcolor: "#c7d2fe", color: "#312e81" }}>
                          {getOwnerLabel(task.ownerId).charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">{getOwnerLabel(task.ownerId)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(task.targetDate)}</TableCell>
                    <TableCell>{formatDate(task.updatedAt)}</TableCell>
                  </TableRow>
                ))}
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10}>
                      <Typography variant="body2" color="text.secondary">
                        No tasks match the selected project/status filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <ConfirmActionDialog
        open={refreshConfirmOpen}
        title="Refresh tasks"
        message="Reload task data from backend now?"
        confirmLabel="Refresh"
        onCancel={() => setRefreshConfirmOpen(false)}
        onConfirm={handleRefresh}
      />
      <PageSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </Stack>
  );
}
