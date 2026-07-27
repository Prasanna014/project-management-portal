# Step 3 - Backend Module Matrix for Frontend

This matrix is derived from implemented backend controllers, DTOs, services, entities, and security behavior.

Reference files:
- API contract: [API_CONTRACTS_FOR_UI.md](API_CONTRACTS_FOR_UI.md)
- Step 1 analysis: [BACKEND_ANALYSIS_FOR_FRONTEND.md](BACKEND_ANALYSIS_FOR_FRONTEND.md)

## 1) Authentication
- Module status: Available
- CRUD APIs:
  - Create session: POST /api/auth/login
  - Update credential: POST /api/auth/change-password
- Search APIs: None
- Pagination APIs: None
- Filter APIs: None
- Validation rules:
  - login email required and valid
  - login password required
  - changePassword currentPassword required
  - changePassword newPassword required and service enforces min length 8
- Relationships:
  - User credentials resolved via users.password_hash
  - Authorities resolved via user_roles -> roles -> role_permissions -> permissions

## 2) Organization
- Module status: Missing as dedicated module
- CRUD APIs: Not available
- Search APIs: Not available
- Pagination APIs: Not available
- Filter APIs: Not available
- Validation rules: N/A
- Relationships:
  - Closest available concept is departments

## 3) Departments
- Module status: Available
- CRUD APIs:
  - GET /api/admin/departments
  - GET /api/admin/departments/{id}
  - POST /api/admin/departments
  - PUT /api/admin/departments/{id}
  - DELETE /api/admin/departments/{id}
- Search APIs:
  - keyword param on list endpoint
- Pagination APIs:
  - list endpoint returns paged wrapper
- Filter APIs:
  - active filter
  - sortBy/sortDir
- Validation rules:
  - departmentCode required, max 100
  - departmentName required, max 255
- Relationships:
  - users.department_id -> departments.id
  - project_departments.department_id -> departments.id

## 4) Projects
- Module status: Available
- CRUD APIs:
  - GET /api/projects
  - GET /api/projects/{id}
  - POST /api/projects
  - PUT /api/projects/{id}
  - DELETE /api/projects/{id}
- Search APIs:
  - GET /api/search/projects?keyword=
- Pagination APIs:
  - not on core /api/projects list
- Filter APIs:
  - via global/search keyword endpoints only
- Validation rules:
  - projectCode required
  - projectName required
- Relationships:
  - tasks.project_id -> projects.id
  - project_departments.project_id -> projects.id
  - projects.workflow_id -> workflow_definitions.id

## 5) Users
- Module status: Available
- CRUD APIs:
  - GET /api/users
  - GET /api/users/{id}
  - POST /api/users
  - PUT /api/users/{id}
  - DELETE /api/users/{id}
  - GET /api/users/active
- Search APIs:
  - no dedicated user search endpoint
- Pagination APIs:
  - not on /api/users list
- Filter APIs:
  - active users endpoint only
- Validation rules:
  - employeeId required
  - fullName required
  - email required and valid
- Relationships:
  - tasks.owner_id -> users.id
  - task_comments.commented_by -> users.id
  - task_attachments.uploaded_by -> users.id
  - notifications.user_id -> users.id
  - user_roles.user_id -> users.id
  - users.department_id -> departments.id

## 6) Roles
- Module status: Available
- CRUD APIs:
  - GET /api/admin/roles
  - GET /api/admin/roles/{id}
  - POST /api/admin/roles
  - PUT /api/admin/roles/{id}
  - DELETE /api/admin/roles/{id}
- Search APIs:
  - keyword on list endpoint
- Pagination APIs:
  - list endpoint returns paged wrapper
- Filter APIs:
  - active filter
  - sortBy/sortDir
- Validation rules:
  - roleKey required, max 100
  - roleName required, max 255
- Relationships:
  - user_roles.role_id -> roles.id
  - role_permissions.role_id -> roles.id
  - workflow_transition_roles.role_id -> roles.id

## 7) Permissions
- Module status: Available
- CRUD APIs:
  - GET /api/admin/permissions
  - GET /api/admin/permissions/{id}
  - POST /api/admin/permissions
  - PUT /api/admin/permissions/{id}
  - DELETE /api/admin/permissions/{id}
- Search APIs:
  - keyword on list endpoint
- Pagination APIs:
  - list endpoint returns paged wrapper
- Filter APIs:
  - module filter
  - active filter
  - sortBy/sortDir
- Validation rules:
  - permissionKey required, max 150
  - permissionName required, max 255
  - moduleName max 100
- Relationships:
  - role_permissions.permission_id -> permissions.id
  - api_permission_rules.permission_id -> permissions.id

## 8) User Roles
- Module status: Available
- CRUD APIs:
  - Assign: POST /api/admin/roles/assignments/users
  - Remove: DELETE /api/admin/roles/assignments/users/{userId}/roles/{roleId}
  - List by user: GET /api/admin/roles/assignments/users/{userId}
- Search APIs: None
- Pagination APIs: None
- Filter APIs: None
- Validation rules:
  - userId required
  - roleId required
- Relationships:
  - junction user_roles(user_id, role_id)

