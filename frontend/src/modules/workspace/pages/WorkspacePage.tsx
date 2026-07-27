import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import { EmptyState } from "@shared/ui/states/EmptyState";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { LoadingState } from "@shared/ui/states/LoadingState";
import { fetchProjects } from "@modules/projects/services/projectsApi";
import { fetchTasks, type TaskDto } from "@modules/tasks/services/tasksApi";
import { ConfirmActionDialog } from "@shared/ui/feedback/ConfirmActionDialog";
import { PageSnackbar, type SnackbarSeverity } from "@shared/ui/feedback/PageSnackbar";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildReadPermissionCandidates } from "@shared/auth/permissions";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
};

const METRIC_CARD_STYLES = {
  height: "100%",
  borderRadius: 4,
  border: "1px solid rgba(148, 163, 184, 0.18)",
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
};

function normalizeStatus(status?: string) {
  return (status ?? "").trim().toLowerCase().replace(/_/g, " ");
}

function isOpenTask(status?: string) {
  const value = normalizeStatus(status);
  return value.includes("open") || value.includes("to do") || value === "todo";
}

function isCompletedTask(status?: string) {
  const value = normalizeStatus(status);
  return value.includes("complete") || value.includes("done");
}

function isInProgressTask(status?: string) {
  return normalizeStatus(status).includes("progress");
}

function isOverdueTask(task: TaskDto) {
  if (!task.targetDate || isCompletedTask(task.status)) {
    return false;
  }

  const dueDate = new Date(task.targetDate);
  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  return dueDate.getTime() < Date.now();
}

