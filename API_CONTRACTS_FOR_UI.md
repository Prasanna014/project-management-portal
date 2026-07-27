# Project Management Portal API Contracts for UI

## Base
- Base URL: http://localhost:8080
- API prefix: /api
- Auth type: Bearer JWT
- Auth header: Authorization: Bearer <token>

## Common Patterns

### Paged list response (used by many admin list APIs)
{
  "content": [ ... ],
  "page": 0,
  "size": 20,
  "totalElements": 100,
  "totalPages": 5,
  "sortBy": "id",
  "sortDir": "asc"
}

### Common query params for admin list APIs
- page (number, default 0)
- size (number, default 20, max 200)
- sortBy (string, default id)
- sortDir (asc or desc, default asc)
- keyword (string, optional)
- active (boolean, optional)

---

## Auth APIs

### POST /api/auth/login
Request:
{
  "email": "string",
  "password": "string"
}
Response 200:
{
  "accessToken": "string",
  "tokenType": "string",
  "expiresInMs": 3600000,
  "userId": 1,
  "email": "string",
  "authorities": ["string"]
}

### POST /api/auth/change-password
Request:
{
  "currentPassword": "string",
  "newPassword": "string"
}
Response 204: no body

---

## Task APIs

### GET /api/tasks
Response 200: TaskDto[]

### GET /api/tasks/{id}
Response 200: TaskDto

### POST /api/tasks
Request: TaskDto
Response 200: TaskDto

### PUT /api/tasks/{id}
Request: TaskDto
Response 200: TaskDto

### DELETE /api/tasks/{id}
Response 204: no body

### TaskDto shape
{
  "id": 1,
  "taskNo": "string",
  "projectId": 1,
  "issueActionItem": "string",
  "description": "string",
  "priority": "string",
  "status": "string",
  "priorityId": 1,
  "statusId": 1,
  "categoryId": 1,
  "workflowStateId": 1,
  "categoryName": "string",
  "workflowStateName": "string",
  "ownerId": 1,
  "targetDate": "YYYY-MM-DD",
  "dateResolved": "YYYY-MM-DD",
  "createdBy": 1,
  "createdAt": "YYYY-MM-DDTHH:mm:ss",
  "updatedAt": "YYYY-MM-DDTHH:mm:ss"
}

---

## Project APIs

### GET /api/projects
Response 200: ProjectDto[]

### GET /api/projects/{id}
Response 200: ProjectDto

### POST /api/projects
Request: ProjectDto
Response 200: ProjectDto

### PUT /api/projects/{id}
Request: ProjectDto
Response 200: ProjectDto

### DELETE /api/projects/{id}
Response 204: no body

### ProjectDto shape
{
  "id": 1,
  "projectCode": "string",
  "projectName": "string",
  "description": "string",
  "active": true,
  "createdAt": "YYYY-MM-DDTHH:mm:ss"
}

---

## User APIs

### GET /api/users
Response 200: UserDto[]

### GET /api/users/{id}
Response 200: UserDto

### POST /api/users
Request: UserDto
Response 200: UserDto

### PUT /api/users/{id}
Request: UserDto
Response 200: UserDto

### DELETE /api/users/{id}
Response 204: no body

### GET /api/users/active
Response 200: UserDto[]

### UserDto shape
{
  "id": 1,
  "employeeId": "string",
  "fullName": "string",
  "email": "string",
  "role": "string",
  "active": true,
  "createdAt": "YYYY-MM-DDTHH:mm:ss",
  "updatedAt": "YYYY-MM-DDTHH:mm:ss"
}

---

## Comment APIs

### GET /api/tasks/{taskId}/comments
Response 200: TaskCommentDto[]

### POST /api/tasks/{taskId}/comments
Request: TaskCommentDto
Response 200: TaskCommentDto

### DELETE /api/comments/{commentId}
Response 204: no body

### TaskCommentDto shape
{
  "id": 1,
  "taskId": 1,
  "commentText": "string",
  "commentedBy": 1,
  "commentedAt": "YYYY-MM-DDTHH:mm:ss"
}

