import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  TableContainer,
  Typography,
} from "@mui/material";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { LoadingState } from "@shared/ui/states/LoadingState";
import {
  fetchDashboardPriorityBreakdown,
  fetchDashboardStatusBreakdown,
  fetchDashboardSummary,
} from "@modules/dashboard/services/dashboardApi";
import { ConfirmActionDialog } from "@shared/ui/feedback/ConfirmActionDialog";
import { PageSnackbar, type SnackbarSeverity } from "@shared/ui/feedback/PageSnackbar";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildReadPermissionCandidates } from "@shared/auth/permissions";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
};

export function DashboardPage() {
  const { hasAnyPermission } = useAuth();
  const canRead = hasAnyPermission(buildReadPermissionCandidates("dashboard"));

  const [refreshConfirmOpen, setRefreshConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
    enabled: canRead,
  });

  const statusQuery = useQuery({
    queryKey: ["dashboard-status"],
    queryFn: fetchDashboardStatusBreakdown,
    enabled: canRead,
  });

  const priorityQuery = useQuery({
    queryKey: ["dashboard-priority"],
    queryFn: fetchDashboardPriorityBreakdown,
    enabled: canRead,
  });

  if (!canRead) {
    return <Alert severity="warning">You do not have read permission for dashboard.</Alert>;
  }

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRefresh = async () => {
    setRefreshConfirmOpen(false);
    const [summaryResult, statusResult, priorityResult] = await Promise.all([
      summaryQuery.refetch(),
      statusQuery.refetch(),
      priorityQuery.refetch(),
    ]);
    const hasError = summaryResult.isError || statusResult.isError || priorityResult.isError;
    showSnackbar(hasError ? "Dashboard refresh failed." : "Dashboard refreshed.", hasError ? "error" : "success");
  };

  if (summaryQuery.isLoading || statusQuery.isLoading || priorityQuery.isLoading) {
    return (
      <Stack spacing={2}>
        <LoadingState variant="cards" />
        <LoadingState variant="table" rows={4} />
      </Stack>
    );
  }

  if (summaryQuery.isError || statusQuery.isError || priorityQuery.isError) {
    return <ErrorState message="Unable to load dashboard data." onRetry={() => {
      summaryQuery.refetch();
      statusQuery.refetch();
      priorityQuery.refetch();
    }} />;
  }

  const summary = summaryQuery.data;
  const status = statusQuery.data ?? {};
  const priority = priorityQuery.data ?? {};

  if (!summary) {
    return <Alert severity="info">No dashboard summary is available.</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button variant="outlined" onClick={() => setRefreshConfirmOpen(true)}>Refresh</Button>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography variant="overline">Total Tasks</Typography><Typography variant="h5">{summary.totalTasks}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography variant="overline">Open</Typography><Typography variant="h5">{summary.openTasks}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography variant="overline">In Progress</Typography><Typography variant="h5">{summary.inProgressTasks}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography variant="overline">Overdue</Typography><Typography variant="h5">{summary.overdueTasks}</Typography></CardContent></Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Status Breakdown</Typography>
              <TableContainer>
                <List dense>
                  {Object.entries(status).map(([key, value]) => (
                    <ListItem key={key} disableGutters>
                      <ListItemText primary={key} secondary={String(value)} />
                    </ListItem>
                  ))}
                </List>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Priority Breakdown</Typography>
              <TableContainer>
                <List dense>
                  {Object.entries(priority).map(([key, value]) => (
                    <ListItem key={key} disableGutters>
                      <ListItemText primary={key} secondary={String(value)} />
                    </ListItem>
                  ))}
                </List>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmActionDialog
        open={refreshConfirmOpen}
        title="Refresh dashboard"
        message="Reload dashboard metrics from backend now?"
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