## 9) Role Permissions
- Module status: Available
- CRUD APIs:
  - Assign: POST /api/admin/roles/assignments/permissions
  - Remove: DELETE /api/admin/roles/assignments/permissions/{roleId}/{permissionId}
  - List by role: GET /api/admin/roles/assignments/permissions/{roleId}
- Search APIs: None
- Pagination APIs: None
- Filter APIs: None
- Validation rules:
  - roleId required
  - permissionId required
- Relationships:
  - junction role_permissions(role_id, permission_id)

## 10) Project Members
- Module status: Missing
- CRUD APIs: Not available
- Search APIs: Not available
- Pagination APIs: Not available
- Filter APIs: Not available
- Validation rules: N/A
- Relationships:
  - project_departments exists, but no project-user membership API

## 11) Workflow Definitions
- Module status: Available
- CRUD APIs:
  - GET /api/admin/workflows
  - GET /api/admin/workflows/{id}
  - POST /api/admin/workflows
  - PUT /api/admin/workflows/{id}
  - DELETE /api/admin/workflows/{id}
- Search APIs:
  - keyword on list endpoint
- Pagination APIs:
  - list endpoint returns paged wrapper
- Filter APIs:
  - entityType
  - active
  - sortBy/sortDir
- Validation rules:
  - workflowKey required, max 100
  - workflowName required, max 255
  - entityType required, max 100
- Relationships:
  - workflow_states.workflow_id -> workflow_definitions.id
  - workflow_transitions.workflow_id -> workflow_definitions.id
  - projects.workflow_id -> workflow_definitions.id

## 12) Workflow Status (States)
- Module status: Available
- CRUD APIs:
  - List by workflow: GET /api/admin/workflows/{workflowId}/states
  - Create: POST /api/admin/workflows/states
  - Update: PUT /api/admin/workflows/states/{id}
- Search APIs:
  - keyword on list endpoint
- Pagination APIs:
  - list endpoint returns paged wrapper
- Filter APIs:
  - active
  - sortBy/sortDir
- Validation rules:
  - workflowId required
  - stateKey required, max 100
  - stateName required, max 255
- Relationships:
  - workflow_states.workflow_id -> workflow_definitions.id
  - tasks.workflow_state_id -> workflow_states.id

## 13) Workflow Transitions
- Module status: Available
- CRUD APIs:
  - List: GET /api/admin/workflows/{workflowId}/transitions
  - Create: POST /api/admin/workflows/transitions
  - Update: PUT /api/admin/workflows/transitions/{id}
- Search APIs:
  - keyword on list endpoint
- Pagination APIs:
  - list endpoint returns paged wrapper
- Filter APIs:
  - fromStateId
  - active
  - sortBy/sortDir
- Validation rules:
  - workflowId required
  - fromStateId required
  - toStateId required
  - transitionKey required, max 100
  - transitionName required, max 255
- Relationships:
  - workflow_transitions.from_state_id -> workflow_states.id
  - workflow_transitions.to_state_id -> workflow_states.id

## 14) Categories
- Module status: Available
- CRUD APIs:
  - GET /api/admin/task-catalog/categories
  - GET /api/admin/task-catalog/categories/{id}
  - POST /api/admin/task-catalog/categories
  - PUT /api/admin/task-catalog/categories/{id}
  - DELETE /api/admin/task-catalog/categories/{id}
- Search APIs:
  - keyword on list endpoint
- Pagination APIs:
  - list endpoint returns paged wrapper
- Filter APIs:
  - active
  - sortBy/sortDir
- Validation rules:
  - categoryKey required, max 100
  - categoryName required, max 255
- Relationships:
  - tasks.category_id -> task_categories.id

## 15) Sub Categories
- Module status: Missing
- CRUD APIs: Not available
- Search APIs: Not available
- Pagination APIs: Not available
- Filter APIs: Not available
- Validation rules: N/A
- Relationships: N/A

## 16) Priorities
- Module status: Available
- CRUD APIs:
  - GET /api/admin/task-catalog/priorities
  - GET /api/admin/task-catalog/priorities/{id}
  - POST /api/admin/task-catalog/priorities
  - PUT /api/admin/task-catalog/priorities/{id}
  - DELETE /api/admin/task-catalog/priorities/{id}
- Search APIs:
  - keyword on list endpoint
- Pagination APIs:
  - list endpoint returns paged wrapper
- Filter APIs:
  - active
  - sortBy/sortDir
- Validation rules:
  - priorityKey required, max 100
  - priorityName required, max 255
- Relationships:
  - tasks.priority_id -> task_priorities.id
  - tasks.priority (legacy text) retained for backward compatibility

## 17) Labels
- Module status: Missing
- CRUD APIs: Not available
- Search APIs: Not available
- Pagination APIs: Not available
- Filter APIs: Not available
- Validation rules: N/A
- Relationships: N/A

## 18) Task Status Catalog
- Module status: Available
- CRUD APIs:
  - GET /api/admin/task-catalog/statuses
  - GET /api/admin/task-catalog/statuses/{id}
  - POST /api/admin/task-catalog/statuses
  - PUT /api/admin/task-catalog/statuses/{id}
  - DELETE /api/admin/task-catalog/statuses/{id}
