import { httpClient } from "@shared/api/httpClient";
import type { PagedResponse } from "@shared/types/pagination";

export type AdminRecord = Record<string, unknown>;

export type ListResult = {
  rows: AdminRecord[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

type QueryParams = {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  keyword?: string;
  active?: boolean;
};

type ListRequest = {
  endpoint: string;
  pathParams: Record<string, string>;
  responseMode: "paged" | "array";
  queryParams?: QueryParams;
};

type CreateRequest = {
  endpoint: string;
  payload: Record<string, unknown>;
};

type UpdateRequest = {
  endpoint: string;
  pathParams: Record<string, string>;
  payload: Record<string, unknown>;
};

type DeleteRequest = {
  endpoint: string;
  pathParams: Record<string, string>;
};

const pathParamPattern = /:([A-Za-z0-9_]+)/g;

export function getEndpointPathParams(endpoint: string): string[] {
  const matches = Array.from(endpoint.matchAll(pathParamPattern));
  return matches.map((match) => match[1]);
}

export function resolveEndpoint(endpoint: string, pathParams: Record<string, string>): string {
  const requiredKeys = getEndpointPathParams(endpoint);

  return requiredKeys.reduce((resolved, key) => {
    const value = pathParams[key];
    if (!value) {
      throw new Error(`Missing required path parameter: ${key}`);
    }
    return resolved.replace(`:${key}`, encodeURIComponent(value));
  }, endpoint);
}

export function normalizeListResult(data: unknown, page: number, size: number): ListResult {
  if (Array.isArray(data)) {
    return {
      rows: data as AdminRecord[],
      totalElements: data.length,
      totalPages: data.length > 0 ? 1 : 0,
      page: 0,
      size: data.length,
    };
  }

  const paged = data as PagedResponse<AdminRecord>;
  return {
    rows: paged.content ?? [],
    totalElements: paged.totalElements ?? 0,
    totalPages: paged.totalPages ?? 0,
    page: paged.page ?? page,
    size: paged.size ?? size,
  };
}

export async function listAdminRecords(request: ListRequest): Promise<ListResult> {
  const url = resolveEndpoint(request.endpoint, request.pathParams);
  const response = await httpClient.get(url, {
    params: request.queryParams,
  });

  return normalizeListResult(
    request.responseMode === "paged" ? response.data : (response.data ?? []),
    request.queryParams?.page ?? 0,
    request.queryParams?.size ?? 20
  );
}

export async function createAdminRecord(request: CreateRequest): Promise<AdminRecord> {
  const response = await httpClient.post(request.endpoint, request.payload);
  return response.data as AdminRecord;
}

export async function updateAdminRecord(request: UpdateRequest): Promise<AdminRecord> {
  const url = resolveEndpoint(request.endpoint, request.pathParams);
  const response = await httpClient.put(url, request.payload);
  return response.data as AdminRecord;
}

export async function deleteAdminRecord(request: DeleteRequest): Promise<void> {
  const url = resolveEndpoint(request.endpoint, request.pathParams);
  await httpClient.delete(url);
}
