import { httpClient } from "@shared/api/httpClient";

export type DashboardSummary = {
  totalTasks: number;
  openTasks: number;
  waitingTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  completedTasks: number;
  scheduledTasks: number;
  overdueTasks: number;
  highPriorityTasks: number;
  mediumPriorityTasks: number;
  lowPriorityTasks: number;
};

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await httpClient.get<DashboardSummary>("/dashboard/summary");
  return response.data;
}

export async function fetchDashboardStatusBreakdown(): Promise<Record<string, number>> {
  const response = await httpClient.get<Record<string, number>>("/dashboard/status");
  return response.data;
}

export async function fetchDashboardPriorityBreakdown(): Promise<Record<string, number>> {
  const response = await httpClient.get<Record<string, number>>("/dashboard/priority");
  return response.data;
}
