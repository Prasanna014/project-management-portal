import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Snackbar,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Alert,
  Button
} from "@mui/material";

import {
  getTaskSummaryReport,
  getPriorityReport
} from "../services/reportService";

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

export default function ReportsPage() {

  const [summary, setSummary] = useState({ totalCount: 0, data: {} });
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      console.log("🟡 Loading reports...");
      console.log("📍 API URL:", import.meta.env.VITE_API_BASE_URL);
      setLoading(true);

      const [summaryRes, priorityRes] = await Promise.all([
        getTaskSummaryReport(),
        getPriorityReport(),
      ]);

      console.log("🟢 Summary report loaded:", summaryRes);
      console.log("📊 Total Tasks:", summaryRes?.totalCount || 0);
      console.log("✅ Status Distribution:", summaryRes?.data);
      console.log("🎯 Priority report loaded:", priorityRes);

      setSummary(summaryRes || { totalCount: 0, data: {} });

      setStatusData(
        Object.entries(summaryRes?.data || {}).map(([key, value]) => ({
          name: key,
          value
        }))
      );

      setPriorityData(
        Object.entries(priorityRes?.data || {}).map(([key, value]) => ({
          name: key,
          value
        }))
      );

    } catch (err) {
      console.error("🔴 ERROR loading reports:", err);
      console.error("Error message:", err.message);
      setError(`Failed to load reports: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="h5" sx={{ mb: 3 }}>
          📊 Task Reports - Total Tasks: <strong>{summary?.totalCount || 0}</strong>
        </Typography>

        <Typography variant="h4" sx={{ mb: 3 }}>
          Reports
        </Typography>

        {/* ✅ SUMMARY CARDS (NO STATIC DATA) */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography>Total Tasks</Typography>
                <Typography variant="h5">{summary.totalCount || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography>Completed</Typography>
              <Typography variant="h5">{summary.data?.Completed || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ✅ CHARTS */}
      <Grid container spacing={3} sx={{ mt: 2 }}>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography>Status Report</Typography>
              <ResponsiveContainer width="100%" height={300}>
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

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography>Priority Report</Typography>
              <ResponsiveContainer width="100%" height={300}>
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

        </Grid>

        {/* ✅ ERROR SNACKBAR */}
        <Snackbar
          open={!!error}
          message={error}
          autoHideDuration={3000}
          onClose={() => setError("")}
        />

    </Box>
  );
}
