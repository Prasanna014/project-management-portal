import { httpClient } from "@shared/api/httpClient";

export type ProjectDto = {
  id: number;
  projectCode: string;
  projectName: string;
  description?: string;
  active: boolean;
  createdAt?: string;
};

export async function fetchProjects(): Promise<ProjectDto[]> {
  const response = await httpClient.get<ProjectDto[]>("/projects");
  return response.data;
}
