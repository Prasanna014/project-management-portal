import { httpClient } from "@shared/api/httpClient";
import type { ProjectDto } from "@modules/projects/services/projectsApi";
import type { TaskDto } from "@modules/tasks/services/tasksApi";

export type SearchCommentResult = {
  id: number;
  taskId?: number;
  taskNo?: string;
  taskTitle?: string;
  commentText?: string;
  commentedBy?: number;
  commentedByName?: string;
  commentedAt?: string;
};

export type GlobalSearchResponse = {
  tasks: TaskDto[];
  projects: ProjectDto[];
  comments: SearchCommentResult[];
};

export async function globalSearch(keyword: string): Promise<GlobalSearchResponse> {
  const response = await httpClient.get<GlobalSearchResponse>("/search/global", {
    params: { keyword },
  });
  return response.data;
}
