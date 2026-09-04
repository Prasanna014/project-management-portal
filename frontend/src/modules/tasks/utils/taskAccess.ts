import type { AuthUser } from "@features/auth/context/AuthContext";

type TaskOwnershipRecord = {
  ownerId?: number | null;
  createdBy?: number | null;
};

const ADMIN_AUTHORITY_TOKENS = new Set([
  "*",
  "ALL",
  "ALL_PERMISSIONS",
  "ADMIN",
  "ROLE_ADMIN",
  "GLOBAL_ADMIN",
  "ROLE_GLOBAL_ADMIN",
]);

function normalizeAuthority(value: string) {
  return value.trim().toUpperCase().replace(/[\s\-./:]+/g, "_");
}

export function isTaskAdministrator(user: AuthUser | null | undefined): boolean {
  if (!user) {
    return false;
  }

  return (user.authorities ?? [])
    .map((authority) => normalizeAuthority(authority))
    .some((authority) => ADMIN_AUTHORITY_TOKENS.has(authority));
}

export function canModifyTask(task: TaskOwnershipRecord | null | undefined, user: AuthUser | null | undefined): boolean {
  if (!task || !user) {
    return false;
  }

  if (isTaskAdministrator(user)) {
    return true;
  }

  return task.ownerId === user.userId || task.createdBy === user.userId;
}
