import { httpClient } from "@shared/api/httpClient";

export type ProjectDto = {
  id: number;
  projectCode: string;
  projectName: string;
  description?: string;
  active: boolean;
  createdAt?: string;
};

export type CreateProjectRequest = {
  projectCode: string;
  projectName: string;
  description?: string;
  active: boolean;
};

export async function fetchProjects(): Promise<ProjectDto[]> {
  const response = await httpClient.get<ProjectDto[]>("/projects");
  return response.data;
}

export async function createProject(payload: CreateProjectRequest): Promise<ProjectDto> {
  const response = await httpClient.post<ProjectDto>('/projects', payload);
  return response.data;
}
