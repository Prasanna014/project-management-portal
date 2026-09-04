export type PermissionAction = "read" | "create" | "update" | "delete" | "assign" | "export";

type RoleDefaultAccess = {
  read?: string[];
  create?: string[];
  update?: string[];
  delete?: string[];
  assign?: string[];
  export?: string[];
};

const FULL_ACCESS_TOKENS = new Set([
  "*",
  "ALL",
  "ALL_PERMISSIONS",
  "GLOBAL_ADMIN",
  "ROLE_GLOBAL_ADMIN",
]);

const ACTION_ALIASES: Record<PermissionAction, string[]> = {
  read: ["READ", "VIEW"],
  create: ["CREATE", "ADD"],
  update: ["UPDATE", "EDIT"],
  delete: ["DELETE", "REMOVE"],
  assign: ["ASSIGN"],
  export: ["EXPORT"],
};

const ROLE_DEFAULT_ACCESS: Record<string, RoleDefaultAccess | "*"> = {
  ADMIN: "*",
  ROLE_ADMIN: "*",
  GLOBAL_ADMIN: "*",
  ROLE_GLOBAL_ADMIN: "*",
  COMPANY_ADMIN: {
    read: ["DASHBOARD", "WORKSPACE", "PROJECTS", "TASKS", "SEARCH", "NOTIFICATIONS", "CALENDAR", "REPORTS", "USERS", "KNOWLEDGE_BASE", "SETTINGS"],
    create: ["PROJECTS", "TASKS", "USERS", "KNOWLEDGE_BASE"],
    update: ["PROJECTS", "TASKS", "USERS", "KNOWLEDGE_BASE"],
    delete: ["PROJECTS"],
    assign: ["TASKS", "PROJECTS"],
    export: ["TASKS", "REPORTS"],
  },
  ROLE_COMPANY_ADMIN: "*",
  PROJECT_ADMIN: {
    read: ["DASHBOARD", "WORKSPACE", "PROJECTS", "TASKS", "SEARCH", "NOTIFICATIONS", "CALENDAR", "REPORTS", "KNOWLEDGE_BASE"],
    create: ["TASKS", "KNOWLEDGE_BASE"],
    update: ["TASKS", "KNOWLEDGE_BASE"],
    assign: ["TASKS"],
    export: ["TASKS", "REPORTS"],
  },
  PMO_MANAGER: {
    read: ["DASHBOARD", "WORKSPACE", "PROJECTS", "TASKS", "SEARCH", "NOTIFICATIONS", "CALENDAR", "REPORTS", "USERS", "KNOWLEDGE_BASE", "SETTINGS"],
    create: ["PROJECTS", "TASKS", "KNOWLEDGE_BASE"],
    update: ["PROJECTS", "TASKS", "KNOWLEDGE_BASE"],
    assign: ["TASKS"],
    export: ["TASKS", "REPORTS"],
  },
  PROJECT_MANAGER: {
    read: ["DASHBOARD", "WORKSPACE", "PROJECTS", "TASKS", "SEARCH", "NOTIFICATIONS", "CALENDAR", "REPORTS", "USERS", "KNOWLEDGE_BASE", "SETTINGS"],
    create: ["PROJECTS", "TASKS", "KNOWLEDGE_BASE"],
    update: ["PROJECTS", "TASKS", "KNOWLEDGE_BASE"],
    assign: ["TASKS"],
    export: ["TASKS", "REPORTS"],
  },
  TEAM_LEAD: {
    read: ["DASHBOARD", "WORKSPACE", "PROJECTS", "TASKS", "SEARCH", "NOTIFICATIONS", "CALENDAR", "REPORTS", "KNOWLEDGE_BASE", "SETTINGS"],
    create: ["TASKS", "KNOWLEDGE_BASE"],
    update: ["TASKS", "KNOWLEDGE_BASE"],
    assign: ["TASKS"],
    export: ["TASKS"],
  },
  CONTRIBUTOR: {
    read: ["DASHBOARD", "WORKSPACE", "PROJECTS", "TASKS", "SEARCH", "NOTIFICATIONS", "CALENDAR", "KNOWLEDGE_BASE", "SETTINGS"],
    create: ["TASKS"],
    update: ["TASKS"],
  },
  KNOWLEDGE_CURATOR: {
    read: ["DASHBOARD", "PROJECTS", "TASKS", "SEARCH", "NOTIFICATIONS", "CALENDAR", "REPORTS", "KNOWLEDGE_BASE", "SETTINGS"],
    create: ["KNOWLEDGE_BASE"],
    update: ["KNOWLEDGE_BASE"],
    export: ["REPORTS"],
  },
  VIEWER: {
    read: ["DASHBOARD", "PROJECTS", "TASKS", "SEARCH", "NOTIFICATIONS", "CALENDAR", "REPORTS", "KNOWLEDGE_BASE", "SETTINGS"],
    export: ["REPORTS"],
  },
  USER: {
    read: ["DASHBOARD", "WORKSPACE", "PROJECTS", "TASKS", "SEARCH", "NOTIFICATIONS", "CALENDAR", "KNOWLEDGE_BASE", "SETTINGS"],
    create: ["TASKS"],
    update: ["TASKS"],
  },
};

function normalizePermissionToken(value: string): string {
  return value.trim().toUpperCase().replace(/[\s\-./:]+/g, "_");
}

function wildcardMatch(pattern: string, token: string): boolean {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`).test(token);
}

function normalizeAction(value: string): PermissionAction | null {
  const normalized = normalizePermissionToken(value);
  const actionEntry = Object.entries(ACTION_ALIASES).find(([, aliases]) => aliases.includes(normalized));
  return (actionEntry?.[0] as PermissionAction | undefined) ?? null;
}

function parsePermissionCandidate(candidate: string): { resource: string; action: PermissionAction } | null {
  const normalized = normalizePermissionToken(candidate);
  const parts = normalized.split("_").filter(Boolean);
  if (parts.length < 2) {
    return null;
  }

  if (parts[0] === "ADMIN") {
    parts.shift();
  }

  const action = normalizeAction(parts[parts.length - 1]);
  if (!action) {
    return null;
  }

  return {
    resource: parts.slice(0, -1).join("_"),
    action,
  };
}

function hasRoleDefaultAccess(authorities: string[], candidates: string[]): boolean {
  if (authorities.some((authority) => FULL_ACCESS_TOKENS.has(authority))) {
    return true;
  }

  const parsedCandidates = candidates
    .map(parsePermissionCandidate)
    .filter((candidate): candidate is { resource: string; action: PermissionAction } => Boolean(candidate));

  if (parsedCandidates.length === 0) {
    return false;
  }

  return authorities.some((authority) => {
    const roleAccess = ROLE_DEFAULT_ACCESS[authority];
    if (!roleAccess) {
      return false;
    }
    if (roleAccess === "*") {
      return true;
    }

    return parsedCandidates.some((candidate) => {
      const allowedResources = roleAccess[candidate.action] ?? [];
      return allowedResources.includes(candidate.resource);
    });
  });
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

  if (hasRoleDefaultAccess(normalizedAuthorities, normalizedCandidates)) {
    return true;
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
