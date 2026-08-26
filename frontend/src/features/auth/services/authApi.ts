import { httpClient } from "@shared/api/httpClient";
import type { AuthUser } from "@features/auth/context/AuthContext";
import type { UserRecord } from "@modules/users/services/usersApi";

export type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
  userId: number;
  email: string;
  authorities: string[];
  passwordChangeRequired?: boolean;
};

export async function loginWithPassword(payload: LoginRequest): Promise<{ token: string; user: AuthUser }> {
  const response = await httpClient.post<LoginResponse>("/auth/login", payload);
  const body = response.data;

  return {
    token: body.accessToken,
    user: {
      userId: body.userId,
      email: body.email,
      authorities: body.authorities ?? [],
      passwordChangeRequired: body.passwordChangeRequired ?? false,
    },
  };
}

export async function activateInvitation(token: string, newPassword: string): Promise<UserRecord> {
  const response = await httpClient.post<UserRecord>("/auth/activate", { token, newPassword });
  return response.data;
}

export async function requestForgotPassword(email: string): Promise<UserRecord> {
  const response = await httpClient.post<UserRecord>("/auth/forgot-password", { email });
  return response.data;
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<UserRecord> {
  const response = await httpClient.post<UserRecord>("/auth/reset-password", { token, newPassword });
  return response.data;
}
