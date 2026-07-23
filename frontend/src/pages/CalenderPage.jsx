import React, { useEffect, useMemo, useState } from "react";
import { Box, Card, CardContent, Typography, Grid, CircularProgress, Snackbar } from "@mui/material";
import { getAllTasks } from "../services/taskService";

export default function CalenderPage() {
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true);
				const data = await getAllTasks();
				setTasks(data || []);
			} catch {
				setError("Failed to load calendar data");
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
			<Box sx={{ p: 3 }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h5" sx={{ mb: 2 }}>Task Calendar</Typography>
			<Grid container spacing={2}>
				{Object.keys(groupedByDate).map((dateKey) => (
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
				))}
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
