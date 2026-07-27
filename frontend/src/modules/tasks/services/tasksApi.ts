import { httpClient } from "@shared/api/httpClient";

export type TaskDto = {
  id: number;
  taskNo?: string;
  projectId?: number;
  issueActionItem?: string;
  description?: string;
  priority?: string;
  status?: string;
  ownerId?: number;
  targetDate?: string;
  updatedAt?: string;
};

export async function fetchTasks(): Promise<TaskDto[]> {
  const response = await httpClient.get<TaskDto[]>("/tasks");
  return response.data;
}
