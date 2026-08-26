import { httpClient } from "@shared/api/httpClient";

export type UserRecord = {
  id: number;
  employeeId: string;
  fullName: string;
  email: string;
  role?: string | null;
  active: boolean;
  passwordChangeRequired?: boolean;
  departmentId?: number | null;
  departmentName?: string | null;
  designation?: string | null;
  reportingManagerId?: number | null;
  reportingManagerName?: string | null;
  accountStatus?: string | null;
  onboardingAccessLink?: string | null;
  passwordResetLink?: string | null;
  emailDeliveryStatus?: string | null;
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
  departmentId?: number | null;
  designation?: string | null;
  reportingManagerId?: number | null;
};

export type DepartmentOption = {
  id: number;
  departmentName: string;
  departmentCode: string;
};

export async function fetchUsers(): Promise<UserRecord[]> {
  const response = await httpClient.get<UserRecord[]>("/users");
  return response.data;
}

export async function fetchCurrentUserProfile(): Promise<UserRecord> {
  const response = await httpClient.get<UserRecord>("/users/me");
  return response.data;
}

export async function fetchDepartmentOptions(): Promise<DepartmentOption[]> {
  const response = await httpClient.get<{ content: DepartmentOption[] }>("/admin/departments", {
    params: {
      page: 0,
      size: 200,
      sortBy: "departmentName",
      sortDir: "asc",
      active: true,
    },
  });
  return response.data.content ?? [];
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
