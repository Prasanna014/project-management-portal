import React, { useEffect, useMemo, useState } from "react";
import { Box, Card, CardContent, Typography, Grid, CircularProgress, Snackbar, Alert } from "@mui/material";
import { getAllTasks } from "../services/taskService";

export default function CalenderPage() {
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const load = async () => {
			try {
				console.log("🟡 Loading calendar tasks...");
				console.log("📍 API URL:", import.meta.env.VITE_API_BASE_URL);
				setLoading(true);
				
				const data = await getAllTasks();
				console.log("🟢 Calendar tasks loaded:", data);
				console.log("🔢 Total tasks:", data?.length || 0);
				
				setTasks(data || []);
			} catch (err) {
				console.error("🔴 ERROR loading calendar:", err);
				console.error("Error message:", err.message);
				setError(`Failed to load calendar data: ${err.message}`);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	const groupedByDate = useMemo(() => {
		const grouped = {};
		tasks.forEach((task) => {
			const key = task.targetDate || "No target date";
			if (!grouped[key]) {
				grouped[key] = [];
			}
			grouped[key].push(task);
		});
		return grouped;
	}, [tasks]);

	if (loading) {
		return (
			<Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
				<CircularProgress />
				<Typography>🟡 Loading calendar tasks...</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h5" sx={{ mb: 2 }}>📅 Task Calendar</Typography>
			{error && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{error}
				</Alert>
			)}
			
			{!error && tasks.length === 0 && (
				<Alert severity="info" sx={{ mb: 2 }}>
					ℹ️ No tasks found. <a href="/create-task">Create a task</a>
				</Alert>
			)}
			<Grid container spacing={2}>
				{Object.keys(groupedByDate).length === 0 ? (
					<Grid item xs={12}>
						<Typography color="textSecondary">📄 No tasks with target dates</Typography>
					</Grid>
				) : (
					Object.keys(groupedByDate).map((dateKey) => (
					<Grid item xs={12} md={6} lg={4} key={dateKey}>
						<Card>
							<CardContent>
								<Typography variant="h6" sx={{ mb: 1 }}>{dateKey}</Typography>
								{groupedByDate[dateKey].map((task) => (
									<Typography key={task.id || task.taskNo} sx={{ mb: 0.5 }}>
										{task.taskNo} - {task.issueActionItem}
									</Typography>
								))}
							</CardContent>
						</Card>
					</Grid>
				)))}
			</Grid>
			<Snackbar
				open={!!error}
				message={error}
				autoHideDuration={3000}
				onClose={() => setError("")}
			/>
		</Box>
	);
}