- Search APIs:
  - keyword on list endpoint
- Pagination APIs:
  - list endpoint returns paged wrapper
- Filter APIs:
  - active
  - sortBy/sortDir
- Validation rules:
  - statusKey required, max 100
  - statusName required, max 255
- Relationships:
  - tasks.status_id -> task_statuses.id
  - tasks.status (legacy text) retained for backward compatibility

## 19) Tasks
- Module status: Available
- CRUD APIs:
  - GET /api/tasks
  - GET /api/tasks/{id}
  - POST /api/tasks
  - PUT /api/tasks/{id}
  - DELETE /api/tasks/{id}
- Search APIs:
  - GET /api/search/tasks?keyword=
- Pagination APIs:
  - not on /api/tasks list
- Filter APIs:
  - keyword search endpoint
- Validation rules:
  - taskNo required
  - projectId required
  - issueActionItem required
- Relationships:
  - project_id -> projects
  - owner_id -> users
  - status_id -> task_statuses
  - priority_id -> task_priorities
  - category_id -> task_categories
  - workflow_state_id -> workflow_states

## 20) Comments
- Module status: Available
- CRUD APIs:
  - GET /api/tasks/{taskId}/comments
  - POST /api/tasks/{taskId}/comments
  - DELETE /api/comments/{commentId}
- Search APIs: None
- Pagination APIs: None
- Filter APIs: taskId path filter
- Validation rules:
  - commentText required
  - commentedBy required
- Relationships:
  - task_comments.task_id -> tasks.id
  - task_comments.commented_by -> users.id

## 21) Attachments
- Module status: Available
- CRUD APIs:
  - GET /api/attachments/task/{taskId}
  - POST /api/attachments/task/{taskId} (multipart)
  - GET /api/attachments/{attachmentId}/download
  - DELETE /api/attachments/{attachmentId}
- Search APIs: None
- Pagination APIs: None
- Filter APIs: taskId path filter
- Validation rules:
  - file upload required on POST
- Relationships:
  - task_attachments.task_id -> tasks.id
  - task_attachments.uploaded_by -> users.id

## 22) Notifications
- Module status: Available (partial)
- CRUD APIs:
  - GET /api/notifications/user/{userId}
  - GET /api/notifications/user/{userId}/unread
  - PUT /api/notifications/{notificationId}/read
  - PUT /api/notifications/user/{userId}/read-all
  - POST /api/notifications
- Search APIs: None
- Pagination APIs: None
- Filter APIs:
  - unread variant endpoint
  - userId path filter
- Validation rules:
  - userId required
  - title required
- Relationships:
  - notifications.user_id -> users.id
  - notifications.task_id -> tasks.id
- Missing requested behavior:
  - delete notification API not available

## 23) Activity History
- Module status: Available
- CRUD APIs:
  - GET /api/activity/task/{taskId}
  - POST /api/activity
- Search APIs: None
- Pagination APIs: None
- Filter APIs: taskId path filter
- Validation rules:
  - taskId required
  - activityType required
- Relationships:
  - activity_history.task_id -> tasks.id
  - activity_history.performed_by -> users.id

## 24) Work Logs
- Module status: Missing
- CRUD APIs: Not available
- Search APIs: Not available
- Pagination APIs: Not available
- Filter APIs: Not available
- Validation rules: N/A
- Relationships: N/A

## 25) Audit Logs
- Module status: Missing
- CRUD APIs: Not available
- Search APIs: Not available
- Pagination APIs: Not available
- Filter APIs: Not available
- Validation rules: N/A
- Relationships: N/A

## 26) Dashboard
- Module status: Available
- CRUD APIs:
  - GET /api/dashboard/summary
  - GET /api/dashboard/status
  - GET /api/dashboard/priority
  - GET /api/dashboard/workload
- Search APIs: None
- Pagination APIs: None
- Filter APIs: None
- Validation rules: N/A (read endpoints)
- Relationships:
  - derived from task/project/user aggregates

## 27) Reports
- Module status: Available
- CRUD APIs:
  - GET /api/reports/task-summary
  - GET /api/reports/open-tasks
  - GET /api/reports/completed-tasks
  - GET /api/reports/priority
  - GET /api/reports/owner-workload
- Search APIs: None
- Pagination APIs: None
- Filter APIs: None
- Validation rules: N/A (read endpoints)
- Relationships:
  - derived aggregate reports from domain data

## 28) Settings (Company/Application/Theme/Security)
- Module status: Missing as API module
- CRUD APIs: Not available
- Search APIs: Not available
- Pagination APIs: Not available
- Filter APIs: Not available
- Validation rules: N/A
- Relationships: N/A

---

## Permission and Access Notes for Frontend
- Frontend must not hardcode role names.
- Access should rely on authority keys returned at login and endpoint behavior.
- Admin endpoints are additionally controlled by DB rules in api_permission_rules.

## Step 3 Conclusion
- Frontend can safely implement modules marked Available.
- Modules marked Missing require backend implementation before corresponding UI can be functional.
