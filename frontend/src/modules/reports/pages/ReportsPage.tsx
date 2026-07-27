import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Button, Card, CardContent, Grid, List, ListItem, ListItemText, Stack, TableContainer, Typography } from "@mui/material";
import { EmptyState } from "@shared/ui/states/EmptyState";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { LoadingState } from "@shared/ui/states/LoadingState";
import { fetchReports } from "@modules/reports/services/reportsApi";
import { ConfirmActionDialog } from "@shared/ui/feedback/ConfirmActionDialog";
import { PageSnackbar, type SnackbarSeverity } from "@shared/ui/feedback/PageSnackbar";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildReadPermissionCandidates } from "@shared/auth/permissions";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
};

export function ReportsPage() {
  const { hasAnyPermission } = useAuth();
  const canRead = hasAnyPermission(buildReadPermissionCandidates("reports"));

  const [refreshConfirmOpen, setRefreshConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const reportsQuery = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
    enabled: canRead,
  });

  if (!canRead) {
    return <Alert severity="warning">You do not have read permission for reports.</Alert>;
  }

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRefresh = async () => {
    setRefreshConfirmOpen(false);
    const result = await reportsQuery.refetch();
    showSnackbar(result.isError ? "Refresh failed." : "Reports refreshed.", result.isError ? "error" : "success");
  };

  if (reportsQuery.isLoading) {
    return (
      <Stack spacing={2}>
        <LoadingState variant="cards" />
        <LoadingState variant="table" rows={3} />
      </Stack>
    );
  }

  if (reportsQuery.isError) {
    return <ErrorState message="Unable to load reports." onRetry={() => reportsQuery.refetch()} />;
  }

  const reports = reportsQuery.data ?? [];

  if (reports.length === 0) {
    return <EmptyState title="No reports found" description="Backend report endpoints returned no data." />;
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
        <Typography variant="h4">Reports</Typography>
        <Button variant="outlined" onClick={() => setRefreshConfirmOpen(true)}>Refresh</Button>
      </Stack>
      <Grid container spacing={2}>
        {reports.map((report) => (
          <Grid item xs={12} md={6} key={report.reportName}>
            <Card>
              <CardContent>
                <Typography variant="h6">{report.reportName}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Total: {report.totalCount}
                </Typography>
                <TableContainer>
                  <List dense>
                    {Object.entries(report.data ?? {}).map(([key, value]) => (
                      <ListItem key={`${report.reportName}-${key}`} disableGutters>
                        <ListItemText primary={key} secondary={String(value)} />
                      </ListItem>
                    ))}
                  </List>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <ConfirmActionDialog
        open={refreshConfirmOpen}
        title="Refresh reports"
        message="Reload report aggregates from backend now?"
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