---

## Attachment APIs

### GET /api/attachments/task/{taskId}
Response 200: TaskAttachmentDto[]

### POST /api/attachments/task/{taskId}
Content-Type: multipart/form-data
Form fields:
- file (binary)
- uploadedBy (number, optional)
Response 200: TaskAttachmentDto

### GET /api/attachments/{attachmentId}/download
Response 200: binary file

### DELETE /api/attachments/{attachmentId}
Response 204: no body

### TaskAttachmentDto shape
{
  "id": 1,
  "taskId": 1,
  "fileName": "string",
  "fileType": "string",
  "filePath": "string",
  "uploadedBy": 1,
  "uploadedAt": "YYYY-MM-DDTHH:mm:ss"
}

---

## Notification APIs

### GET /api/notifications/user/{userId}
Response 200: NotificationDto[]

### GET /api/notifications/user/{userId}/unread
Response 200: NotificationDto[]

### PUT /api/notifications/{notificationId}/read
Response 200: no body

### PUT /api/notifications/user/{userId}/read-all
Response 200: no body

### POST /api/notifications
Request: NotificationDto
Response 200: NotificationDto

### NotificationDto shape
{
  "id": 1,
  "userId": 1,
  "taskId": 1,
  "title": "string",
  "message": "string",
  "notificationType": "string",
  "isRead": false,
  "createdAt": "YYYY-MM-DDTHH:mm:ss"
}

---

## Activity APIs

### GET /api/activity/task/{taskId}
Response 200: ActivityHistoryDto[]

### POST /api/activity
Request: ActivityHistoryDto
Response 200: ActivityHistoryDto

### ActivityHistoryDto shape
{
  "id": 1,
  "taskId": 1,
  "activityType": "string",
  "oldValue": "string",
  "newValue": "string",
  "performedBy": 1,
  "performedAt": "YYYY-MM-DDTHH:mm:ss"
}

---

## Dashboard APIs

### GET /api/dashboard/summary
Response 200: DashboardSummaryDto

### GET /api/dashboard/status
Response 200: Map<string, number>

### GET /api/dashboard/priority
Response 200: Map<string, number>

### GET /api/dashboard/workload
Response 200: Map<number, number>

### DashboardSummaryDto shape
{
  "totalTasks": 0,
  "openTasks": 0,
  "waitingTasks": 0,
  "inProgressTasks": 0,
  "blockedTasks": 0,
  "completedTasks": 0,
  "scheduledTasks": 0,
  "overdueTasks": 0,
  "highPriorityTasks": 0,
  "mediumPriorityTasks": 0,
  "lowPriorityTasks": 0
}

---

## Report APIs

### GET /api/reports/task-summary
### GET /api/reports/open-tasks
### GET /api/reports/completed-tasks
### GET /api/reports/priority
### GET /api/reports/owner-workload
Response 200: ReportDto

### ReportDto shape
{
  "reportName": "string",
  "totalCount": 0,
  "data": {
    "key": 0
  }
}

---

## Search APIs

### GET /api/search/tasks?keyword={keyword}
Response 200: TaskDto[]

### GET /api/search/projects?keyword={keyword}
Response 200: ProjectDto[]

### GET /api/search/global?keyword={keyword}
Response 200: {
  "tasks": TaskDto[],
  "projects": ProjectDto[]
}

---

## Admin Department APIs

### GET /api/admin/departments
Query: page,size,sortBy,sortDir,keyword,active
Response 200: paged DepartmentResponseDto

### GET /api/admin/departments/{id}
Response 200: DepartmentResponseDto

### POST /api/admin/departments
Request: DepartmentRequestDto
Response 200: DepartmentResponseDto

### PUT /api/admin/departments/{id}
Request: DepartmentRequestDto
Response 200: DepartmentResponseDto

### DELETE /api/admin/departments/{id}
Response 204: no body

### POST /api/admin/departments/assignments/projects
Request:
{
  "projectId": 1,
  "departmentId": 1
}
Response 200: ProjectDepartmentAssignmentResponseDto

