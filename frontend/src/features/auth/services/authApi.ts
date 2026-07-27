import { httpClient } from "@shared/api/httpClient";
import type { AuthUser } from "@features/auth/context/AuthContext";

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
    },
  };
}
