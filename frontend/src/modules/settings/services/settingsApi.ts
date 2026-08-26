import { httpClient } from "@shared/api/httpClient";

export type PersonalAccessTokenRecord = {
  id: number;
  tokenName: string;
  tokenPrefix: string;
  tokenMaskedValue: string;
  scopes: string[];
  plainTextToken?: string | null;
  expiresAt?: string | null;
  lastUsedAt?: string | null;
  revokedAt?: string | null;
  createdAt?: string | null;
  active: boolean;
};

export type CreatePersonalAccessTokenPayload = {
  tokenName: string;
  scopes: string[];
  expiresAt?: string | null;
};

export async function fetchPersonalAccessTokens(): Promise<PersonalAccessTokenRecord[]> {
  const response = await httpClient.get<PersonalAccessTokenRecord[]>("/settings/personal-access-tokens");
  return response.data;
}

export async function createPersonalAccessToken(
  payload: CreatePersonalAccessTokenPayload
): Promise<PersonalAccessTokenRecord> {
  const response = await httpClient.post<PersonalAccessTokenRecord>("/settings/personal-access-tokens", payload);
  return response.data;
}

export async function revokePersonalAccessToken(tokenId: number): Promise<void> {
  await httpClient.delete(`/settings/personal-access-tokens/${tokenId}`);
}