### DELETE /api/admin/departments/assignments/projects/{projectId}/departments/{departmentId}
Response 204: no body

### GET /api/admin/departments/assignments/projects/{projectId}
Response 200: ProjectDepartmentAssignmentResponseDto[]

### GET /api/admin/departments/assignments/departments/{departmentId}
Response 200: ProjectDepartmentAssignmentResponseDto[]

### DepartmentResponseDto shape
{
  "id": 1,
  "departmentCode": "string",
  "departmentName": "string",
  "description": "string",
  "active": true,
  "createdAt": "YYYY-MM-DDTHH:mm:ss",
  "updatedAt": "YYYY-MM-DDTHH:mm:ss"
}

### ProjectDepartmentAssignmentResponseDto shape
{
  "projectId": 1,
  "departmentId": 1
}

---

## Admin Role APIs

### GET /api/admin/roles
Query: page,size,sortBy,sortDir,keyword,active
Response 200: paged RoleResponseDto

### GET /api/admin/roles/{id}
Response 200: RoleResponseDto

### POST /api/admin/roles
Request: RoleRequestDto
Response 200: RoleResponseDto

### PUT /api/admin/roles/{id}
Request: RoleRequestDto
Response 200: RoleResponseDto

### DELETE /api/admin/roles/{id}
Response 204: no body

### POST /api/admin/roles/assignments/users
Request:
{
  "userId": 1,
  "roleId": 1,
  "assignedBy": 1
}
Response 200: UserRoleAssignmentResponseDto

### DELETE /api/admin/roles/assignments/users/{userId}/roles/{roleId}
Response 204: no body

### GET /api/admin/roles/assignments/users/{userId}
Response 200: UserRoleAssignmentResponseDto[]

### POST /api/admin/roles/assignments/permissions
Request:
{
  "roleId": 1,
  "permissionId": 1,
  "grantedBy": 1
}
Response 200: RolePermissionAssignmentResponseDto

### DELETE /api/admin/roles/assignments/permissions/{roleId}/{permissionId}
Response 204: no body

### GET /api/admin/roles/assignments/permissions/{roleId}
Response 200: RolePermissionAssignmentResponseDto[]

### RoleResponseDto shape
{
  "id": 1,
  "roleKey": "string",
  "roleName": "string",
  "description": "string",
  "active": true,
  "systemRole": false,
  "createdAt": "YYYY-MM-DDTHH:mm:ss",
  "updatedAt": "YYYY-MM-DDTHH:mm:ss"
}

### UserRoleAssignmentResponseDto shape
{
  "userId": 1,
  "roleId": 1,
  "assignedBy": 1,
  "active": true,
  "assignedAt": "YYYY-MM-DDTHH:mm:ss"
}

### RolePermissionAssignmentResponseDto shape
{
  "roleId": 1,
  "permissionId": 1,
  "grantedBy": 1,
  "grantedAt": "YYYY-MM-DDTHH:mm:ss"
}

---

## Admin Permission APIs

### GET /api/admin/permissions
Query: page,size,sortBy,sortDir,keyword,module,active
Response 200: paged PermissionResponseDto

### GET /api/admin/permissions/{id}
Response 200: PermissionResponseDto

### POST /api/admin/permissions
Request: PermissionRequestDto
Response 200: PermissionResponseDto

### PUT /api/admin/permissions/{id}
Request: PermissionRequestDto
Response 200: PermissionResponseDto

### DELETE /api/admin/permissions/{id}
Response 204: no body

### PermissionResponseDto shape
{
  "id": 1,
  "permissionKey": "string",
  "permissionName": "string",
  "moduleName": "string",
  "description": "string",
  "active": true,
  "createdAt": "YYYY-MM-DDTHH:mm:ss",
  "updatedAt": "YYYY-MM-DDTHH:mm:ss"
}

---

## Admin Task Catalog APIs

