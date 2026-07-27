import { createContext, useEffect, useContext, useMemo, useState, type ReactNode } from "react";
import { authToken } from "@shared/api/authToken";
import { hasAnyPermission as checkAnyPermission } from "@shared/auth/permissions";

const AUTH_USER_KEY = "supportflow_auth_user";

export type AuthUser = {
  userId: number;
  email: string;
  authorities: string[];
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => authToken.get());
  const [user, setUser] = useState<AuthUser | null>(() => loadAuthUser());

  useEffect(() => {
    const onUnauthorized = () => {
      authToken.clear();
      localStorage.removeItem(AUTH_USER_KEY);
      setToken(null);
      setUser(null);
    };

    window.addEventListener("app:unauthorized", onUnauthorized);
    return () => {
      window.removeEventListener("app:unauthorized", onUnauthorized);
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      token,
      user,
      isAuthenticated: Boolean(token),
      login: (nextToken, nextUser) => {
        authToken.set(nextToken);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
      },
      logout: () => {
        authToken.clear();
        localStorage.removeItem(AUTH_USER_KEY);
        setToken(null);
        setUser(null);
      },
      hasPermission: (permission) => checkAnyPermission(user?.authorities, [permission]),
      hasAnyPermission: (permissions) => checkAnyPermission(user?.authorities, permissions),
    };
  }, [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
