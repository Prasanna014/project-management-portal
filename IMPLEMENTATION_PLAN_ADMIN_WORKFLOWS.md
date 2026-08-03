# Implementation Plan: Administration, Projects, Departments & Workflows
## ServiceNow-Style Portal — Phase Tracker

**Status Legend:** ⬜ Not Started | 🔄 In Progress | ✅ Done | ⛔ Blocked

---

## Phase 1 — Backend: Expose Workflow & FK Fields in DTOs
**Goal:** Make `ProjectDto` carry `workflowId`, `workflowName`, `departments`; sync frontend types.
**Status:** ✅ Done

| # | Task | File | Status |
|---|------|------|--------|
| 1.1 | Add `workflowId`, `workflowName`, `departments` to `ProjectDto` | `backend/.../dto/ProjectDto.java` | ✅ |
| 1.2 | Inject `ProjectDepartmentRepository`, `DepartmentRepository`, `WorkflowDefinitionRepository` | `backend/.../service/ProjectService.java` | ✅ |
| 1.3 | Update `mapToDto` to populate workflow name + departments list | `backend/.../service/ProjectService.java` | ✅ |
| 1.4 | Update `mapToEntity` + `updateProject` to persist `workflowId` | `backend/.../service/ProjectService.java` | ✅ |
| 1.5 | Backend `TaskDto` already has all FK fields — no change needed | `backend/.../dto/TaskDto.java` | ✅ |
| 1.6 | Update frontend `ProjectDto` type: add `workflowId`, `workflowName`, `departments` | `frontend/src/modules/projects/services/projectsApi.ts` | ✅ |
| 1.7 | Update frontend `TaskDto` type: add `statusId`, `priorityId`, `categoryId`, `workflowStateId`, `workflowStateName`, `categoryName`, `dateResolved`, `estimatedHours`, `loggedHours` | `frontend/src/modules/tasks/services/tasksApi.ts` | ✅ |

---

## Phase 2 — Backend: Workflow Transition Engine
**Goal:** Tasks move through workflow states via validated API calls (ServiceNow-style).
**Status:** ✅ Done

| # | Task | File | Status |
|---|------|------|--------|
| 2.1 | Create `WorkflowTransitionExecuteRequestDto` (transitionId, comment) | `backend/.../dto/WorkflowTransitionExecuteRequestDto.java` | ✅ |
| 2.2 | Create `WorkflowTransitionAvailableDto` (id, transitionKey, transitionName, toStateId, toStateName, requiresComment) | `backend/.../dto/WorkflowTransitionAvailableDto.java` | ✅ |
| 2.3 | Create `WorkflowEngineService` interface | `backend/.../service/WorkflowEngineService.java` | ✅ |
| 2.4 | Implement `getAvailableTransitions(taskId)` — filters by `from_state_id = task.workflowStateId` + active | `backend/.../service/impl/WorkflowEngineServiceImpl.java` | ✅ |
| 2.5 | Implement `executeTransition(taskId, transitionId, comment, performedBy)` — validate, persist, log to `activity_history`, save comment | `backend/.../service/impl/WorkflowEngineServiceImpl.java` | ✅ |
| 2.6 | Add `GET /api/tasks/{id}/workflow/transitions` endpoint | `backend/.../controller/TaskController.java` | ✅ |
| 2.7 | Add `POST /api/tasks/{id}/workflow/transition` endpoint | `backend/.../controller/TaskController.java` | ✅ |

---

## Phase 2A — Organization Module (Company Profile, Business Units, Locations, Time Zones, Holidays)
**Goal:** Super Admin can manage full organisation hierarchy: company details, business units, office locations, time zones, and holidays.
**Status:** ✅ Done

