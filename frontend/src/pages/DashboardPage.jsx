import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Snackbar,
  CircularProgress,
  Button
} from "@mui/material";

import SidebarPanel from "../components/SidebarPanel";
import {
  getDashboardSummary,
  getStatusSummary,
  getPrioritySummary,
  getOwnerWorkload
} from "../services/dashboardService";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#1976D2", "#7B1FA2", "#2E7D32", "#D32F2F", "#F9A825"];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [ownerData, setOwnerData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      console.log("🟡 Loading dashboard...");
      console.log("📍 API URL:", import.meta.env.VITE_API_BASE_URL);
      setLoading(true);

      const [summaryRes, statusRes, priorityRes, ownerRes] =
        await Promise.all([
          getDashboardSummary(),
          getStatusSummary(),
          getPrioritySummary(),
          getOwnerWorkload()
        ]);

      setSummary(summaryRes || {});

      setStatusData(
        Object.entries(statusRes || {}).map(([key, value]) => ({
          name: key,
          value
        }))
      );

      setPriorityData(
        Object.entries(priorityRes || {}).map(([key, value]) => ({
          name: key,
          value
        }))
      );

      setOwnerData(
        Object.entries(ownerRes || {}).map(([key, value]) => ({
          name: key,
          tasks: value
        }))
      );

      console.log("🟢 Dashboard loaded successfully:", { summaryRes, statusRes, priorityRes, ownerRes });
    } catch (err) {
      console.error("🔴 Dashboard error:", err);
      console.error("Error message:", err.message);
      setError("Failed to load dashboard: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const stats = [
    { label: "Total Tasks", value: summary?.totalTasks || 0 },
    { label: "Open Tasks", value: summary?.openTasks || 0 },
    { label: "Waiting Tasks", value: summary?.waitingTasks || 0 },
    { label: "In Progress", value: summary?.inProgressTasks || 0 },
    { label: "Blocked Tasks", value: summary?.blockedTasks || 0 },
    { label: "Completed Tasks", value: summary?.completedTasks || 0 },
    { label: "Scheduled Tasks", value: summary?.scheduledTasks || 0 },
    { label: "Overdue Tasks", value: summary?.overdueTasks || 0 }
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* MAIN CONTENT */}
      <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
        {/* ✅ STAT CARDS */}
        <Grid container spacing={3}>
          {stats.map((s, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card>
                <CardContent>
                  <Typography>{s.label}</Typography>
                  <Typography variant="h5">{s.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ✅ CHARTS */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* STATUS PIE */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography>Status Distribution</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value">
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

        {/* PRIORITY BAR */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography>Priority Distribution</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priorityData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1976D2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* OWNER BAR */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography>Owner Workload</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ownerData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#7B1FA2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        </Grid>

        {/* ✅ ERROR */}
        <Snackbar
          open={!!error}
          message={error}
          autoHideDuration={3000}
          onClose={() => setError("")}
        />
      </Box>

      {/* SIDEBAR */}
      <SidebarPanel title="Dashboard Options">
        <Button variant="outlined" fullWidth sx={{ mb: 1.5, color: "#fff", borderColor: "#fff" }}>
          Export Report
        </Button>
        <Button variant="outlined" fullWidth sx={{ mb: 1.5, color: "#fff", borderColor: "#fff" }}>
          Refresh Data
        </Button>
        <Button variant="outlined" fullWidth sx={{ color: "#fff", borderColor: "#fff" }}>
          Settings
        </Button>
      </SidebarPanel>
    </Box>
  );
}
