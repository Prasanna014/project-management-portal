export type ModuleCapability = {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  search: boolean;
  pagination: boolean;
  filtering: boolean;
};

export type ModuleField = {
  name: string;
  required: boolean;
};

export type ModuleColumn = {
  label: string;
  accessor: string;
};

export type ListResponseMode = "paged" | "array";

export type AdminModuleSpec = {
  key: string;
  title: string;
  description: string;
  backendEndpoint: string;
  listEndpoint: string;
  createEndpoint?: string;
  updateEndpoint?: string;
  deleteEndpoint?: string;
  listResponseMode: ListResponseMode;
  columns: ModuleColumn[];
  fields: ModuleField[];
  capabilities: ModuleCapability;
};

const fullCapabilities: ModuleCapability = {
  create: true,
  read: true,
  update: true,
  delete: true,
  search: true,
  pagination: true,
  filtering: true,
};

export const adminModuleSpecs: Record<string, AdminModuleSpec> = {
  departments: {
    key: "departments",
    title: "Departments",
    description: "Manage department master data used by projects and user assignments.",
    backendEndpoint: "/api/admin/departments",
    listEndpoint: "/api/admin/departments",
    createEndpoint: "/api/admin/departments",
    updateEndpoint: "/api/admin/departments/:id",
    deleteEndpoint: "/api/admin/departments/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Name", accessor: "departmentName" },
      { label: "Code", accessor: "departmentCode" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "name", required: true },
      { name: "code", required: true },
      { name: "description", required: false },
      { name: "status", required: true },
    ],
    capabilities: fullCapabilities,
  },
  roles: {
    key: "roles",
    title: "Roles",
    description: "Define role catalog for DB-driven authorization mapping.",
    backendEndpoint: "/api/admin/roles",
    listEndpoint: "/api/admin/roles",
    createEndpoint: "/api/admin/roles",
    updateEndpoint: "/api/admin/roles/:id",
    deleteEndpoint: "/api/admin/roles/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Role Name", accessor: "roleName" },
      { label: "Role Key", accessor: "roleKey" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "name", required: true },
      { name: "description", required: false },
      { name: "scope", required: true },
      { name: "status", required: true },
    ],
    capabilities: fullCapabilities,
  },
  permissions: {
    key: "permissions",
    title: "Permissions",
    description: "Manage action-level permissions consumed by API permission rules.",
    backendEndpoint: "/api/admin/permissions",
    listEndpoint: "/api/admin/permissions",
    createEndpoint: "/api/admin/permissions",
    updateEndpoint: "/api/admin/permissions/:id",
    deleteEndpoint: "/api/admin/permissions/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Permission", accessor: "permissionName" },
      { label: "Key", accessor: "permissionKey" },
      { label: "Module", accessor: "moduleName" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "name", required: true },
      { name: "code", required: true },
      { name: "resource", required: true },
      { name: "status", required: true },
    ],
    capabilities: fullCapabilities,
  },
  "user-roles": {
    key: "user-roles",
    title: "User Roles",
    description: "Assign roles to users with start/end validity windows.",
    backendEndpoint: "/api/admin/roles/assignments/users",
    listEndpoint: "/api/admin/roles/assignments/users/:userId",
    createEndpoint: "/api/admin/roles/assignments/users",
    deleteEndpoint: "/api/admin/roles/assignments/users/:userId/roles/:roleId",
    listResponseMode: "array",
    columns: [
      { label: "User", accessor: "userId" },
      { label: "Role", accessor: "roleId" },
      { label: "Assigned By", accessor: "assignedBy" },
      { label: "Assigned At", accessor: "assignedAt" },
    ],
    fields: [
      { name: "userId", required: true },
      { name: "roleId", required: true },
      { name: "assignedBy", required: true },
    ],
    capabilities: fullCapabilities,
  },
  "role-permissions": {
    key: "role-permissions",
    title: "Role Permissions",
    description: "Map role-to-permission assignments that drive authorization checks.",
    backendEndpoint: "/api/admin/roles/assignments/permissions",
    listEndpoint: "/api/admin/roles/assignments/permissions/:roleId",
    createEndpoint: "/api/admin/roles/assignments/permissions",
    deleteEndpoint: "/api/admin/roles/assignments/permissions/:roleId/:permissionId",
    listResponseMode: "array",
    columns: [
      { label: "Role", accessor: "roleId" },
      { label: "Permission", accessor: "permissionId" },
      { label: "Granted By", accessor: "grantedBy" },
      { label: "Granted At", accessor: "grantedAt" },
    ],
    fields: [
      { name: "roleId", required: true },
      { name: "permissionId", required: true },
      { name: "grantedBy", required: true },
    ],
    capabilities: fullCapabilities,
  },
  "project-departments": {
    key: "project-departments",
    title: "Project Departments",
    description: "Maintain project-to-department associations used for access boundaries.",
    backendEndpoint: "/api/admin/departments/assignments/projects",
    listEndpoint: "/api/admin/departments/assignments/projects/:projectId",
    createEndpoint: "/api/admin/departments/assignments/projects",
    deleteEndpoint: "/api/admin/departments/assignments/projects/:projectId/departments/:departmentId",
    listResponseMode: "array",
    columns: [
      { label: "Project", accessor: "projectId" },
      { label: "Department", accessor: "departmentId" },
    ],
    fields: [
      { name: "projectId", required: true },
      { name: "departmentId", required: true },
    ],
    capabilities: fullCapabilities,
  },
  workflows: {
    key: "workflows",
    title: "Workflows",
    description: "Create and maintain workflow definitions used by tasks.",
    backendEndpoint: "/api/admin/workflows",
    listEndpoint: "/api/admin/workflows",
    createEndpoint: "/api/admin/workflows",
    updateEndpoint: "/api/admin/workflows/:id",
    deleteEndpoint: "/api/admin/workflows/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Name", accessor: "workflowName" },
      { label: "Key", accessor: "workflowKey" },
      { label: "Entity", accessor: "entityType" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "name", required: true },
      { name: "key", required: true },
      { name: "description", required: false },
      { name: "entityType", required: true },
      { name: "active", required: true },
    ],
    capabilities: fullCapabilities,
  },
  "workflow-states": {
    key: "workflow-states",
    title: "Workflow States",
    description: "Manage states available within a workflow.",
    backendEndpoint: "/api/admin/workflows/states",
    listEndpoint: "/api/admin/workflows/:workflowId/states",
    createEndpoint: "/api/admin/workflows/states",
    updateEndpoint: "/api/admin/workflows/states/:id",
    listResponseMode: "array",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Workflow", accessor: "workflowId" },
      { label: "State", accessor: "stateName" },
      { label: "Sequence", accessor: "displayOrder" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "workflowId", required: true },
      { name: "stateKey", required: true },
      { name: "stateName", required: true },
      { name: "displayOrder", required: true },
      { name: "initial", required: true },
      { name: "terminal", required: true },
      { name: "active", required: true },
    ],
    capabilities: fullCapabilities,
  },
  "workflow-transitions": {
    key: "workflow-transitions",
    title: "Workflow Transitions",
    description: "Configure valid transitions between source and target states.",
    backendEndpoint: "/api/admin/workflows/transitions",
    listEndpoint: "/api/admin/workflows/:workflowId/transitions",
    createEndpoint: "/api/admin/workflows/transitions",
    updateEndpoint: "/api/admin/workflows/transitions/:id",
    listResponseMode: "array",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Workflow", accessor: "workflowId" },
      { label: "From", accessor: "fromStateId" },
      { label: "To", accessor: "toStateId" },
      { label: "Name", accessor: "transitionName" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "workflowId", required: true },
      { name: "fromStateId", required: true },
      { name: "toStateId", required: true },
      { name: "transitionKey", required: true },
      { name: "transitionName", required: true },
      { name: "requiresComment", required: true },
      { name: "active", required: true },
    ],
    capabilities: fullCapabilities,
  },
  "task-statuses": {
    key: "task-statuses",
    title: "Task Statuses",
    description: "Manage canonical task statuses visible across project boards.",
    backendEndpoint: "/api/admin/task-catalog/statuses",
    listEndpoint: "/api/admin/task-catalog/statuses",
    createEndpoint: "/api/admin/task-catalog/statuses",
    updateEndpoint: "/api/admin/task-catalog/statuses/:id",
    deleteEndpoint: "/api/admin/task-catalog/statuses/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Name", accessor: "statusName" },
      { label: "Code", accessor: "statusKey" },
      { label: "Order", accessor: "displayOrder" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "statusKey", required: true },
      { name: "statusName", required: true },
      { name: "description", required: false },
      { name: "displayOrder", required: true },
      { name: "colorCode", required: false },
      { name: "terminal", required: true },
      { name: "active", required: true },
    ],
    capabilities: fullCapabilities,
  },
  "task-priorities": {
    key: "task-priorities",
    title: "Task Priorities",
    description: "Configure task priority definitions and display ordering.",
    backendEndpoint: "/api/admin/task-catalog/priorities",
    listEndpoint: "/api/admin/task-catalog/priorities",
    createEndpoint: "/api/admin/task-catalog/priorities",
    updateEndpoint: "/api/admin/task-catalog/priorities/:id",
    deleteEndpoint: "/api/admin/task-catalog/priorities/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Name", accessor: "priorityName" },
      { label: "Code", accessor: "priorityKey" },
      { label: "Order", accessor: "displayOrder" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "priorityKey", required: true },
      { name: "priorityName", required: true },
      { name: "description", required: false },
      { name: "displayOrder", required: true },
      { name: "colorCode", required: false },
      { name: "active", required: true },
    ],
    capabilities: fullCapabilities,
  },
  "task-categories": {
    key: "task-categories",
    title: "Task Categories",
    description: "Maintain task categories used in filtering and reporting.",
    backendEndpoint: "/api/admin/task-catalog/categories",
    listEndpoint: "/api/admin/task-catalog/categories",
    createEndpoint: "/api/admin/task-catalog/categories",
    updateEndpoint: "/api/admin/task-catalog/categories/:id",
    deleteEndpoint: "/api/admin/task-catalog/categories/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Name", accessor: "categoryName" },
      { label: "Code", accessor: "categoryKey" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "categoryKey", required: true },
      { name: "categoryName", required: true },
      { name: "description", required: false },
      { name: "active", required: true },
    ],
    capabilities: fullCapabilities,
  },
  notifications: {
    key: "notifications",
    title: "Notifications",
    description: "Review and govern system notifications delivered to users.",
    backendEndpoint: "/api/notifications/user/:userId",
    listEndpoint: "/api/notifications/user/:userId",
    createEndpoint: "/api/notifications",
    listResponseMode: "array",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Recipient", accessor: "userId" },
      { label: "Type", accessor: "notificationType" },
      { label: "Subject", accessor: "title" },
      { label: "Read", accessor: "isRead" },
    ],
    fields: [
      { name: "userId", required: true },
      { name: "taskId", required: false },
      { name: "title", required: true },
      { name: "message", required: true },
      { name: "notificationType", required: true },
    ],
    capabilities: {
      ...fullCapabilities,
      delete: false,
      update: false,
      pagination: false,
      filtering: false,
    },
  },
  "activity-history": {
    key: "activity-history",
    title: "Activity History",
    description: "Track user and system activity events for operational oversight.",
    backendEndpoint: "/api/activity/task/:taskId",
    listEndpoint: "/api/activity/task/:taskId",
    createEndpoint: "/api/activity",
    listResponseMode: "array",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Task", accessor: "taskId" },
      { label: "Type", accessor: "activityType" },
      { label: "Actor", accessor: "performedBy" },
      { label: "When", accessor: "performedAt" },
    ],
    fields: [
      { name: "taskId", required: true },
      { name: "activityType", required: true },
      { name: "oldValue", required: false },
      { name: "newValue", required: false },
      { name: "performedBy", required: true },
    ],
    capabilities: {
      ...fullCapabilities,
      update: false,
      delete: false,
      pagination: false,
      filtering: false,
    },
  },
};

export function getAdminModuleSpec(key: string): AdminModuleSpec | undefined {
  return adminModuleSpecs[key];
}
