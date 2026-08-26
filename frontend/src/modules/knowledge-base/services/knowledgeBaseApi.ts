import { httpClient } from "@shared/api/httpClient";
import type { PagedResponse } from "@shared/types/pagination";

export type KnowledgeDocumentRecord = {
  id: number;
  title: string;
  category: string;
  audience?: string | null;
  description?: string | null;
  fileName: string;
  contentType?: string | null;
  fileExtension?: string | null;
  fileSize: number;
  uploadedBy: number;
  uploadedByName?: string | null;
  deletedAt?: string | null;
  deletedBy?: number | null;
  deletedByName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type KnowledgeDocumentUpsertPayload = {
  title: string;
  category: string;
  audience?: string | null;
  description?: string | null;
};

export type KnowledgeDocumentListParams = {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  keyword?: string;
  includeDeleted?: boolean;
  deletedOnly?: boolean;
  uploadedByMeOnly?: boolean;
};

export async function listKnowledgeDocuments(params: KnowledgeDocumentListParams = {}): Promise<PagedResponse<KnowledgeDocumentRecord>> {
  const response = await httpClient.get<PagedResponse<KnowledgeDocumentRecord>>("/knowledge-base/documents", { params });
  return response.data;
}

export async function uploadKnowledgeDocument(file: File, payload: KnowledgeDocumentUpsertPayload): Promise<KnowledgeDocumentRecord> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", payload.title);
  formData.append("category", payload.category);
  if (payload.audience) {
    formData.append("audience", payload.audience);
  }
  if (payload.description) {
    formData.append("description", payload.description);
  }

  const response = await httpClient.post<KnowledgeDocumentRecord>("/knowledge-base/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function updateKnowledgeDocument(documentId: number, payload: KnowledgeDocumentUpsertPayload): Promise<KnowledgeDocumentRecord> {
  const response = await httpClient.put<KnowledgeDocumentRecord>(`/knowledge-base/documents/${documentId}`, payload);
  return response.data;
}

export async function softDeleteKnowledgeDocument(documentId: number): Promise<void> {
  await httpClient.delete(`/knowledge-base/documents/${documentId}`);
}

export async function restoreKnowledgeDocument(documentId: number): Promise<KnowledgeDocumentRecord> {
  const response = await httpClient.post<KnowledgeDocumentRecord>(`/knowledge-base/documents/${documentId}/restore`);
  return response.data;
}

export async function downloadKnowledgeDocument(documentId: number, fileName: string): Promise<void> {
  const response = await httpClient.get<Blob>(`/knowledge-base/documents/${documentId}/download`, {
    responseType: "blob",
  });

  const blobUrl = window.URL.createObjectURL(response.data);
  const link = window.document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}
