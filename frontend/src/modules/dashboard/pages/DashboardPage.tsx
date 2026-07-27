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
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TableContainer,
  Typography,
} from "@mui/material";
import {
  AssignmentRounded,
  AutorenewRounded,
  BlockRounded,
  CheckCircleRounded,
  HourglassTopRounded,
  RadioButtonUncheckedRounded,
  ScheduleRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { LoadingState } from "@shared/ui/states/LoadingState";
import {
  type DashboardSummary,
  fetchDashboardPriorityBreakdown,
  fetchDashboardStatusBreakdown,
  fetchDashboardSummary,
} from "@modules/dashboard/services/dashboardApi";
import { ConfirmActionDialog } from "@shared/ui/feedback/ConfirmActionDialog";
import { PageSnackbar, type SnackbarSeverity } from "@shared/ui/feedback/PageSnackbar";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildReadPermissionCandidates } from "@shared/auth/permissions";
import { useProjectScope } from "@shared/context/ProjectScopeContext";
import type { SvgIconComponent } from "@mui/icons-material";
import { fetchProjects } from "@modules/projects/services/projectsApi";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
};

export function DashboardPage() {
  const { hasAnyPermission } = useAuth();
  const { selectedProjectId, setSelectedProjectId } = useProjectScope();
  const navigate = useNavigate();
  const canRead = hasAnyPermission(buildReadPermissionCandidates("dashboard"));

  const [refreshConfirmOpen, setRefreshConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary", selectedProjectId],
    queryFn: () => fetchDashboardSummary({ projectId: selectedProjectId }),
    enabled: canRead,
  });

  const statusQuery = useQuery({
    queryKey: ["dashboard-status", selectedProjectId],
    queryFn: () => fetchDashboardStatusBreakdown({ projectId: selectedProjectId }),
    enabled: canRead,
  });

  const priorityQuery = useQuery({
    queryKey: ["dashboard-priority", selectedProjectId],
    queryFn: () => fetchDashboardPriorityBreakdown({ projectId: selectedProjectId }),
    enabled: canRead,
  });

  const projectsQuery = useQuery({
    queryKey: ["dashboard-project-list"],
    queryFn: fetchProjects,
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

  const handleMetricCardClick = (label: string) => {
    const params = new URLSearchParams();
    if (selectedProjectId) {
      params.set("projectId", String(selectedProjectId));
    }
    if (label !== "Total Tasks") {
      params.set("status", label);
    }
    navigate(`/tasks${params.toString() ? `?${params.toString()}` : ""}`);
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
  const projects = (projectsQuery.data ?? []).filter((project) => project.active);

  type MetricCard = {
    label: string;
    value: number;
    color: string;
    bg: string;
    Icon: SvgIconComponent;
  };

  const metricCards: MetricCard[] = summary
    ? [
        { label: "Total Tasks", value: summary.totalTasks, color: "#4F46E5", bg: "#EEF2FF", Icon: AssignmentRounded },
        { label: "Open", value: summary.openTasks, color: "#0EA5E9", bg: "#E0F2FE", Icon: RadioButtonUncheckedRounded },
        { label: "Waiting", value: summary.waitingTasks, color: "#D97706", bg: "#FEF3C7", Icon: HourglassTopRounded },
        { label: "In Progress", value: summary.inProgressTasks, color: "#7C3AED", bg: "#EDE9FE", Icon: AutorenewRounded },
        { label: "Blocked", value: summary.blockedTasks, color: "#DC2626", bg: "#FEE2E2", Icon: BlockRounded },
        { label: "Completed", value: summary.completedTasks, color: "#059669", bg: "#D1FAE5", Icon: CheckCircleRounded },
        { label: "Scheduled", value: summary.scheduledTasks, color: "#0284C7", bg: "#CFFAFE", Icon: ScheduleRounded },
        { label: "Overdue", value: summary.overdueTasks, color: "#EA580C", bg: "#FFEDD5", Icon: WarningAmberRounded },
      ]
    : [];

  const statusColorMap: Record<string, string> = {
    Open: "#0EA5E9",
    Waiting: "#D97706",
    "In Progress": "#7C3AED",
    Blocked: "#DC2626",
    Completed: "#059669",
    Scheduled: "#0284C7",
    Overdue: "#EA580C",
  };

  const priorityColorMap: Record<string, string> = {
    High: "#DC2626",
    Medium: "#D97706",
    Low: "#059669",
  };

  const statusEntries = Object.entries(status).map(([name, value]) => ({
    name,
    value: Number(value),
    color: statusColorMap[name] ?? "#64748B",
  }));

  const priorityEntries = Object.entries(priority).map(([name, value]) => ({
    name,
    value: Number(value),
    color: priorityColorMap[name] ?? "#64748B",
  }));

  const statusTotal = statusEntries.reduce((sum, item) => sum + item.value, 0);
  const priorityTotal = priorityEntries.reduce((sum, item) => sum + item.value, 0);

  const pieData = [
    { name: "Open", value: summary.openTasks, color: "#0EA5E9" },
    { name: "Waiting", value: summary.waitingTasks, color: "#D97706" },
    { name: "In Progress", value: summary.inProgressTasks, color: "#7C3AED" },
    { name: "Blocked", value: summary.blockedTasks, color: "#DC2626" },
    { name: "Completed", value: summary.completedTasks, color: "#059669" },
    { name: "Scheduled", value: summary.scheduledTasks, color: "#0284C7" },
    { name: "Overdue", value: summary.overdueTasks, color: "#EA580C" },
  ].filter((item) => item.value > 0);

  if (!summary) {
    return <Alert severity="info">No dashboard summary is available.</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Dashboard</Typography>
          <Chip
            size="small"
            label={selectedProjectId ? `Project #${selectedProjectId}` : "All Projects"}
            sx={{
              bgcolor: selectedProjectId ? "#FFF7ED" : "#EEF2FF",
              color: selectedProjectId ? "#C2410C" : "#3730A3",
              fontWeight: 600,
            }}
          />
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
              value={selectedProjectId ?? "ALL"}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedProjectId(value === "ALL" ? null : Number(value));
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

      <Grid container spacing={2}>
        {metricCards.map((card) => (
          <Grid key={card.label} item xs={12} sm={6} md={3}>
            <Card
              onClick={() => handleMetricCardClick(card.label)}
              sx={{
                borderTop: `3px solid ${card.color}`,
                borderRadius: 2.5,
                cursor: "pointer",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
                },
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack spacing={0.5}>
                    <Typography variant="overline" sx={{ letterSpacing: "0.08em", color: "#64748B", fontWeight: 700 }}>
                      {card.label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#0F172A", lineHeight: 1.1 }}>
                      {card.value}
                    </Typography>
                  </Stack>
                  <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 40, height: 40 }}>
                    <card.Icon fontSize="small" />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Status Breakdown</Typography>
              <TableContainer>
                <List dense sx={{ py: 0 }}>
                  {statusEntries.map((item) => {
                    const percent = statusTotal > 0 ? Math.round((item.value / statusTotal) * 100) : 0;
                    return (
                      <ListItem key={item.name} disableGutters sx={{ display: "block", py: 1 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.7 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                          <Chip
                            size="small"
                            label={item.value}
                            sx={{
                              bgcolor: `${item.color}20`,
                              color: item.color,
                              fontWeight: 700,
                              minWidth: 44,
                            }}
                          />
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={percent}
                          sx={{
                            height: 8,
                            borderRadius: 99,
                            bgcolor: "#EEF2FF",
                            "& .MuiLinearProgress-bar": { bgcolor: item.color, borderRadius: 99 },
                          }}
                        />
                      </ListItem>
                    );
                  })}
                  {statusEntries.length === 0 ? (
                    <ListItem disableGutters>
                      <ListItemText primary="No status data available" />
                    </ListItem>
                  ) : null}
                </List>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Priority Breakdown</Typography>
              <TableContainer>
                <List dense sx={{ py: 0 }}>
                  {priorityEntries.map((item) => {
                    const percent = priorityTotal > 0 ? Math.round((item.value / priorityTotal) * 100) : 0;
                    return (
                      <ListItem key={item.name} disableGutters sx={{ display: "block", py: 1 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.7 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: item.color }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                          </Stack>
                          <Chip
                            size="small"
                            label={`${item.value} (${percent}%)`}
                            sx={{
                              bgcolor: `${item.color}20`,
                              color: item.color,
                              fontWeight: 700,
                            }}
                          />
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={percent}
                          sx={{
                            height: 8,
                            borderRadius: 99,
                            bgcolor: "#EEF2FF",
                            "& .MuiLinearProgress-bar": { bgcolor: item.color, borderRadius: 99 },
                          }}
                        />
                      </ListItem>
                    );
                  })}
                  {priorityEntries.length === 0 ? (
                    <ListItem disableGutters>
                      <ListItemText primary="No priority data available" />
                    </ListItem>
                  ) : null}
                </List>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                Task Distribution (Status Pie Chart)
              </Typography>
              <Box sx={{ height: 340 }}>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={120}
                        paddingAngle={2}
                        labelLine={false}
                        label={(props) => `${props.name}: ${props.value}`}
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}`, "Tasks"]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                    <Typography variant="body2" color="text.secondary">
                      No distribution data available for the current project selection.
                    </Typography>
                  </Stack>
                )}
              </Box>
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
