import { httpClient } from "@shared/api/httpClient";

export type ProjectDeptSummary = {
  id: number;
  departmentName: string;
};

export type ProjectDto = {
  id: number;
  projectCode: string;
  projectName: string;
  projectSlug?: string;
  description?: string;
  active: boolean;
  workflowId?: number;
  workflowName?: string;
  departments?: ProjectDeptSummary[];
  createdAt?: string;
};

export type CreateProjectRequest = {
  projectCode: string;
  projectName: string;
  projectSlug?: string;
  description?: string;
  active: boolean;
  workflowId?: number;
};

export async function fetchProjects(): Promise<ProjectDto[]> {
  const response = await httpClient.get<ProjectDto[]>("/projects");
  return response.data;
}

export async function fetchProjectById(id: number): Promise<ProjectDto> {
  const response = await httpClient.get<ProjectDto>(`/projects/${id}`);
  return response.data;
}

export async function createProject(payload: CreateProjectRequest): Promise<ProjectDto> {
  const response = await httpClient.post<ProjectDto>('/projects', payload);
  return response.data;
}
