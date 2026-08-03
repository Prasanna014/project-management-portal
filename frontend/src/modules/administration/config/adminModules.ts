export type ModuleCapability = {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  search: boolean;
  pagination: boolean;
  filtering: boolean;
};

export type ModuleFieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "date"
  | "select"
  | "color";

export type StaticOption = { label: string; value: string | number | boolean };

export type ModuleField = {
  name: string;
  label: string;
  required: boolean;
  type: ModuleFieldType;
  staticOptions?: StaticOption[];
  selectEndpoint?: string;
  selectResponseKey?: string;
  selectLabelKey?: string;
  selectValueKey?: string;
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
  // Organization
  "business-units": {
    key: "business-units",
    title: "Business Units",
    description: "Manage business units optionally linked to departments.",
    backendEndpoint: "/admin/organization/business-units",
    listEndpoint: "/admin/organization/business-units",
    createEndpoint: "/admin/organization/business-units",
    updateEndpoint: "/admin/organization/business-units/:id",
    deleteEndpoint: "/admin/organization/business-units/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Name", accessor: "unitName" },
      { label: "Code", accessor: "unitCode" },
      { label: "Department", accessor: "departmentName" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "unitCode", label: "Unit Code", required: true, type: "text" },
      { name: "unitName", label: "Unit Name", required: true, type: "text" },
      { name: "description", label: "Description", required: false, type: "textarea" },
      { name: "departmentId", label: "Department", required: false, type: "select", selectEndpoint: "/admin/departments", selectResponseKey: "content", selectLabelKey: "departmentName", selectValueKey: "id" },
      { name: "active", label: "Active", required: true, type: "boolean" },
    ],
    capabilities: fullCapabilities,
  },
  "time-zones": {
    key: "time-zones",
    title: "Time Zones",
    description: "Configure time zone catalog used by locations and company profile.",
    backendEndpoint: "/admin/organization/time-zones",
    listEndpoint: "/admin/organization/time-zones",
    createEndpoint: "/admin/organization/time-zones",
    updateEndpoint: "/admin/organization/time-zones/:id",
    deleteEndpoint: "/admin/organization/time-zones/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Name", accessor: "timezoneName" },
      { label: "Code", accessor: "timezoneCode" },
      { label: "UTC Offset", accessor: "utcOffset" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "timezoneCode", label: "Code", required: true, type: "text" },
      { name: "timezoneName", label: "Name", required: true, type: "text" },
      { name: "utcOffset", label: "UTC Offset (e.g. +05:30)", required: true, type: "text" },
      { name: "active", label: "Active", required: true, type: "boolean" },
    ],
    capabilities: fullCapabilities,
  },
  locations: {
    key: "locations",
    title: "Locations",
    description: "Manage physical office and site locations linked to time zones.",
    backendEndpoint: "/admin/organization/locations",
    listEndpoint: "/admin/organization/locations",
    createEndpoint: "/admin/organization/locations",
    updateEndpoint: "/admin/organization/locations/:id",
    deleteEndpoint: "/admin/organization/locations/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Name", accessor: "locationName" },
      { label: "Code", accessor: "locationCode" },
      { label: "City", accessor: "city" },
      { label: "Country", accessor: "country" },
      { label: "Time Zone", accessor: "timezoneName" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "locationCode", label: "Location Code", required: true, type: "text" },
      { name: "locationName", label: "Location Name", required: true, type: "text" },
      { name: "addressLine1", label: "Address Line 1", required: false, type: "text" },
      { name: "city", label: "City", required: false, type: "text" },
      { name: "state", label: "State / Province", required: false, type: "text" },
      { name: "country", label: "Country", required: false, type: "text" },
      { name: "timezoneId", label: "Time Zone", required: false, type: "select", selectEndpoint: "/admin/organization/time-zones", selectResponseKey: "content", selectLabelKey: "timezoneName", selectValueKey: "id" },
      { name: "active", label: "Active", required: true, type: "boolean" },
    ],
    capabilities: fullCapabilities,
  },
  holidays: {
    key: "holidays",
    title: "Holidays",
    description: "Define public and optional holidays per location.",
    backendEndpoint: "/admin/organization/holidays",
    listEndpoint: "/admin/organization/holidays",
    createEndpoint: "/admin/organization/holidays",
    updateEndpoint: "/admin/organization/holidays/:id",
    deleteEndpoint: "/admin/organization/holidays/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Name", accessor: "holidayName" },
      { label: "Date", accessor: "holidayDate" },
      { label: "Type", accessor: "holidayType" },
      { label: "Location", accessor: "locationName" },
      { label: "Recurring", accessor: "recurring" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "holidayDate", label: "Date", required: true, type: "date" },
      { name: "holidayName", label: "Holiday Name", required: true, type: "text" },
      { name: "holidayType", label: "Type", required: false, type: "select", staticOptions: [{ label: "Public", value: "PUBLIC" }, { label: "Optional", value: "OPTIONAL" }, { label: "Regional", value: "REGIONAL" }] },
      { name: "locationId", label: "Location", required: false, type: "select", selectEndpoint: "/admin/organization/locations", selectResponseKey: "content", selectLabelKey: "locationName", selectValueKey: "id" },
      { name: "recurring", label: "Recurring", required: false, type: "boolean" },
      { name: "description", label: "Description", required: false, type: "textarea" },
      { name: "active", label: "Active", required: true, type: "boolean" },
    ],
    capabilities: fullCapabilities,
  },
  // Access Control
  roles: {
    key: "roles",
    title: "Roles",
    description: "Define role catalog for DB-driven authorization mapping.",
    backendEndpoint: "/admin/roles",
    listEndpoint: "/admin/roles",
    createEndpoint: "/admin/roles",
    updateEndpoint: "/admin/roles/:id",
    deleteEndpoint: "/admin/roles/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Role Name", accessor: "roleName" },
      { label: "Role Key", accessor: "roleKey" },
      { label: "System", accessor: "systemRole" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "roleKey", label: "Role Key (e.g. ADMIN)", required: true, type: "text" },
      { name: "roleName", label: "Role Name", required: true, type: "text" },
      { name: "description", label: "Description", required: false, type: "textarea" },
      { name: "systemRole", label: "System Role", required: false, type: "boolean" },
      { name: "active", label: "Active", required: true, type: "boolean" },
    ],
    capabilities: fullCapabilities,
  },
  permissions: {
    key: "permissions",
    title: "Permissions",
    description: "Manage action-level permissions consumed by API permission rules.",
    backendEndpoint: "/admin/permissions",
    listEndpoint: "/admin/permissions",
    createEndpoint: "/admin/permissions",
    updateEndpoint: "/admin/permissions/:id",
    deleteEndpoint: "/admin/permissions/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Permission", accessor: "permissionName" },
      { label: "Key", accessor: "permissionKey" },
      { label: "Module", accessor: "moduleName" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "permissionKey", label: "Permission Key", required: true, type: "text" },
      { name: "permissionName", label: "Permission Name", required: true, type: "text" },
      { name: "moduleName", label: "Module", required: false, type: "text" },
      { name: "description", label: "Description", required: false, type: "textarea" },
      { name: "active", label: "Active", required: true, type: "boolean" },
    ],
    capabilities: fullCapabilities,
  },
  // Task Catalog
  "task-statuses": {
    key: "task-statuses",
    title: "Task Statuses",
    description: "Manage canonical task statuses visible across project boards.",
    backendEndpoint: "/admin/task-catalog/statuses",
    listEndpoint: "/admin/task-catalog/statuses",
    createEndpoint: "/admin/task-catalog/statuses",
    updateEndpoint: "/admin/task-catalog/statuses/:id",
    deleteEndpoint: "/admin/task-catalog/statuses/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Name", accessor: "statusName" },
      { label: "Key", accessor: "statusKey" },
      { label: "Order", accessor: "displayOrder" },
      { label: "Color", accessor: "colorCode" },
      { label: "Terminal", accessor: "terminal" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "statusKey", label: "Status Key", required: true, type: "text" },
      { name: "statusName", label: "Status Name", required: true, type: "text" },
      { name: "description", label: "Description", required: false, type: "textarea" },
      { name: "displayOrder", label: "Display Order", required: true, type: "number" },
      { name: "colorCode", label: "Color Code (hex)", required: false, type: "color" },
      { name: "terminal", label: "Terminal State", required: false, type: "boolean" },
      { name: "active", label: "Active", required: true, type: "boolean" },
    ],
    capabilities: fullCapabilities,
  },
  "task-priorities": {
    key: "task-priorities",
    title: "Task Priorities",
    description: "Configure task priority definitions and display ordering.",
    backendEndpoint: "/admin/task-catalog/priorities",
    listEndpoint: "/admin/task-catalog/priorities",
    createEndpoint: "/admin/task-catalog/priorities",
    updateEndpoint: "/admin/task-catalog/priorities/:id",
    deleteEndpoint: "/admin/task-catalog/priorities/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Name", accessor: "priorityName" },
      { label: "Key", accessor: "priorityKey" },
      { label: "Order", accessor: "displayOrder" },
      { label: "Color", accessor: "colorCode" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "priorityKey", label: "Priority Key", required: true, type: "text" },
      { name: "priorityName", label: "Priority Name", required: true, type: "text" },
      { name: "description", label: "Description", required: false, type: "textarea" },
      { name: "displayOrder", label: "Display Order", required: true, type: "number" },
      { name: "colorCode", label: "Color Code (hex)", required: false, type: "color" },
      { name: "active", label: "Active", required: true, type: "boolean" },
    ],
    capabilities: fullCapabilities,
  },
  "task-categories": {
    key: "task-categories",
    title: "Task Categories",
    description: "Maintain task categories used in filtering and reporting.",
    backendEndpoint: "/admin/task-catalog/categories",
    listEndpoint: "/admin/task-catalog/categories",
    createEndpoint: "/admin/task-catalog/categories",
    updateEndpoint: "/admin/task-catalog/categories/:id",
    deleteEndpoint: "/admin/task-catalog/categories/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Name", accessor: "categoryName" },
      { label: "Key", accessor: "categoryKey" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "categoryKey", label: "Category Key", required: true, type: "text" },
      { name: "categoryName", label: "Category Name", required: true, type: "text" },
      { name: "description", label: "Description", required: false, type: "textarea" },
      { name: "active", label: "Active", required: true, type: "boolean" },
    ],
    capabilities: fullCapabilities,
  },
  // Workflows
  workflows: {
    key: "workflows",
    title: "Workflows",
    description: "Create and maintain workflow definitions used by tasks.",
    backendEndpoint: "/admin/workflows",
    listEndpoint: "/admin/workflows",
    createEndpoint: "/admin/workflows",
    updateEndpoint: "/admin/workflows/:id",
    deleteEndpoint: "/admin/workflows/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Name", accessor: "workflowName" },
      { label: "Key", accessor: "workflowKey" },
      { label: "Entity Type", accessor: "entityType" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "workflowKey", label: "Workflow Key", required: true, type: "text" },
      { name: "workflowName", label: "Workflow Name", required: true, type: "text" },
      { name: "description", label: "Description", required: false, type: "textarea" },
      { name: "entityType", label: "Entity Type", required: true, type: "select", staticOptions: [{ label: "Task", value: "TASK" }, { label: "Project", value: "PROJECT" }] },
      { name: "active", label: "Active", required: true, type: "boolean" },
    ],
    capabilities: fullCapabilities,
  },
  // System
  notifications: {
    key: "notifications",
    title: "Notifications",
    description: "Review and govern system notifications delivered to users.",
    backendEndpoint: "/notifications/user/:userId",
    listEndpoint: "/notifications/user/:userId",
    createEndpoint: "/notifications",
    listResponseMode: "array",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Recipient", accessor: "userId" },
      { label: "Type", accessor: "notificationType" },
      { label: "Subject", accessor: "title" },
      { label: "Read", accessor: "isRead" },
    ],
    fields: [
      { name: "userId", label: "User ID", required: true, type: "number" },
      { name: "taskId", label: "Task ID", required: false, type: "number" },
      { name: "title", label: "Title", required: true, type: "text" },
      { name: "message", label: "Message", required: true, type: "textarea" },
      { name: "notificationType", label: "Type", required: true, type: "select", staticOptions: [{ label: "Info", value: "INFO" }, { label: "Warning", value: "WARNING" }, { label: "Task Assigned", value: "TASK_ASSIGNED" }, { label: "Task Updated", value: "TASK_UPDATED" }] },
    ],
    capabilities: { ...fullCapabilities, delete: false, update: false },
  },
  "activity-history": {
    key: "activity-history",
    title: "Activity History",
    description: "Track user and system activity events for operational oversight.",
    backendEndpoint: "/activity/task/:taskId",
    listEndpoint: "/activity/task/:taskId",
    createEndpoint: "/activity",
    listResponseMode: "array",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Task", accessor: "taskId" },
      { label: "Type", accessor: "activityType" },
      { label: "Actor", accessor: "performedBy" },
      { label: "When", accessor: "performedAt" },
    ],
    fields: [
      { name: "taskId", label: "Task ID", required: true, type: "number" },
      { name: "activityType", label: "Activity Type", required: true, type: "text" },
      { name: "oldValue", label: "Old Value", required: false, type: "text" },
      { name: "newValue", label: "New Value", required: false, type: "text" },
      { name: "performedBy", label: "Performed By (User ID)", required: true, type: "number" },
    ],
    capabilities: { ...fullCapabilities, update: false, delete: false },
  },
  "audit-logs": {
    key: "audit-logs",
    title: "Audit Logs",
    description: "Read-only audit trail of all administration actions.",
    backendEndpoint: "/admin/audit-logs",
    listEndpoint: "/admin/audit-logs",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Entity Type", accessor: "entityType" },
      { label: "Entity ID", accessor: "entityId" },
      { label: "Action", accessor: "action" },
      { label: "Performed By", accessor: "performedByName" },
      { label: "Performed At", accessor: "performedAt" },
    ],
    fields: [],
    capabilities: { create: false, read: true, update: false, delete: false, search: true, pagination: true, filtering: false },
  },
  "work-logs": {
    key: "work-logs",
    title: "Work Logs",
    description: "Track time logged by users against tasks.",
    backendEndpoint: "/admin/work-logs",
    listEndpoint: "/admin/work-logs",
    createEndpoint: "/admin/work-logs",
    updateEndpoint: "/admin/work-logs/:id",
    deleteEndpoint: "/admin/work-logs/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Task", accessor: "taskNo" },
      { label: "User", accessor: "userName" },
      { label: "Hours", accessor: "hoursLogged" },
      { label: "Date", accessor: "logDate" },
      { label: "Notes", accessor: "notes" },
    ],
    fields: [
      { name: "taskId", label: "Task ID", required: true, type: "number" },
      { name: "userId", label: "User ID", required: true, type: "number" },
      { name: "hoursLogged", label: "Hours Logged", required: true, type: "number" },
      { name: "logDate", label: "Log Date", required: true, type: "date" },
      { name: "notes", label: "Notes", required: false, type: "textarea" },
    ],
    capabilities: fullCapabilities,
  },
  // Departments (fallback - handled by DepartmentAdminPanel)
  departments: {
    key: "departments",
    title: "Departments",
    description: "Manage department master data.",
    backendEndpoint: "/admin/departments",
    listEndpoint: "/admin/departments",
    createEndpoint: "/admin/departments",
    updateEndpoint: "/admin/departments/:id",
    deleteEndpoint: "/admin/departments/:id",
    listResponseMode: "paged",
    columns: [
      { label: "ID", accessor: "id" },
      { label: "Name", accessor: "departmentName" },
      { label: "Code", accessor: "departmentCode" },
      { label: "Status", accessor: "active" },
    ],
    fields: [
      { name: "departmentName", label: "Department Name", required: true, type: "text" },
      { name: "departmentCode", label: "Code", required: true, type: "text" },
      { name: "active", label: "Active", required: true, type: "boolean" },
    ],
    capabilities: fullCapabilities,
  },
};

export function getAdminModuleSpec(key: string): AdminModuleSpec | undefined {
  return adminModuleSpecs[key];
}
