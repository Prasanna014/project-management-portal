export type MainNavItem = {
  label: string;
  to: string;
};

export type AdminNavItem = {
  key: string;
  label: string;
  to: string;
  available: boolean;
  note?: string;
};

export const mainNavigation: MainNavItem[] = [
  { label: "Dashboard", to: "/" },
  { label: "Workspace", to: "/workspace" },
  { label: "Projects", to: "/projects" },
  { label: "Tasks", to: "/tasks" },
  { label: "Reports", to: "/reports" },
  { label: "Administration", to: "/administration" },
  { label: "Settings", to: "/settings" },
];

// Generated from backend module matrix (Step 3).
export const administrationNavigation: AdminNavItem[] = [
  { key: "departments", label: "Departments", to: "/administration/departments", available: true },
  { key: "roles", label: "Roles", to: "/administration/roles", available: true },
  { key: "permissions", label: "Permissions", to: "/administration/permissions", available: true },
  { key: "user-roles", label: "User Roles", to: "/administration/user-roles", available: true },
  { key: "role-permissions", label: "Role Permissions", to: "/administration/role-permissions", available: true },
  { key: "project-departments", label: "Project Departments", to: "/administration/project-departments", available: true },
  { key: "workflows", label: "Workflows", to: "/administration/workflows", available: true },
  { key: "workflow-states", label: "Workflow Status", to: "/administration/workflow-states", available: true },
  { key: "workflow-transitions", label: "Workflow Transitions", to: "/administration/workflow-transitions", available: true },
  { key: "task-statuses", label: "Task Statuses", to: "/administration/task-statuses", available: true },
  { key: "task-priorities", label: "Task Priorities", to: "/administration/task-priorities", available: true },
  { key: "task-categories", label: "Task Categories", to: "/administration/task-categories", available: true },
  { key: "notifications", label: "Notifications", to: "/administration/notifications", available: true },
  { key: "activity-history", label: "Activity History", to: "/administration/activity-history", available: true },

  { key: "organization", label: "Organization", to: "/administration/organization", available: false, note: "Missing backend API" },
  { key: "project-members", label: "Project Members", to: "/administration/project-members", available: false, note: "Missing backend API" },
  { key: "sub-categories", label: "Sub Categories", to: "/administration/sub-categories", available: false, note: "Missing backend API" },
  { key: "labels", label: "Labels", to: "/administration/labels", available: false, note: "Missing backend API" },
  { key: "work-logs", label: "Work Logs", to: "/administration/work-logs", available: false, note: "Missing backend API" },
  { key: "audit-logs", label: "Audit Logs", to: "/administration/audit-logs", available: false, note: "Missing backend API" },
];
