import { httpClient } from "@shared/api/httpClient";

export type TaskDto = {
  id: number;
  taskNo?: string;
  projectId?: number;
  issueActionItem?: string;
  description?: string;
  priority?: string;
  status?: string;
  statusId?: number;
  priorityId?: number;
  categoryId?: number;
  categoryName?: string;
  workflowStateId?: number;
  workflowStateName?: string;
  ownerId?: number;
  targetDate?: string;
  dateResolved?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  estimatedHours?: number;
  loggedHours?: number;
};

export async function fetchTasks(): Promise<TaskDto[]> {
  const response = await httpClient.get<TaskDto[]>("/tasks");
  return response.data;
}
