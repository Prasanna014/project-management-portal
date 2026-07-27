# Backend Analysis for Frontend Generation (Step 1)

## Scope Reviewed
- Controllers
- Request/Response DTOs
- Service interfaces and implementations
- Entity mappings and relationships
- Validation rules
- Security configuration
- Swagger/OpenAPI availability
- API endpoints
- Pagination and filtering support
- Authentication and permission model

## Files Reviewed
- backend controllers: see folder [backend/src/main/java/com/company/projectmanagement/controller](backend/src/main/java/com/company/projectmanagement/controller)
- DTOs: see folder [backend/src/main/java/com/company/projectmanagement/dto](backend/src/main/java/com/company/projectmanagement/dto)
- services: see folder [backend/src/main/java/com/company/projectmanagement/service](backend/src/main/java/com/company/projectmanagement/service)
- entity model: see folder [backend/src/main/java/com/company/projectmanagement/entity](backend/src/main/java/com/company/projectmanagement/entity)
- security config: [backend/src/main/java/com/company/projectmanagement/config/SecurityConfig.java](backend/src/main/java/com/company/projectmanagement/config/SecurityConfig.java)
- auth service: [backend/src/main/java/com/company/projectmanagement/service/impl/AuthServiceImpl.java](backend/src/main/java/com/company/projectmanagement/service/impl/AuthServiceImpl.java)
- authz service: [backend/src/main/java/com/company/projectmanagement/security/ApiPermissionAuthorizationService.java](backend/src/main/java/com/company/projectmanagement/security/ApiPermissionAuthorizationService.java)
- user details service: [backend/src/main/java/com/company/projectmanagement/security/DatabaseUserDetailsService.java](backend/src/main/java/com/company/projectmanagement/security/DatabaseUserDetailsService.java)
- app config: [backend/src/main/resources/application.yml](backend/src/main/resources/application.yml)

## API Source of Truth for UI
- Complete API + response contract document: [API_CONTRACTS_FOR_UI.md](API_CONTRACTS_FOR_UI.md)

## Implemented Backend Modules (Available for UI)
1. Authentication
2. Users
3. Projects
4. Tasks
5. Task Comments
6. Task Attachments
7. Notifications
8. Activity History
9. Dashboard
10. Reports
11. Search
12. Departments (Admin)
13. Roles (Admin)
14. Permissions (Admin)
15. User-Role assignments (Admin)
16. Role-Permission assignments (Admin)
17. Project-Department assignments (Admin)
18. Task Catalog (Statuses, Priorities, Categories)
19. Workflow (Definitions, States, Transitions, Transition-Role assignments)

## Authentication and Security
- JWT authentication is active.
- Public endpoints:
  - POST /api/auth/login
  - Swagger docs endpoints
- All other endpoints require authentication.
- Permission model is DB-driven:
  - user -> user_roles -> roles -> role_permissions -> permissions
  - endpoint access rules are in api_permission_rules table
  - enforced by matching method + path pattern
- Admin routes without configured permission rules are denied by design.

## Validation Rules
- Validation is primarily via DTO annotations (@NotBlank, @NotNull, @Email, @Size, @Min, @Max).
- Most request DTOs enforce required keys, names, and IDs.
- Password change validation includes service-level minimum length and current password verification.

## Pagination, Filtering, Sorting
- Standard paged response shape for admin list APIs:
  - content
  - page
  - size
  - totalElements
  - totalPages
  - sortBy
  - sortDir
- Common query params supported on admin lists:
  - page, size, sortBy, sortDir, keyword, active
- Some modules have extra filters:
  - permissions: module
  - workflows: entityType
  - transitions: fromStateId

## Entity Relationship Highlights
- Task links to Project and optional status/priority/category/workflowState IDs.
- User optionally links to Department.
- Project optionally links to WorkflowDefinition.
- Join entities implemented for:
  - user_roles
  - role_permissions
  - project_departments
  - workflow_transition_roles
- Workflow model hierarchy:
  - workflow_definitions -> workflow_states -> workflow_transitions

## Swagger / OpenAPI
- springdoc is enabled.
- API docs endpoint: /v3/api-docs
- Swagger UI path: /swagger-ui.html

## Gap Analysis Against Requested Enterprise UI Scope

### Supported directly by backend
- Auth (login, change password)
- Departments CRUD
- Projects CRUD
- Users CRUD + active list
- Roles CRUD + assignments
- Permissions CRUD + assignments
- Workflow and workflow status/state management
- Categories and priorities (task catalog)
- Tasks + comments + attachments + activity
- Notifications (view and mark-read)
- Dashboard and reports

### Missing or not exposed as dedicated APIs (cannot be generated without backend additions)
1. Organization module (separate organization API not found)
2. Project Members module (no user-project membership API)
3. Sub Categories module (only categories exist)
4. Labels module (not found)
5. Work Logs module (not found)
6. Audit Logs module (not found)
7. User reset password admin API (not found; only authenticated change-password exists)
8. User-project assignment API (not found)
9. Notification delete API (not found; read + create available)
10. Settings APIs for company/application/theme/security (not found)

## Frontend Generation Constraints (Important)
- Do not invent missing endpoints.
- Build only from available APIs listed in [API_CONTRACTS_FOR_UI.md](API_CONTRACTS_FOR_UI.md).
- For missing modules, UI should show "Not available in backend" or hide module until backend support is added.

## Step 1 Completion
- Backend has been analyzed.
- API contracts have been documented.
- Missing modules were identified explicitly.
