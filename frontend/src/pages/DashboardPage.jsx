import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Snackbar,
  Skeleton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import AssignmentOutlinedIcon    from "@mui/icons-material/AssignmentOutlined";
import RadioButtonUncheckedIcon  from "@mui/icons-material/RadioButtonUnchecked";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import AutorenewOutlinedIcon     from "@mui/icons-material/AutorenewOutlined";
import BlockOutlinedIcon         from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineIcon    from "@mui/icons-material/CheckCircleOutline";
import EventOutlinedIcon         from "@mui/icons-material/EventOutlined";
import WarningAmberOutlinedIcon  from "@mui/icons-material/WarningAmberOutlined";

import {
  getDashboardSummary,
  getStatusSummary,
  getPrioritySummary,
  getOwnerWorkload
} from "../services/dashboardService";
import { useProject } from "../contexts/ProjectContext";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer
} from "recharts";

const STATUS_COLORS = ["#4F46E5", "#8B5CF6", "#059669", "#D97706", "#DC2626"];

const CARD_CONFIG = [
  { key: "totalTasks",      label: "Total Tasks",  Icon: AssignmentOutlinedIcon,     color: "#4F46E5", bg: "#EEF2FF" },
  { key: "openTasks",       label: "Open",          Icon: RadioButtonUncheckedIcon,   color: "#0EA5E9", bg: "#E0F2FE" },
  { key: "waitingTasks",    label: "Waiting",       Icon: HourglassEmptyOutlinedIcon, color: "#D97706", bg: "#FEF3C7" },
  { key: "inProgressTasks", label: "In Progress",   Icon: AutorenewOutlinedIcon,      color: "#8B5CF6", bg: "#EDE9FE" },
  { key: "blockedTasks",    label: "Blocked",       Icon: BlockOutlinedIcon,          color: "#DC2626", bg: "#FEE2E2" },
  { key: "completedTasks",  label: "Completed",     Icon: CheckCircleOutlineIcon,     color: "#059669", bg: "#DCFCE7" },
  { key: "scheduledTasks",  label: "Scheduled",     Icon: EventOutlinedIcon,          color: "#0891B2", bg: "#CFFAFE" },
  { key: "overdueTasks",    label: "Overdue",       Icon: WarningAmberOutlinedIcon,   color: "#F97316", bg: "#FFEDD5" },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: "#fff", border: "1px solid #E2E8F0", borderRadius: "10px",
      p: "10px 14px", boxShadow: "0 8px 24px rgba(15,23,42,0.12)"
    }}>
      {label && (
        <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#374151", mb: 0.5 }}>{label}</Typography>
      )}
      {payload.map((e, i) => (
        <Typography key={i} sx={{ fontSize: "0.78rem", color: e.color || "#4F46E5", fontWeight: 600 }}>
          {e.name || e.dataKey}: {e.value}
        </Typography>
      ))}
    </Box>
  );
};

export default function DashboardPage() {
  const { projects, selectedProjectId, setSelectedProjectId } = useProject();

  const [summary, setSummary] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [ownerData, setOwnerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (projectId) => {
    try {
      setLoading(true);
      const pid = projectId || undefined;
      const [summaryRes, statusRes, priorityRes, ownerRes] =
        await Promise.all([
          getDashboardSummary(pid),
          getStatusSummary(pid),
          getPrioritySummary(pid),
          getOwnerWorkload(pid)
        ]);

      setSummary(summaryRes || {});
      setStatusData(Object.entries(statusRes || {}).map(([key, value]) => ({ name: key, value })));
      setPriorityData(Object.entries(priorityRes || {}).map(([key, value]) => ({ name: key, value })));
      setOwnerData(Object.entries(ownerRes || {}).map(([key, value]) => ({ name: key, tasks: value })));
    } catch (err) {
      setError("Failed to load dashboard: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard(selectedProjectId);
  }, [selectedProjectId, loadDashboard]);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={180} height={36} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width={300} height={22} sx={{ mb: 3 }} />
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {[...Array(8)].map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={100} sx={{ borderRadius: "12px" }} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={2.5}>
          {[...Array(3)].map((_, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rounded" height={290} sx={{ borderRadius: "12px" }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page header with project selector */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A" }}>Dashboard</Typography>
          <Typography variant="body2" sx={{ color: "#64748B", mt: 0.25 }}>
            {selectedProjectId
              ? `Showing metrics for: ${projects.find(p => String(p.id) === String(selectedProjectId))?.projectName || "Selected project"}`
              : "Overview of your entire workspace"}
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Project</InputLabel>
          <Select
            label="Project"
            value={selectedProjectId || ""}
            onChange={(e) => setSelectedProjectId(e.target.value || "")}
            sx={{ bgcolor: "#fff", fontSize: "0.875rem" }}
          >
            <MenuItem value="">All Projects</MenuItem>
            {projects.map((p) => (
              <MenuItem key={p.id} value={String(p.id)}>
                {p.projectName || p.name || `Project ${p.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {CARD_CONFIG.map(({ key, label, Icon, color, bg }) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Card sx={{ p: 0, borderTop: `3px solid ${color}`, overflow: "hidden" }}>
              <CardContent sx={{ p: "18px 20px !important" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography sx={{
                      fontSize: "0.7rem", fontWeight: 600, color: "#64748B",
                      textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.75
                    }}>
                      {label}
                    </Typography>
                    <Typography sx={{ fontSize: "2rem", fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>
                      {summary?.[key] ?? 0}
                    </Typography>
                  </Box>
                  <Box sx={{
                    width: 44, height: 44, borderRadius: "11px", bgcolor: bg,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <Icon sx={{ color, fontSize: "1.35rem" }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={2.5}>
        {/* Status donut */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: "20px !important" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>
                Status Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" innerRadius={58} outerRadius={88} paddingAngle={3}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    iconType="circle" iconSize={8}
                    formatter={(v) => <span style={{ fontSize: "0.72rem", color: "#64748B" }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Priority bar */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: "20px !important" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>
                Priority Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priorityData} barSize={30}>
                  <defs>
                    <linearGradient id="prGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#4F46E5" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#818CF8" stopOpacity={0.5}  />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" fill="url(#prGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Owner workload */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: "20px !important" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>
                Owner Workload
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ownerData} barSize={30}>
                  <defs>
                    <linearGradient id="owGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#8B5CF6" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#C4B5FD" stopOpacity={0.5}  />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="tasks" fill="url(#owGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={!!error} message={error} autoHideDuration={4000} onClose={() => setError("")} />
    </Box>
  );
}
