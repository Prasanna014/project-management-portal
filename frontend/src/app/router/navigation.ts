export type MainNavItem = {
  label: string;
  to: string;
};

export type AdminNavItem = {
  key: string;
  label: string;
  to: string;
  available: boolean;
  section: string;
  note?: string;
};

export const mainNavigation: MainNavItem[] = [
  { label: "Platform", to: "/platform" },
  { label: "Dashboard", to: "/" },
  { label: "Workspace", to: "/workspace" },
  { label: "Projects", to: "/projects" },
  { label: "Tasks", to: "/tasks" },
  { label: "Search", to: "/search" },
  { label: "Notifications", to: "/notifications" },
  { label: "Calendar", to: "/calendar" },
  { label: "Reports", to: "/reports" },
  { label: "Users", to: "/users" },
  { label: "Knowledge Base", to: "/knowledge-base" },
  { label: "Profile", to: "/profile" },
  { label: "Administration", to: "/administration" },
  { label: "Settings", to: "/settings" },
];

export const administrationNavigation: AdminNavItem[] = [
  // ── Organization ──────────────────────────────────────────────────────────────
  { key: "company-profile", label: "Company Profile",   to: "/administration/company-profile",   available: true,  section: "Organization" },
  { key: "departments",     label: "Departments",        to: "/administration/departments",        available: true,  section: "Organization" },
  { key: "business-units",  label: "Business Units",     to: "/administration/business-units",     available: true,  section: "Organization" },
  { key: "locations",       label: "Locations",          to: "/administration/locations",          available: true,  section: "Organization" },
  { key: "time-zones",      label: "Time Zones",         to: "/administration/time-zones",         available: true,  section: "Organization" },
  { key: "holidays",        label: "Holidays",           to: "/administration/holidays",           available: true,  section: "Organization" },

  // ── Access Control ────────────────────────────────────────────────────────────
  { key: "users",            label: "Users",             to: "/administration/users",             available: true,  section: "Access Control" },
  { key: "roles",            label: "Roles",             to: "/administration/roles",             available: true,  section: "Access Control" },
  { key: "permissions",      label: "Permissions",       to: "/administration/permissions",       available: true,  section: "Access Control" },
  { key: "user-roles",       label: "User Roles",        to: "/administration/user-roles",        available: true,  section: "Access Control" },
  { key: "role-permissions", label: "Role Permissions",  to: "/administration/role-permissions",  available: true,  section: "Access Control" },

  // ── Task Catalog ──────────────────────────────────────────────────────────────
  { key: "task-statuses",    label: "Task Statuses",    to: "/administration/task-statuses",    available: true,  section: "Task Catalog" },
  { key: "task-priorities",  label: "Task Priorities",  to: "/administration/task-priorities",  available: true,  section: "Task Catalog" },
  { key: "task-categories",  label: "Task Categories",  to: "/administration/task-categories",  available: true,  section: "Task Catalog" },
  { key: "labels",           label: "Labels",           to: "/administration/labels",           available: true,  section: "Task Catalog" },

  // ── Workflows ─────────────────────────────────────────────────────────────────
  { key: "workflows",              label: "Workflows",             to: "/administration/workflows",             available: true, section: "Workflows" },
  { key: "workflow-states",        label: "Workflow States",       to: "/administration/workflow-states",       available: true, section: "Workflows" },
  { key: "workflow-transitions",   label: "Workflow Transitions",  to: "/administration/workflow-transitions",  available: true, section: "Workflows" },

  // ── Projects ──────────────────────────────────────────────────────────────────
  { key: "project-departments", label: "Project Departments", to: "/administration/project-departments", available: true, section: "Projects" },
  { key: "project-members",     label: "Project Members",     to: "/administration/project-members",     available: true, section: "Projects" },

  // ── System ────────────────────────────────────────────────────────────────────
  { key: "notifications",    label: "Notifications",    to: "/administration/notifications",    available: true, section: "System" },
  { key: "activity-history", label: "Activity History", to: "/administration/activity-history", available: true, section: "System" },
  { key: "audit-logs",       label: "Audit Logs",       to: "/administration/audit-logs",       available: true, section: "System" },
  { key: "work-logs",        label: "Work Logs",        to: "/administration/work-logs",        available: true, section: "System" },
];
