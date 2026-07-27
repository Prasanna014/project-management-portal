import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Alert,
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
import { fetchTasks } from "@modules/tasks/services/tasksApi";
import { ConfirmActionDialog } from "@shared/ui/feedback/ConfirmActionDialog";
import { PageSnackbar, type SnackbarSeverity } from "@shared/ui/feedback/PageSnackbar";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildReadPermissionCandidates } from "@shared/auth/permissions";
import { fetchProjects } from "@modules/projects/services/projectsApi";
import { useProjectScope } from "@shared/context/ProjectScopeContext";
import { useSearchParams } from "react-router-dom";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
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

export function TasksPage() {
  const { hasAnyPermission } = useAuth();
  const { selectedProjectId, setSelectedProjectId } = useProjectScope();
  const [searchParams, setSearchParams] = useSearchParams();
  const canRead = hasAnyPermission(buildReadPermissionCandidates("tasks"));

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
            >
              <MenuItem value="ALL">All Projects</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.projectCode} - {project.projectName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={() => setRefreshConfirmOpen(true)}>Refresh</Button>
        </Stack>
      </Stack>
      <Card>
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Task No</TableCell>
                  <TableCell>Issue</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Target Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.id}</TableCell>
                    <TableCell>{task.taskNo ?? "-"}</TableCell>
                    <TableCell>{task.issueActionItem ?? "-"}</TableCell>
                    <TableCell>{task.status ?? "-"}</TableCell>
                    <TableCell>{task.priority ?? "-"}</TableCell>
                    <TableCell>{task.targetDate ?? "-"}</TableCell>
                  </TableRow>
                ))}
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
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
