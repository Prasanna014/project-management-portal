import { httpClient } from "@shared/api/httpClient";

type DashboardQueryOptions = {
  projectId?: number | null;
};

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

export async function fetchDashboardSummary(options: DashboardQueryOptions = {}): Promise<DashboardSummary> {
  const response = await httpClient.get<DashboardSummary>("/dashboard/summary", {
    params: options.projectId ? { projectId: options.projectId } : undefined,
  });
  return response.data;
}

export async function fetchDashboardStatusBreakdown(options: DashboardQueryOptions = {}): Promise<Record<string, number>> {
  const response = await httpClient.get<Record<string, number>>("/dashboard/status", {
    params: options.projectId ? { projectId: options.projectId } : undefined,
  });
  return response.data;
}

export async function fetchDashboardPriorityBreakdown(options: DashboardQueryOptions = {}): Promise<Record<string, number>> {
  const response = await httpClient.get<Record<string, number>>("/dashboard/priority", {
    params: options.projectId ? { projectId: options.projectId } : undefined,
  });
  return response.data;
}
