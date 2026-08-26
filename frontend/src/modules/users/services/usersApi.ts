import { httpClient } from "@shared/api/httpClient";

export type UserRecord = {
  id: number;
  employeeId: string;
  fullName: string;
  email: string;
  role?: string | null;
  active: boolean;
  passwordChangeRequired?: boolean;
  accountStatus?: string | null;
  onboardingAccessLink?: string | null;
  passwordResetLink?: string | null;
  invitationExpiresAt?: string | null;
  passwordResetExpiresAt?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type UpsertUserPayload = {
  employeeId: string;
  fullName: string;
  email: string;
  role?: string;
  active: boolean;
};

export async function fetchUsers(): Promise<UserRecord[]> {
  const response = await httpClient.get<UserRecord[]>("/users");
  return response.data;
}

export async function createUser(payload: UpsertUserPayload): Promise<UserRecord> {
  const response = await httpClient.post<UserRecord>("/users", payload);
  return response.data;
}

export async function updateUser(userId: number, payload: UpsertUserPayload): Promise<UserRecord> {
  const response = await httpClient.put<UserRecord>(`/users/${userId}`, payload);
  return response.data;
}

export async function resendUserInvite(userId: number): Promise<UserRecord> {
  const response = await httpClient.post<UserRecord>(`/users/${userId}/resend-invite`);
  return response.data;
}

export async function adminResetUserPassword(userId: number): Promise<UserRecord> {
  const response = await httpClient.post<UserRecord>(`/users/${userId}/admin-reset-password`);
  return response.data;
}

export async function updateUserAccountStatus(userId: number, accountStatus: string): Promise<UserRecord> {
  const response = await httpClient.post<UserRecord>(`/users/${userId}/status`, { accountStatus });
  return response.data;
}