| # | Task | File | Status |
|---|------|------|--------|
| 2A.1 | Add `tracker.company_profile` table | `backend/src/main/resources/schema.sql` | ✅ |
| 2A.2 | Add `tracker.business_units` table (FK → departments) | `backend/src/main/resources/schema.sql` | ✅ |
| 2A.3 | Add `tracker.time_zones` table | `backend/src/main/resources/schema.sql` | ✅ |
| 2A.4 | Add `tracker.locations` table (FK → time_zones) | `backend/src/main/resources/schema.sql` | ✅ |
| 2A.5 | Add `tracker.holidays` table (FK → locations) | `backend/src/main/resources/schema.sql` | ✅ |
| 2A.6 | Create entity: `CompanyProfile.java` | `backend/.../entity/CompanyProfile.java` | ✅ |
| 2A.7 | Create entity: `BusinessUnit.java` | `backend/.../entity/BusinessUnit.java` | ✅ |
| 2A.8 | Create entity: `AppTimeZone.java` | `backend/.../entity/AppTimeZone.java` | ✅ |
| 2A.9 | Create entity: `OrgLocation.java` | `backend/.../entity/OrgLocation.java` | ✅ |
| 2A.10 | Create entity: `Holiday.java` | `backend/.../entity/Holiday.java` | ✅ |
| 2A.11 | Create repositories for all 5 entities | `backend/.../repository/` | ✅ |
| 2A.12 | Create DTOs: `CompanyProfileDto`, `BusinessUnitDto`, `AppTimeZoneDto`, `OrgLocationDto`, `HolidayDto` | `backend/.../dto/` | ✅ |
| 2A.13 | Create `OrganizationAdminService` interface | `backend/.../service/OrganizationAdminService.java` | ✅ |
| 2A.14 | Implement `OrganizationAdminServiceImpl` | `backend/.../service/impl/OrganizationAdminServiceImpl.java` | ✅ |
| 2A.15 | Create `OrganizationAdminController` at `/api/admin/organization` | `backend/.../controller/OrganizationAdminController.java` | ✅ |
| 2A.16 | Add org module specs to `adminModules.ts` (business-units, time-zones, locations, holidays) | `frontend/src/modules/administration/config/adminModules.ts` | ✅ |
| 2A.17 | Replace `organization` nav item with 5 enabled items in `navigation.ts` | `frontend/src/app/router/navigation.ts` | ✅ |
| 2A.18 | Create `CompanyProfilePanel.tsx` (singleton GET/PUT form) | `frontend/src/modules/administration/components/CompanyProfilePanel.tsx` | ✅ |
| 2A.19 | Route `company-profile` to `CompanyProfilePanel` in `AdministrationPage.tsx` | `frontend/src/modules/administration/pages/AdministrationPage.tsx` | ✅ |

---

## Phase 3 — Backend: Missing Admin Module Tables + APIs
**Goal:** Enable the 6 disabled navigation items (`project-members`, `labels`, `work-logs`, `audit-logs`).
**Status:** ⬜ Not Started

| # | Task | File | Status |
|---|------|------|--------|
| 3.1 | Add `tracker.project_members` table (project_id, user_id, role, active) | `backend/.../resources/schema.sql` | ⬜ |
| 3.2 | Add `tracker.labels` table (id, label_key, label_name, color_code, active) | `backend/.../resources/schema.sql` | ⬜ |
| 3.3 | Add `tracker.work_logs` table (id, task_id, user_id, hours_logged, log_date, notes) | `backend/.../resources/schema.sql` | ⬜ |
| 3.4 | Add `tracker.audit_logs` table (id, entity_type, entity_id, action, old_value, new_value, performed_by, performed_at) | `backend/.../resources/schema.sql` | ⬜ |
| 3.5 | Create `ProjectMember` entity + `ProjectMemberAdminController` (CRUD) | `backend/.../entity/` + `controller/` | ⬜ |
| 3.6 | Create `Label` entity + extend `TaskCatalogAdminController` | `backend/.../entity/` + `controller/` | ⬜ |
| 3.7 | Create `WorkLog` entity + `WorkLogController` | `backend/.../entity/` + `controller/` | ⬜ |
| 3.8 | Create `AuditLog` entity + `AuditLogController` (read-only) | `backend/.../entity/` + `controller/` | ⬜ |

---

## Phase 4 — Frontend: Admin UX — Smart Parent-Child Selectors
**Goal:** Replace raw numeric path-param text inputs with dropdowns that load parent records.
**Status:** ⬜ Not Started

| # | Task | File | Status |
|---|------|------|--------|
| 4.1 | Add optional `parentSelector` config to `AdminModuleSpec` type | `frontend/src/modules/administration/config/adminModules.ts` | ⬜ |
| 4.2 | Define `parentSelector` for: `workflow-states`, `workflow-transitions`, `project-departments`, `user-roles`, `role-permissions` | `frontend/src/modules/administration/config/adminModules.ts` | ⬜ |
| 4.3 | Build `ParentSelectorBar` component — fetches parent list, renders `<Select>`, fills path param | `frontend/src/modules/administration/components/ParentSelectorBar.tsx` | ⬜ |
| 4.4 | Integrate `ParentSelectorBar` into `AdminModuleWorkspace` when `parentSelector` is defined | `frontend/src/modules/administration/components/AdminModuleWorkspace.tsx` | ⬜ |

---

## Phase 5 — Frontend: Projects Module Enhancement
**Goal:** Projects page supports workflow assignment, edit, delete, and department chips.
**Status:** ⬜ Not Started

