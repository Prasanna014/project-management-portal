export type PermissionAction = "read" | "create" | "update" | "delete" | "assign" | "export";

const FULL_ACCESS_TOKENS = new Set([
  "*",
  "ALL",
  "ALL_PERMISSIONS",
  "SUPER_ADMIN",
  "ROLE_SUPER_ADMIN",
]);

const ACTION_ALIASES: Record<PermissionAction, string[]> = {
  read: ["READ", "VIEW"],
  create: ["CREATE", "ADD"],
  update: ["UPDATE", "EDIT"],
  delete: ["DELETE", "REMOVE"],
  assign: ["ASSIGN"],
  export: ["EXPORT"],
};

function normalizePermissionToken(value: string): string {
  return value.trim().toUpperCase().replace(/[\s\-./:]+/g, "_");
}

function wildcardMatch(pattern: string, token: string): boolean {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`).test(token);
}

export function hasAnyPermission(authorities: string[] | undefined, candidates: string[]): boolean {
  const normalizedAuthorities = (authorities ?? [])
    .map((authority) => normalizePermissionToken(authority))
    .filter(Boolean);

  if (normalizedAuthorities.some((authority) => FULL_ACCESS_TOKENS.has(authority))) {
    return true;
  }

  const normalizedCandidates = candidates
    .map((candidate) => normalizePermissionToken(candidate))
    .filter(Boolean);

  if (normalizedCandidates.length === 0) {
    return false;
  }

  return normalizedCandidates.some((candidate) =>
    normalizedAuthorities.some((authority) => authority === candidate || wildcardMatch(authority, candidate))
  );
}

function toPermissionResource(key: string): string {
  return normalizePermissionToken(key);
}

export function buildActionPermissionCandidates(resourceKey: string, action: PermissionAction): string[] {
  const resource = toPermissionResource(resourceKey);
  const actionKeys = ACTION_ALIASES[action];
  const candidates = new Set<string>();

  for (const actionKey of actionKeys) {
    candidates.add(`${resource}_${actionKey}`);
    candidates.add(`${resource}:${actionKey}`);
    candidates.add(`${resource}.${actionKey}`);

    candidates.add(`ADMIN_${resource}_${actionKey}`);
    candidates.add(`ADMIN:${resource}:${actionKey}`);
    candidates.add(`ADMIN.${resource}.${actionKey}`);
  }

  return [...candidates];
}

export function buildReadPermissionCandidates(resourceKey: string): string[] {
  return buildActionPermissionCandidates(resourceKey, "read");
}
