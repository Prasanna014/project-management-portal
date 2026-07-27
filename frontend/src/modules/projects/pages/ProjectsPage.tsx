import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { EmptyState } from "@shared/ui/states/EmptyState";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { LoadingState } from "@shared/ui/states/LoadingState";
import { createProject, fetchProjects } from "@modules/projects/services/projectsApi";
import { ConfirmActionDialog } from "@shared/ui/feedback/ConfirmActionDialog";
import { PageSnackbar, type SnackbarSeverity } from "@shared/ui/feedback/PageSnackbar";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildActionPermissionCandidates, buildReadPermissionCandidates } from "@shared/auth/permissions";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
};

type ProjectFormState = {
  projectCode: string;
  projectName: string;
  description: string;
  active: boolean;
};

const INITIAL_FORM: ProjectFormState = {
  projectCode: "",
  projectName: "",
  description: "",
  active: true,
};

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function ProjectsPage() {
  const { hasAnyPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const canRead = hasAnyPermission(buildReadPermissionCandidates("projects"));
  const canCreate = hasAnyPermission(buildActionPermissionCandidates("projects", "create"));

  const [refreshConfirmOpen, setRefreshConfirmOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createPending, setCreatePending] = useState(false);
  const [form, setForm] = useState<ProjectFormState>(INITIAL_FORM);
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

  const handleCreateProject = async () => {
    if (!form.projectCode.trim() || !form.projectName.trim()) {
      showSnackbar("Project code and name are required.", "warning");
      return;
    }

    try {
      setCreatePending(true);
      await createProject({
        projectCode: form.projectCode.trim(),
        projectName: form.projectName.trim(),
        description: form.description.trim() || undefined,
        active: form.active,
      });
      setCreateDialogOpen(false);
      setForm(INITIAL_FORM);
      await projectsQuery.refetch();
      showSnackbar("Project created successfully.", "success");
    } catch {
      showSnackbar("Unable to create project.", "error");
    } finally {
      setCreatePending(false);
    }
  };

  if (projectsQuery.isLoading) {
    return <LoadingState variant="table" rows={7} />;
  }

  if (projectsQuery.isError) {
    return <ErrorState message="Unable to load projects." onRetry={() => projectsQuery.refetch()} />;
  }

  const projects = projectsQuery.data ?? [];
  const activeFilter = searchParams.get("active");
  const keyword = (searchParams.get("q") ?? "").trim().toLowerCase();
  const activeOnly = activeFilter === "true";
  const filteredProjects = projects.filter((project) => {
    const matchesActive = activeFilter === "false"
      ? !project.active
      : activeFilter === "true"
        ? project.active
        : true;

    const haystack = `${project.projectCode} ${project.projectName} ${project.description ?? ""}`.toLowerCase();
    const matchesKeyword = keyword ? haystack.includes(keyword) : true;
    return matchesActive && matchesKeyword;
  });
  const activeProjects = projects.filter((project) => project.active).length;
  const inactiveProjects = projects.length - activeProjects;
  const recentlyCreated = [...projects]
    .filter((project) => project.createdAt)
    .sort((left, right) => new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime())[0];

  if (projects.length === 0) {
    return <EmptyState title="No projects found" description="Create projects from backend to see them here." />;
  }

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 5,
          overflow: "hidden",
          background: "linear-gradient(135deg, #f8fbff 0%, #eff6ff 52%, #ecfeff 100%)",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          boxShadow: "0 24px 50px rgba(15, 23, 42, 0.08)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.25 } }}>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5} justifyContent="space-between">
            <Stack spacing={1.4} sx={{ maxWidth: 640 }}>
              <Chip
                label="Portfolio Overview"
                sx={{ alignSelf: "flex-start", bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 700 }}
              />
              <Typography variant="h3" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
                Projects
              </Typography>
              <Typography sx={{ color: "#475569", maxWidth: 560 }}>
                Review the current portfolio, monitor active delivery work, and create new projects from one place.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.1} flexWrap="wrap">
                <Chip icon={<FolderOpenRoundedIcon />} label={`${projects.length} total projects`} sx={{ bgcolor: "#ffffff", color: "#0f172a", fontWeight: 600 }} />
                <Chip icon={<BoltRoundedIcon />} label={`${activeProjects} active`} sx={{ bgcolor: "#dcfce7", color: "#166534", fontWeight: 700 }} />
                {recentlyCreated ? (
                  <Chip label={`Latest: ${recentlyCreated.projectCode}`} sx={{ bgcolor: "#ecfeff", color: "#0f766e", fontWeight: 700 }} />
                ) : null}
              </Stack>
            </Stack>

            <Stack spacing={1.25} sx={{ minWidth: { lg: 280 } }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="flex-end">
                {canCreate ? (
                  <Button
                    variant="contained"
                    startIcon={<AddCircleRoundedIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 999,
                      px: 2,
                      bgcolor: "#2563eb",
                      '&:hover': { bgcolor: "#1d4ed8" },
                    }}
                  >
                    Create Project
                  </Button>
                ) : null}
                <Button variant="outlined" onClick={() => setRefreshConfirmOpen(true)} sx={{ textTransform: "none", borderRadius: 999, px: 2 }}>
                  Refresh
                </Button>
              </Stack>

              <Card sx={{ borderRadius: 4, bgcolor: "#ffffffb8", boxShadow: "none", border: "1px solid rgba(148, 163, 184, 0.2)" }}>
                <CardContent>
                  <Typography sx={{ fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", fontWeight: 700 }}>
                    Project Health
                  </Typography>
                  <Typography sx={{ mt: 0.7, fontSize: "2rem", fontWeight: 800, color: "#0f172a" }}>
                    {projects.length === 0 ? 0 : Math.round((activeProjects / projects.length) * 100)}%
                  </Typography>
                  <Typography sx={{ color: "#475569" }}>
                    {activeProjects} active and {inactiveProjects} inactive projects.
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        {[
          { label: "Total Projects", value: projects.length, helper: "All tracked initiatives", bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)" },
          { label: "Active Projects", value: activeProjects, helper: "Currently enabled for delivery", bg: "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)" },
          { label: "Inactive Projects", value: inactiveProjects, helper: "Paused or archived items", bg: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" },
        ].map((item) => (
          <Grid item xs={12} md={4} key={item.label}>
            <Card sx={{ borderRadius: 4, background: item.bg, border: "1px solid rgba(148, 163, 184, 0.18)", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.07)" }}>
              <CardContent>
                <Typography sx={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", fontWeight: 700 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ mt: 0.7, fontSize: "2rem", fontWeight: 800, color: "#0f172a" }}>{item.value}</Typography>
                <Typography sx={{ color: "#475569" }}>{item.helper}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "stretch", lg: "center" }}>
        <Stack spacing={0.75}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>Project Directory</Typography>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            {activeFilter ? (
              <Chip size="small" color="primary" label={activeOnly ? "Active Only" : "Inactive Only"} />
            ) : null}
            {keyword ? <Chip size="small" color="secondary" label={`Search: ${keyword}`} /> : null}
            {activeFilter || keyword ? (
              <Button
                size="small"
                onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
                sx={{ textTransform: "none", p: 0, minWidth: 0 }}
              >
                Clear Filters
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Stack>

      <Card sx={{ borderRadius: 5, border: "1px solid rgba(148, 163, 184, 0.18)", boxShadow: "0 20px 45px rgba(15, 23, 42, 0.06)" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Search projects"
                value={keyword}
                onChange={(event) => {
                  const nextParams = new URLSearchParams(searchParams);
                  if (event.target.value.trim()) {
                    nextParams.set("q", event.target.value);
                  } else {
                    nextParams.delete("q");
                  }
                  setSearchParams(nextParams, { replace: true });
                }}
                placeholder="Code, name, description"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={activeFilter ?? "all"}
                onChange={(event) => {
                  const nextParams = new URLSearchParams(searchParams);
                  if (event.target.value === "all") {
                    nextParams.delete("active");
                  } else {
                    nextParams.set("active", event.target.value);
                  }
                  setSearchParams(nextParams, { replace: true });
                }}
              >
                <MenuItem value="all">All Projects</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ height: "100%", borderRadius: 3, bgcolor: "#f8fafc", boxShadow: "none", border: "1px solid #e2e8f0" }}>
                <CardContent sx={{ py: 1.2, '&:last-child': { pb: 1.2 } }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    Visible Results
                  </Typography>
                  <Typography sx={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a" }}>{filteredProjects.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow
                    key={project.id}
                    sx={{
                      '&:hover': { backgroundColor: '#f8fafc' },
                      '& td': { borderColor: '#eef2f7' },
                    }}
                  >
                    <TableCell>{project.id}</TableCell>
                    <TableCell>
                      <Chip label={project.projectCode} size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>{project.projectName}</Typography>
                        <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>Project #{project.id}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: '#475569' }}>{project.description || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={project.active ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          bgcolor: project.active ? '#dcfce7' : '#e2e8f0',
                          color: project.active ? '#166534' : '#475569',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(project.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 6, borderBottom: "none" }}>
                      <Stack spacing={0.75} alignItems="center" textAlign="center">
                        <Typography sx={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                          No matching projects
                        </Typography>
                        <Typography sx={{ color: "#64748b" }}>
                          No projects match the selected filters.
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 5,
            overflow: "hidden",
            boxShadow: "0 28px 70px rgba(15, 23, 42, 0.22)",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            py: 2.5,
            background: "linear-gradient(135deg, #eff6ff 0%, #ecfeff 100%)",
            borderBottom: "1px solid #dbeafe",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "#2563eb",
                color: "#fff",
                boxShadow: "0 12px 26px rgba(37, 99, 235, 0.28)",
              }}
            >
              <AutoAwesomeRoundedIcon />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>
                Create Project
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.95rem" }}>
                Add a new initiative with a clear code, name, and status.
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3, bgcolor: "#fcfdff" }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: "wrap" }}>
            <Chip label="Portfolio Setup" sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700 }} />
            <Chip label="Fast Create" sx={{ bgcolor: "#ecfeff", color: "#0f766e", fontWeight: 700 }} />
          </Stack>

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Project Code"
                value={form.projectCode}
                onChange={(event) => setForm((current) => ({ ...current, projectCode: event.target.value }))}
                placeholder="PRJ-104"
                helperText="Use a short unique code"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#ffffff' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Project Name"
                value={form.projectName}
                onChange={(event) => setForm((current) => ({ ...current, projectName: event.target.value }))}
                placeholder="Customer Support Revamp"
                helperText="Visible project title"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#ffffff' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Description"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Summarize the goal, scope, or delivery context for this project."
                helperText="Optional, but useful for future filtering and context"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#ffffff' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Status"
                value={form.active ? 'active' : 'inactive'}
                onChange={(event) => setForm((current) => ({ ...current, active: event.target.value === 'active' }))}
                helperText="Set whether the project is immediately active"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#ffffff' } }}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.25, borderTop: "1px solid #eef2f7", bgcolor: "#ffffff" }}>
          <Button
            onClick={() => setCreateDialogOpen(false)}
            disabled={createPending}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 999, px: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateProject}
            disabled={createPending}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 999,
              px: 2.5,
              bgcolor: '#2563eb',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            {createPending ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>

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