| # | Task | File | Status |
|---|------|------|--------|
| 5.1 | Add `updateProject`, `deleteProject` to projects API service | `frontend/src/modules/projects/services/projectsApi.ts` | ⬜ |
| 5.2 | Add workflow dropdown to Create Project dialog (fetches `/api/admin/workflows`) | `frontend/src/modules/projects/pages/ProjectsPage.tsx` | ⬜ |
| 5.3 | Add Edit Project dialog (pre-populate form, PUT on submit) | `frontend/src/modules/projects/pages/ProjectsPage.tsx` | ⬜ |
| 5.4 | Add Delete Project button + confirm dialog | `frontend/src/modules/projects/pages/ProjectsPage.tsx` | ⬜ |
| 5.5 | Show assigned workflow name as a `<Chip>` column in projects table | `frontend/src/modules/projects/pages/ProjectsPage.tsx` | ⬜ |
| 5.6 | Create `ProjectDetailPage` at `/projects/:id` (info + departments + tasks summary) | `frontend/src/pages/ProjectDetailPage.tsx` | ⬜ |
| 5.7 | Register `/projects/:id` route in `AppRouter.tsx` | `frontend/src/app/router/AppRouter.tsx` | ⬜ |

---

## Phase 6 — Frontend: Task Workflow State Machine (ServiceNow-style)
**Goal:** Task detail page shows current state badge + action transition buttons.
**Status:** ⬜ Not Started

| # | Task | File | Status |
|---|------|------|--------|
| 6.1 | Add `fetchTaskTransitions(taskId)` and `executeTaskTransition(taskId, transitionId, comment)` | `frontend/src/modules/tasks/services/tasksApi.ts` | ⬜ |
| 6.2 | Show `workflowStateName` badge (colored chip) on task detail | `frontend/src/pages/TaskDetailsPage.tsx` | ⬜ |
| 6.3 | Query available transitions on task detail load | `frontend/src/pages/TaskDetailsPage.tsx` | ⬜ |
| 6.4 | Render each available transition as an action `<Button>` | `frontend/src/pages/TaskDetailsPage.tsx` | ⬜ |
| 6.5 | If `requiresComment=true`: show comment dialog before executing transition | `frontend/src/pages/TaskDetailsPage.tsx` | ⬜ |
| 6.6 | On transition success: invalidate task + transitions queries, show snackbar | `frontend/src/pages/TaskDetailsPage.tsx` | ⬜ |

---

## Phase 7 — Frontend: Workflow Visual Designer (Admin)
**Goal:** Admin can visually see and manage states/transitions for a workflow.
**Status:** ⬜ Not Started

| # | Task | File | Status |
|---|------|------|--------|
| 7.1 | Create `WorkflowDesignerPage` component | `frontend/src/modules/administration/pages/WorkflowDesignerPage.tsx` | ⬜ |
| 7.2 | Register `/administration/workflows/:workflowId/designer` route | `frontend/src/app/router/AppRouter.tsx` | ⬜ |
| 7.3 | Left panel: states list ordered by `displayOrder` — Initial/Terminal badges, inline edit | `WorkflowDesignerPage.tsx` | ⬜ |
| 7.4 | Right panel: transitions table with from→to, name, `requiresComment`, active toggle | `WorkflowDesignerPage.tsx` | ⬜ |
| 7.5 | "Add State" button → inline form (POST `/api/admin/workflows/states`) | `WorkflowDesignerPage.tsx` | ⬜ |
| 7.6 | "Add Transition" button → from/to dropdowns (POST `/api/admin/workflows/transitions`) | `WorkflowDesignerPage.tsx` | ⬜ |
| 7.7 | "Open Designer →" button on workflows table row | `frontend/src/modules/administration/components/AdminModuleWorkspace.tsx` | ⬜ |

---

## Phase 8 — Frontend: Enable Disabled Admin Modules
**Goal:** Project Members, Labels, Work Logs, Audit Logs appear in Administration nav.
**Depends on:** Phase 3 complete
**Status:** ⬜ Not Started

| # | Task | File | Status |
|---|------|------|--------|
| 8.1 | Add `adminModuleSpecs` entries for `project-members`, `labels`, `work-logs`, `audit-logs` | `frontend/src/modules/administration/config/adminModules.ts` | ⬜ |
| 8.2 | Flip `available: false → true` for those 4 modules | `frontend/src/app/router/navigation.ts` | ⬜ |

---

## End-to-End Verification Checklist

- [ ] Create a Workflow → add states (Open, In Progress, Resolved, Closed) → add transitions
- [ ] Create a Project → assign the workflow → `workflowId` returned in project response
- [ ] Create a Task → open task detail → workflow state badge shows initial state
- [ ] Click "Start Progress" transition → state updates → activity history entry logged
- [ ] `requiresComment=true` transition → comment dialog appears → comment saved
- [ ] Admin → Workflow States → parent workflow dropdown populates → states listed
- [ ] Admin → Project Departments → project dropdown works → departments assignable
- [ ] Project Members module visible and functional (after Phase 3 + 8)

---

## Scope Boundaries
- **Included:** Projects, Departments, Workflows, Workflow States/Transitions, Task State Machine, Project Members, Labels, Work Logs, Audit Logs
- **Excluded from this plan:** Email notifications on transition, SLA timers, Kanban board drag-and-drop
- **Unchanged:** Roles, Permissions, Task Statuses/Priorities/Categories, Notifications, Activity History
