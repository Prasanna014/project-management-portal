import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { EmptyState } from "@shared/ui/states/EmptyState";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { LoadingState } from "@shared/ui/states/LoadingState";
import { fetchProjects } from "@modules/projects/services/projectsApi";
import { fetchTasks } from "@modules/tasks/services/tasksApi";
import { ConfirmActionDialog } from "@shared/ui/feedback/ConfirmActionDialog";
import { PageSnackbar, type SnackbarSeverity } from "@shared/ui/feedback/PageSnackbar";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildReadPermissionCandidates } from "@shared/auth/permissions";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
};

export function WorkspacePage() {
  const { hasAnyPermission } = useAuth();
  const canRead = hasAnyPermission(buildReadPermissionCandidates("workspace"));

  const [refreshConfirmOpen, setRefreshConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const projectsQuery = useQuery({
    queryKey: ["workspace-projects"],
    queryFn: fetchProjects,
    enabled: canRead,
  });

  const tasksQuery = useQuery({
    queryKey: ["workspace-tasks"],
    queryFn: fetchTasks,
    enabled: canRead,
  });

  if (!canRead) {
    return <Alert severity="warning">You do not have read permission for workspace.</Alert>;
  }

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRefresh = async () => {
    setRefreshConfirmOpen(false);
    const [projectResult, taskResult] = await Promise.all([projectsQuery.refetch(), tasksQuery.refetch()]);
    const hasError = projectResult.isError || taskResult.isError;
    showSnackbar(hasError ? "Workspace refresh failed." : "Workspace refreshed.", hasError ? "error" : "success");
  };

  if (projectsQuery.isLoading || tasksQuery.isLoading) {
    return <LoadingState variant="cards" />;
  }

  if (projectsQuery.isError || tasksQuery.isError) {
    return <ErrorState message="Unable to load workspace overview." onRetry={() => {
      projectsQuery.refetch();
      tasksQuery.refetch();
    }} />;
  }

  const projects = projectsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];

  if (projects.length === 0 && tasks.length === 0) {
    return <EmptyState title="Workspace is empty" description="No project or task data is available yet." />;
  }

  const activeProjects = useMemo(() => projects.filter((project) => project.active).length, [projects]);
  const openTasks = useMemo(
    () => tasks.filter((task) => (task.status ?? "").toLowerCase().includes("open") || (task.status ?? "").toLowerCase().includes("todo")).length,
    [tasks]
  );
  const completedTasks = useMemo(
    () => tasks.filter((task) => (task.status ?? "").toLowerCase().includes("complete") || (task.status ?? "").toLowerCase().includes("done")).length,
    [tasks]
  );

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
        <Typography variant="h4">Workspace</Typography>
        <Button variant="outlined" onClick={() => setRefreshConfirmOpen(true)}>Refresh</Button>
      </Stack>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography variant="overline">Projects</Typography><Typography variant="h5">{projects.length}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography variant="overline">Active Projects</Typography><Typography variant="h5">{activeProjects}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography variant="overline">Open Tasks</Typography><Typography variant="h5">{openTasks}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography variant="overline">Completed Tasks</Typography><Typography variant="h5">{completedTasks}</Typography></CardContent></Card>
        </Grid>
      </Grid>

      <ConfirmActionDialog
        open={refreshConfirmOpen}
        title="Refresh workspace"
        message="Reload workspace metrics from backend now?"
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