### Statuses
- GET /api/admin/task-catalog/statuses
- GET /api/admin/task-catalog/statuses/{id}
- POST /api/admin/task-catalog/statuses
- PUT /api/admin/task-catalog/statuses/{id}
- DELETE /api/admin/task-catalog/statuses/{id}

### Priorities
- GET /api/admin/task-catalog/priorities
- GET /api/admin/task-catalog/priorities/{id}
- POST /api/admin/task-catalog/priorities
- PUT /api/admin/task-catalog/priorities/{id}
- DELETE /api/admin/task-catalog/priorities/{id}

### Categories
- GET /api/admin/task-catalog/categories
- GET /api/admin/task-catalog/categories/{id}
- POST /api/admin/task-catalog/categories
- PUT /api/admin/task-catalog/categories/{id}
- DELETE /api/admin/task-catalog/categories/{id}

All list endpoints use paged response wrapper.

### TaskStatusResponseDto shape
{
  "id": 1,
  "statusKey": "string",
  "statusName": "string",
  "description": "string",
  "displayOrder": 0,
  "colorCode": "string",
  "terminal": false,
  "active": true,
  "createdAt": "YYYY-MM-DDTHH:mm:ss",
  "updatedAt": "YYYY-MM-DDTHH:mm:ss"
}

### TaskPriorityResponseDto shape
{
  "id": 1,
  "priorityKey": "string",
  "priorityName": "string",
  "description": "string",
  "displayOrder": 0,
  "colorCode": "string",
  "active": true,
  "createdAt": "YYYY-MM-DDTHH:mm:ss",
  "updatedAt": "YYYY-MM-DDTHH:mm:ss"
}

### TaskCategoryResponseDto shape
{
  "id": 1,
  "categoryKey": "string",
  "categoryName": "string",
  "description": "string",
  "active": true,
  "createdAt": "YYYY-MM-DDTHH:mm:ss",
  "updatedAt": "YYYY-MM-DDTHH:mm:ss"
}

---

## Admin Workflow APIs

### Workflows
- GET /api/admin/workflows
- GET /api/admin/workflows/{id}
- POST /api/admin/workflows
- PUT /api/admin/workflows/{id}
- DELETE /api/admin/workflows/{id}

### Workflow States
- GET /api/admin/workflows/{workflowId}/states
- POST /api/admin/workflows/states
- PUT /api/admin/workflows/states/{id}

### Workflow Transitions
- GET /api/admin/workflows/{workflowId}/transitions
- POST /api/admin/workflows/transitions
- PUT /api/admin/workflows/transitions/{id}

### Transition Role Assignments
- POST /api/admin/workflows/transitions/roles
- DELETE /api/admin/workflows/transitions/roles/{transitionId}/{roleId}
- GET /api/admin/workflows/transitions/{transitionId}/roles

List endpoints use paged response wrapper.

### WorkflowDefinitionResponseDto shape
{
  "id": 1,
  "workflowKey": "string",
  "workflowName": "string",
  "entityType": "string",
  "description": "string",
  "active": true,
  "createdAt": "YYYY-MM-DDTHH:mm:ss",
  "updatedAt": "YYYY-MM-DDTHH:mm:ss"
}

### WorkflowStateResponseDto shape
{
  "id": 1,
  "workflowId": 1,
  "stateKey": "string",
  "stateName": "string",
  "description": "string",
  "displayOrder": 0,
  "initial": false,
  "terminal": false,
  "active": true,
  "createdAt": "YYYY-MM-DDTHH:mm:ss",
  "updatedAt": "YYYY-MM-DDTHH:mm:ss"
}

### WorkflowTransitionResponseDto shape
{
  "id": 1,
  "workflowId": 1,
  "fromStateId": 1,
  "toStateId": 1,
  "transitionKey": "string",
  "transitionName": "string",
  "requiresComment": false,
  "active": true,
  "createdAt": "YYYY-MM-DDTHH:mm:ss",
  "updatedAt": "YYYY-MM-DDTHH:mm:ss"
}

### WorkflowTransitionRoleAssignmentResponseDto shape
{
  "transitionId": 1,
  "roleId": 1
}
