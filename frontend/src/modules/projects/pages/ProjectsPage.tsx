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
import { fetchProjects } from "@modules/projects/services/projectsApi";
import { ConfirmActionDialog } from "@shared/ui/feedback/ConfirmActionDialog";
import { PageSnackbar, type SnackbarSeverity } from "@shared/ui/feedback/PageSnackbar";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildReadPermissionCandidates } from "@shared/auth/permissions";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
};

export function ProjectsPage() {
  const { hasAnyPermission } = useAuth();
  const canRead = hasAnyPermission(buildReadPermissionCandidates("projects"));

  const [refreshConfirmOpen, setRefreshConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    enabled: canRead,
  });

  if (!canRead) {
    return <Alert severity="warning">You do not have read permission for projects.</Alert>;
  }

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRefresh = async () => {
    setRefreshConfirmOpen(false);
    const result = await projectsQuery.refetch();
    showSnackbar(result.isError ? "Refresh failed." : "Projects refreshed.", result.isError ? "error" : "success");
  };

  if (projectsQuery.isLoading) {
    return <LoadingState variant="table" rows={7} />;
  }

  if (projectsQuery.isError) {
    return <ErrorState message="Unable to load projects." onRetry={() => projectsQuery.refetch()} />;
  }

  const projects = projectsQuery.data ?? [];

  if (projects.length === 0) {
    return <EmptyState title="No projects found" description="Create projects from backend to see them here." />;
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
        <Typography variant="h4">Projects</Typography>
        <Button variant="outlined" onClick={() => setRefreshConfirmOpen(true)}>Refresh</Button>
      </Stack>
      <Card>
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.id}</TableCell>
                    <TableCell>{project.projectCode}</TableCell>
                    <TableCell>{project.projectName}</TableCell>
                    <TableCell>{project.active ? "Yes" : "No"}</TableCell>
                    <TableCell>{project.createdAt ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <ConfirmActionDialog
        open={refreshConfirmOpen}
        title="Refresh projects"
        message="Reload project data from backend now?"
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
