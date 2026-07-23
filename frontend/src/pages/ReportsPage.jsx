import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Snackbar,
  CircularProgress,
  Grid,
  Card,
  CardContent
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

  const [summary, setSummary] = useState({});
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);

      const [summaryRes, priorityRes] = await Promise.all([
        getTaskSummaryReport(),
        getPriorityReport(),
      ]);

      // ✅ summary cards
      setSummary(summaryRes || {});

      // ✅ convert maps → chart data
      //setStatusData(
        //Object.entries(statusRes.data).map(([key, value]) => ({
          //name: key,
          //value
        //}))
      //);

      setPriorityData(
        Object.entries(priorityRes || {}).map(([key, value]) => ({
          name: key,
          value
        }))
      );

    } catch {
      setError("Failed to load reports");
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
    <Box sx={{ p: 3 }}>

      <Typography variant="h4" sx={{ mb: 3 }}>
        Reports
      </Typography>

      {/* ✅ SUMMARY CARDS (NO STATIC DATA) */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography>Total Tasks</Typography>
              <Typography variant="h5">{summary.totalTasks}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography>Completed</Typography>
              <Typography variant="h5">{summary.completedTasks}</Typography>
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
