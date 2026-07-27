import { httpClient } from "@shared/api/httpClient";

export type ReportDto = {
  reportName: string;
  totalCount: number;
  data: Record<string, number>;
};

const reportEndpoints = [
  "/reports/task-summary",
  "/reports/open-tasks",
  "/reports/completed-tasks",
  "/reports/priority",
  "/reports/owner-workload",
] as const;

export async function fetchReports(): Promise<ReportDto[]> {
  const responses = await Promise.all(reportEndpoints.map((endpoint) => httpClient.get<ReportDto>(endpoint)));
  return responses.map((response) => response.data);
}