function formatStatusLabel(status?: string) {
  const value = normalizeStatus(status);
  if (!value) {
    return "Unassigned";
  }

  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function WorkspacePage() {
  const navigate = useNavigate();
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

  const activeProjects = projects.filter((project) => project.active).length;
  const openTasks = tasks.filter(
    (task) => isOpenTask(task.status)
  ).length;
  const completedTasks = tasks.filter(
    (task) => isCompletedTask(task.status)
  ).length;
  const inProgressTasks = tasks.filter((task) => isInProgressTask(task.status)).length;
  const overdueTasks = tasks.filter((task) => isOverdueTask(task)).length;
  const completionRate = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);
  const activeRate = projects.length === 0 ? 0 : Math.round((activeProjects / projects.length) * 100);

  const statusSummary = tasks.reduce<Record<string, number>>((acc, task) => {
    const label = formatStatusLabel(task.status);
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  const topStatuses = Object.entries(statusSummary)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const projectSummaries = projects
    .map((project) => {
      const projectTasks = tasks.filter((task) => String(task.projectId ?? "") === String(project.id));
      const doneCount = projectTasks.filter((task) => isCompletedTask(task.status)).length;
      const openCount = projectTasks.filter((task) => isOpenTask(task.status)).length;
      const progress = projectTasks.length === 0 ? 0 : Math.round((doneCount / projectTasks.length) * 100);

      return {
        id: project.id,
        name: project.projectName,
        code: project.projectCode,
        active: project.active,
        totalTasks: projectTasks.length,
        doneCount,
        openCount,
        progress,
      };
    })
    .sort((a, b) => b.totalTasks - a.totalTasks)
    .slice(0, 4);

  const spotlightProject = projectSummaries[0];

  const handleMetricNavigate = (label: string) => {
    if (label === "Projects") {
      navigate("/projects");
      return;
    }

    if (label === "Active Projects") {
      navigate("/projects?active=true");
      return;
    }

    if (label === "Open Tasks") {
      navigate("/tasks?status=Open");
      return;
    }

    if (label === "Completed Tasks") {
      navigate("/tasks?status=Completed");
    }
  };

  const handleProjectNavigate = (projectId: number) => {
    navigate(`/tasks?projectId=${projectId}`);
  };

  const handleStatusNavigate = (status: string) => {
    navigate(`/tasks?status=${encodeURIComponent(status)}`);
  };

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 5,
          overflow: "hidden",
          background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 42%, #22c55e 100%)",
          color: "#fff",
          boxShadow: "0 28px 60px rgba(37, 99, 235, 0.18)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "stretch" }}
          >
            <Stack spacing={1.5} sx={{ maxWidth: 640 }}>
              <Chip
                label="Workspace Overview"
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: "rgba(255,255,255,0.16)",
                  color: "#fff",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              />
              <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.03em" }}>
                Workspace
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.82)", maxWidth: 560 }}>
                Track delivery momentum across projects, open work, completion progress, and the items that need attention next.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} flexWrap="wrap">
                <Chip icon={<FolderOpenRoundedIcon />} label={`${projects.length} total projects`} sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff" }} />
                <Chip icon={<PendingActionsRoundedIcon />} label={`${tasks.length} tracked tasks`} sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff" }} />
                <Chip icon={<WarningAmberRoundedIcon />} label={`${overdueTasks} overdue`} sx={{ bgcolor: overdueTasks ? "rgba(248,113,113,0.2)" : "rgba(255,255,255,0.14)", color: "#fff" }} />
              </Stack>
            </Stack>

            <Stack spacing={1.5} sx={{ minWidth: { md: 260 }, width: { xs: "100%", md: "auto" } }}>
              <Button
                variant="contained"
                onClick={() => setRefreshConfirmOpen(true)}
                sx={{
                  alignSelf: { xs: "stretch", md: "flex-end" },
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "#f8fafc",
                  fontWeight: 700,
                  boxShadow: "none",
                  backdropFilter: "blur(10px)",
                  '&:hover': { bgcolor: "rgba(255,255,255,0.28)", boxShadow: "none" },
                }}
              >
                Refresh
              </Button>
              <Card sx={{ borderRadius: 4, bgcolor: "rgba(255,255,255,0.14)", color: "#fff", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.45)" }}>
                <CardContent>
                  <Typography sx={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.75)" }}>
                    Completion Health
                  </Typography>
                  <Typography sx={{ mt: 0.75, fontSize: "2rem", fontWeight: 800 }}>{completionRate}%</Typography>
                  <Typography sx={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.78)" }}>
                    {completedTasks} of {tasks.length} tasks are complete.
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={completionRate}
                    sx={{
                      mt: 2,
                      height: 9,
                      borderRadius: 999,
                      bgcolor: "rgba(255,255,255,0.18)",
                      '& .MuiLinearProgress-bar': { borderRadius: 999, bgcolor: "#f8fafc" },
                    }}
                  />
                </CardContent>
              </Card>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        {[
          {
            label: "Projects",
            value: projects.length,
            helper: `${activeRate}% currently active`,
            tone: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
            icon: <FolderOpenRoundedIcon sx={{ color: "#2563eb" }} />,
          },
          {
            label: "Active Projects",
            value: activeProjects,
            helper: `${projects.length - activeProjects} inactive or archived`,
            tone: "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)",
            icon: <AutorenewRoundedIcon sx={{ color: "#0891b2" }} />,
          },
          {
            label: "Open Tasks",
            value: openTasks,
            helper: `${inProgressTasks} already in progress`,
            tone: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
            icon: <PendingActionsRoundedIcon sx={{ color: "#ea580c" }} />,
          },
          {
            label: "Completed Tasks",
            value: completedTasks,
            helper: `${overdueTasks} overdue items need review`,
            tone: "linear-gradient(135deg, #ecfdf5 0%, #dcfce7 100%)",
            icon: <CheckCircleRoundedIcon sx={{ color: "#16a34a" }} />,
          },
        ].map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.label}>
            <Card
              onClick={() => handleMetricNavigate(metric.label)}
              sx={{
                ...METRIC_CARD_STYLES,
                background: metric.tone,
                cursor: "pointer",
                transition: "transform 180ms ease, box-shadow 180ms ease",
                '&:hover': {
                  transform: "translateY(-4px)",
                  boxShadow: "0 24px 45px rgba(15, 23, 42, 0.14)",
                },
              }}
            >
              <CardContent sx={{ p: 2.25 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Box>
                    <Typography sx={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", fontWeight: 700 }}>
                      {metric.label}
                    </Typography>
                    <Typography sx={{ mt: 0.8, fontSize: "2rem", lineHeight: 1, fontWeight: 800, color: "#0f172a" }}>
                      {metric.value}
                    </Typography>
                    <Typography sx={{ mt: 1, fontSize: "0.9rem", color: "#475569" }}>
                      {metric.helper}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 46, height: 46, borderRadius: 3, bgcolor: "rgba(255,255,255,0.72)", display: "grid", placeItems: "center" }}>
                    {metric.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ ...METRIC_CARD_STYLES, borderRadius: 5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                    Project Focus
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: "0.94rem" }}>
                    The busiest projects in the workspace and how much work is already closed out.
                  </Typography>
                </Box>
                {spotlightProject ? (
                  <Chip
                    label={`Top load: ${spotlightProject.code}`}
                    sx={{ alignSelf: "flex-start", bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 700 }}
                  />
                ) : null}
              </Stack>

              <Stack spacing={2} sx={{ mt: 2.5 }}>
                {projectSummaries.map((project) => (
                  <Box
                    key={project.id}
                    onClick={() => handleProjectNavigate(project.id)}
                    sx={{
                      p: 1.5,
                      mx: -1.5,
                      borderRadius: 3,
                      cursor: "pointer",
                      transition: "background-color 180ms ease, transform 180ms ease",
                      '&:hover': {
                        bgcolor: "#f8fafc",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} alignItems={{ xs: "flex-start", sm: "center" }}>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>{project.name}</Typography>
                        <Typography sx={{ fontSize: "0.88rem", color: "#64748b" }}>
                          {project.code} • {project.totalTasks} tasks • {project.openCount} open
                        </Typography>
                      </Box>
                      <Chip
                        label={project.active ? "Active" : "Inactive"}
                        size="small"
                        sx={{
                          bgcolor: project.active ? "#dcfce7" : "#e2e8f0",
                          color: project.active ? "#166534" : "#475569",
                          fontWeight: 700,
                        }}
                      />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={project.progress}
                      sx={{
                        mt: 1.25,
                        height: 10,
                        borderRadius: 999,
                        bgcolor: "#e2e8f0",
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 999,
                          background: "linear-gradient(90deg, #2563eb 0%, #0ea5e9 100%)",
                        },
                      }}
                    />
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.9 }}>
                      <Typography sx={{ fontSize: "0.82rem", color: "#64748b" }}>
                        {project.doneCount} completed
                      </Typography>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                        {project.progress}% done
                      </Typography>
                    </Stack>
                  </Box>
                ))}
                {projectSummaries.length === 0 ? (
                  <Typography sx={{ color: "#64748b" }}>No projects with task activity yet.</Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ ...METRIC_CARD_STYLES, borderRadius: 5, height: "100%" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                Status Pulse
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.94rem", mb: 2.25 }}>
                A quick pulse check of how work is distributed right now.
              </Typography>

              <Stack spacing={1.25}>
                {topStatuses.map(([status, count], index) => {
                  const width = tasks.length === 0 ? 0 : Math.max(8, Math.round((count / tasks.length) * 100));
                  const colors = [
                    "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)",
                    "linear-gradient(90deg, #0f766e 0%, #2dd4bf 100%)",
                    "linear-gradient(90deg, #c2410c 0%, #fb923c 100%)",
                    "linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)",
                  ];

                  return (
                    <Box
                      key={status}
                      onClick={() => handleStatusNavigate(status)}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        cursor: "pointer",
                        transition: "transform 180ms ease, box-shadow 180ms ease",
                        '&:hover': {
                          transform: "translateY(-2px)",
                          boxShadow: "0 14px 28px rgba(15, 23, 42, 0.08)",
                        },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>{status}</Typography>
                        <Typography sx={{ fontSize: "0.88rem", color: "#475569" }}>{count}</Typography>
                      </Stack>
                      <Box sx={{ height: 10, borderRadius: 999, bgcolor: "#e2e8f0", overflow: "hidden" }}>
                        <Box sx={{ height: "100%", width: `${width}%`, background: colors[index % colors.length], borderRadius: 999 }} />
                      </Box>
                    </Box>
                  );
                })}
                {topStatuses.length === 0 ? (
                  <Typography sx={{ color: "#64748b" }}>No task status data available yet.</Typography>
                ) : null}
              </Stack>

              <Divider sx={{ my: 2.25 }} />

              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "#fff7ed" }}>
                    <Typography sx={{ fontSize: "0.78rem", textTransform: "uppercase", color: "#9a3412", fontWeight: 700 }}>
                      In Progress
                    </Typography>
                    <Typography sx={{ mt: 0.4, fontSize: "1.6rem", fontWeight: 800, color: "#7c2d12" }}>
                      {inProgressTasks}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: overdueTasks ? "#fef2f2" : "#f8fafc" }}>
                    <Typography sx={{ fontSize: "0.78rem", textTransform: "uppercase", color: overdueTasks ? "#b91c1c" : "#475569", fontWeight: 700 }}>
                      Overdue
                    </Typography>
                    <Typography sx={{ mt: 0.4, fontSize: "1.6rem", fontWeight: 800, color: overdueTasks ? "#991b1b" : "#0f172a" }}>
                      {overdueTasks}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
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
