import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
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

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
};

export function TasksPage() {
  const { hasAnyPermission } = useAuth();
  const canRead = hasAnyPermission(buildReadPermissionCandidates("tasks"));

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

  if (tasks.length === 0) {
    return <EmptyState title="No tasks found" description="Create tasks from backend to see them here." />;
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
        <Typography variant="h4">Tasks</Typography>
        <Button variant="outlined" onClick={() => setRefreshConfirmOpen(true)}>Refresh</Button>
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
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.id}</TableCell>
                    <TableCell>{task.taskNo ?? "-"}</TableCell>
                    <TableCell>{task.issueActionItem ?? "-"}</TableCell>
                    <TableCell>{task.status ?? "-"}</TableCell>
                    <TableCell>{task.priority ?? "-"}</TableCell>
                    <TableCell>{task.targetDate ?? "-"}</TableCell>
                  </TableRow>
                ))}
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
