import { httpClient } from "@shared/api/httpClient";

export type WorkflowOption = {
  id: number;
  workflowKey: string;
  workflowName: string;
  entityType: string;
  active: boolean;
};

export async function fetchActiveWorkflows(): Promise<WorkflowOption[]> {
  const res = await httpClient.get<{ content: WorkflowOption[] }>(
    "/admin/workflows?active=true&size=200"
  );
  return res.data?.content ?? [];
}
