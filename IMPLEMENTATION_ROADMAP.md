# Enterprise Project Management Portal — Implementation Roadmap

> **Date:** 2026-08-03  
> **Author:** Senior Architect Review  
> **Purpose:** Track everything remaining to make this portal production-grade and enterprise-ready.

---

## 1. Current State Snapshot

### ✅ Backend — Fully Implemented (APIs + DB)
| Domain | Entities / Services | Controllers |
|--------|--------------------|-----------:|
| Organization | CompanyProfile, Department, BusinessUnit, Location, TimeZone, Holiday | OrganizationAdminController, DepartmentAdminController |
| Access Control | User, Role, Permission, UserRole, RolePermission, ApiPermissionRule | UserController, RoleAdminController, PermissionAdminController |
| Task Catalog | TaskStatus, TaskPriority, TaskCategory | TaskCatalogAdminController |
| Workflows | WorkflowDefinition, WorkflowState, WorkflowTransition, WorkflowTransitionRole | WorkflowAdminController, WorkflowEngineService |
| Projects | Project, ProjectMember, ProjectDepartment | ProjectController, ProjectMemberController |
| Tasks | Task, TaskComment, TaskAttachment | TaskController, TaskCommentController, AttachmentController |
| System | Notification, ActivityHistory, AuditLog, WorkLog | NotificationController, ActivityController, AuditLogController |
| Auth | JWT, SecurityUserPrincipal, DatabaseUserDetailsService | AuthController |
| Reporting | ReportService | ReportController |
| Search | SearchService | SearchController |
| Email | EmailService | — (no REST endpoint yet) |

### ✅ Frontend — New TypeScript App Shell (src/app, src/modules)
| Module | Page | Status |
|--------|------|--------|
| Auth | LoginPage.tsx | ✅ Done |
| Dashboard | DashboardPage.tsx | ✅ Exists (basic) |
| Workspace | WorkspacePage.tsx | ✅ Exists (basic) |
| Projects | ProjectsPage.tsx | ✅ Exists (basic) |
| Tasks | TasksPage.tsx | ✅ Exists (basic) |
| Reports | ReportsPage.tsx | ✅ Exists (basic) |
| Administration | AdministrationPage.tsx + 9 dedicated panels | ✅ Done |
| Settings | SettingsPage.tsx | ✅ Exists (placeholder) |

### ⚠️ Frontend — Legacy JSX Pages (src/pages) — NOT integrated into new shell
| File | Gap |
|------|-----|
| `CreateTaskPage.jsx` | Not using JWT auth, old routing |
| `TaskDetailsPage.jsx` | Not using JWT auth, old routing |
| `DashboardPage.jsx` | Duplicate of module version |
| `ProjectPage.jsx` | Duplicate of module version |
| `UsersPage.jsx` | Duplicate of module version |
| `TasksPage.jsx` (old) | Duplicate of module version |
| `CalenderPage.jsx` | No module equivalent exists |
| `ReportsPage.jsx` | Duplicate of module version |
| `SearchPage.jsx` | No module equivalent exists |
| `NotificationsPage.jsx` | No module equivalent exists |

---

## 2. Immediate Gaps — Must Fix Before Any New Features

### P0 — Critical (App Won't Work Properly Without These)

- [ ] **Migrate CreateTaskPage to TypeScript module**  
  Move `src/pages/CreateTaskPage.jsx` → `src/modules/tasks/pages/CreateTaskPage.tsx`  
  Wire into `AppRouter.tsx`. Use `useAuth()` hook for `createdBy`/`ownerId`.

- [ ] **Migrate TaskDetailsPage to TypeScript module**  
  Move `src/pages/TaskDetailsPage.jsx` → `src/modules/tasks/pages/TaskDetailsPage.tsx`  
  Add proper permission checks (`hasAnyPermission`). Remove hard-coded `VITE_DEFAULT_USER_ID`.

- [ ] **Remove VITE_DEFAULT_USER_ID bypass**  
  All pages currently use `Number(import.meta.env.VITE_DEFAULT_USER_ID || 1)` instead of the logged-in user. Replace with `useAuth().currentUser.id` everywhere.

- [ ] **Add routes for missing pages**  
  `AppRouter.tsx` is missing: `/search`, `/notifications`, `/calendar`.

- [ ] **Task Status / Priority driven by DB, not hardcoded strings**  
  `TasksPage`, `CreateTaskPage`, `TaskDetailsPage` all hardcode `"Open"`, `"High"` etc.  
  These must load from `/admin/task-statuses` and `/admin/task-priorities` at runtime.

---

## 3. Module-Level Gaps — Existing Pages Need Completion

### 3.1 Dashboard Module
- [ ] Connect to real `/api/dashboard` endpoint (currently may be mock data)
- [ ] Widget: Tasks by Status (pie / doughnut chart)
- [ ] Widget: Tasks by Priority (bar chart)
- [ ] Widget: Overdue Tasks count card
- [ ] Widget: My Open Tasks list
- [ ] Widget: Recent Activity feed (from ActivityHistory)
- [ ] Widget: Projects summary (count, active vs inactive)
- [ ] Date range filter for all widgets
- [ ] Refresh button with last-updated timestamp

### 3.2 Workspace Module
- [ ] Per-project switcher that filters all widgets to selected project
- [ ] "My Tasks" board with drag-and-drop status lanes (Kanban)
- [ ] Quick-create task inline from workspace
- [ ] Pinned / Starred tasks section
- [ ] Notifications bell count badge

### 3.3 Projects Module
- [ ] Project detail page (click a project → open detail)
- [ ] Edit project (currently no inline edit)
- [ ] Deactivate / archive project
- [ ] Project health metrics card (open tasks, overdue, completion %)
- [ ] Members tab on project detail
- [ ] Linked departments tab on project detail

### 3.4 Tasks Module
- [ ] **Kanban board view** toggle (List ↔ Board)
- [ ] **Inline quick-edit** row (click status chip or priority chip to change without opening detail)
- [ ] Bulk selection + bulk actions (assign, change status, delete)
- [ ] Advanced filter panel: status multi-select, priority multi-select, owner multi-select, date range, project multi-select
- [ ] Sort by any column
- [ ] Column visibility toggle
- [ ] Saved filter presets (save current filter set with a name)
- [ ] Export to CSV / Excel
- [ ] Pagination or infinite scroll (currently limited)

### 3.5 Task Detail Page
- [ ] **Edit mode** — full inline form edit (currently Change Status / Reassign only)
- [ ] **Sub-tasks** — create child tasks linked to parent
- [ ] **Task Dependencies** — blocks / blocked-by relationships
- [ ] **Watchers** — add/remove watchers; they receive notifications
- [ ] **@mention in comments** — `@username` triggers notification
- [ ] **Rich text in description & comments** (markdown or WYSIWYG)
- [ ] **File attachment upload** from task detail (drag-drop)
- [ ] **Time Tracking** — log work hours against task (WorkLog already in DB)
- [ ] **Workflow-driven status changes** — use WorkflowEngine transitions, not free-text status
- [ ] **Activity timeline** — all changes (field edits, comment adds, status changes) in chronological feed
- [ ] **Related Tasks** tab actually wired (currently shows "No related tests")
- [ ] **Print / Share** link that generates a shareable URL or PDF

### 3.6 Reports Module
- [ ] Report type selector (Tasks by Status, Tasks by Owner, Overdue, etc.)
- [ ] Date range filter
- [ ] Project filter
- [ ] Charts (recharts / nivo — bar, pie, line trend)
- [ ] Export report to CSV / PDF
- [ ] Scheduled report delivery via email (leverages EmailService)
- [ ] Burndown chart (tasks closed per day vs remaining)
- [ ] Workload report (tasks per user)

### 3.7 Search Module (missing entirely)
- [ ] Create `src/modules/search/pages/SearchPage.tsx`
- [ ] Global search bar in AppShell header (already has icon)
- [ ] Full-text search across Tasks, Projects, Comments
- [ ] Filterable results by entity type
- [ ] Keyboard shortcut `Ctrl+K` to open search overlay
- [ ] Recent searches persisted in localStorage
- [ ] Search result click → navigate to correct detail page

### 3.8 Notifications Module (missing entirely)
- [ ] Create `src/modules/notifications/pages/NotificationsPage.tsx`
- [ ] Notification bell in header with unread count badge
- [ ] Mark-as-read single / mark-all-read
- [ ] Notification type icons (comment, assignment, status-change, mention)
- [ ] Link from notification → relevant task/project
- [ ] Real-time badge update (polling or WebSocket)

### 3.9 Calendar Module (missing entirely)
- [ ] Create `src/modules/calendar/pages/CalendarPage.tsx`
- [ ] Month / week / day view toggle
- [ ] Tasks plotted by `targetDate`
- [ ] Holidays from DB overlaid on calendar
- [ ] Click day → quick-create task with that date pre-filled
- [ ] Color-code by priority or status

### 3.10 Settings Module (placeholder)
- [ ] User profile (name, email, avatar, password change)
- [ ] Notification preferences (which events trigger notifications)
- [ ] Theme preference (light / dark mode)
- [ ] Language / locale preference
- [ ] Default project preference
- [ ] API token management (personal access tokens)

---

## 4. Administration Panel Gaps

### 4.1 Generic Workspace Panels (exist but need richer UIs)
| Module | Current State | What's Missing |
|--------|--------------|----------------|
| Business Units | Generic CRUD table | Department hierarchy drill-down |
| Locations | Generic CRUD table | Map pin / Google Maps preview |
| Time Zones | Generic CRUD table | UTC offset validation, DST flag |
| Holidays | Generic CRUD table | Calendar preview of holidays per location |
| Roles | Generic CRUD table | Permission matrix UI (checkboxes per permission) |
| Permissions | Generic CRUD table | Group by module/resource |
| Task Statuses | Generic CRUD table | Color picker, set-as-default toggle |
| Task Priorities | Generic CRUD table | Color picker, order/weight drag-sort |
| Task Categories | Generic CRUD table | Icon picker, parent-child categories |
| Workflows | Generic CRUD table | Visual canvas (nodes + edges) for states/transitions |
| Notifications | Generic CRUD table | Mark-read, filter by type, bulk delete |
| Activity History | Generic CRUD table (read-only) | Filter by user, entity type, date range |
| Audit Logs | Generic CRUD table (read-only) | IP address display, export, date filter |
| Work Logs | Generic CRUD table | Per-task summary, per-user summary, time totals |

### 4.2 Missing Admin Panels
- [ ] **Email Templates** — manage notification email bodies (uses EmailService)
- [ ] **API Permission Rules** — `api_permission_rules` table has data but no admin UI
- [ ] **System Health** — show DB connection status, queue depth, last cron run
- [ ] **Backup & Restore** — trigger DB export
- [ ] **Feature Flags** — toggle experimental features per tenant

---

## 5. New Enterprise Features — Not Yet Planned

### 5.1 Authentication & Security
- [ ] **OAuth2 / SSO** — Google / Azure AD login (Spring Security OAuth2 client)
- [ ] **Two-Factor Authentication (2FA)** — TOTP (Google Authenticator)
- [ ] **Session management** — view/revoke active sessions
- [ ] **Password policy enforcement** — min length, complexity, expiry
- [ ] **Account lockout** after N failed logins
- [ ] **CSRF protection** (already using JWT but verify)
- [ ] **Rate limiting** on auth endpoints (Spring RateLimiter or Bucket4j)

### 5.2 Multi-Tenancy
- [ ] Tenant (organisation) isolation — row-level or schema-level
- [ ] Tenant onboarding flow (create org → invite admin → configure)
- [ ] Per-tenant branding (logo, primary color)
- [ ] Per-tenant feature flags
- [ ] Tenant billing / subscription tier (optional)

### 5.3 Task Intelligence
- [ ] **Recurring Tasks** — schedule engine (cron-based), recurrence rules (daily/weekly/monthly)
- [ ] **Task Templates** — create a task from a predefined template with pre-filled fields
- [ ] **SLA Rules** — define response time + resolution time per priority; auto-escalate on breach
- [ ] **Auto-assignment Rules** — round-robin, least-loaded, by department
- [ ] **Task Cloning** — duplicate an existing task
- [ ] **Task Merge** — merge duplicate tasks into one canonical task
- [ ] **Checklists** — sub-checklist items inside a task (not full sub-tasks)
- [ ] **Custom Fields** — admin-defined extra fields per project/category

### 5.4 Collaboration
- [ ] **Real-time updates** — WebSocket (STOMP over SockJS) so task changes appear live
- [ ] **@mentions** — parse `@username` in comments; create notification
- [ ] **Reactions on comments** — emoji reactions (👍 ✅ 🔥)
- [ ] **Internal Notes** — private notes visible only to assignee + reporter (not customer)
- [ ] **Task Sharing** — generate a public read-only link to a task
- [ ] **Team inbox** — shared queue of unassigned tasks

### 5.5 File Management
- [ ] **Proper file storage** — S3 / Azure Blob / MinIO instead of base64 DB column
- [ ] **File size limits + type validation** per task
- [ ] **Inline image preview** in task description and comments
- [ ] **Version history** for attachments

### 5.6 Integrations & Automation
- [ ] **Webhooks** — POST to external URL on task events (create, update, close)
- [ ] **Email-to-Task** — inbound email parsing creates a task
- [ ] **Slack / Teams notification bot** — post updates to channel
- [ ] **REST API documentation** — Swagger/OpenAPI UI at `/api/docs`
- [ ] **Personal Access Tokens** — for CI/CD and scripting
- [ ] **Zapier / Make (Integromat) connector** (via webhooks)
- [ ] **Git commit linkage** — reference task number in commit message → auto-comment

### 5.7 Reporting & Analytics
- [ ] **Burndown / Burnup charts** per sprint or date range
- [ ] **Velocity tracking** over time
- [ ] **Cycle time & lead time** analysis
- [ ] **SLA compliance report** — % tasks resolved within SLA
- [ ] **Team workload heatmap** — tasks per person per day
- [ ] **Export to Excel / PDF** with branding
- [ ] **Scheduled reports** by email (cron + EmailService)
- [ ] **Saved report presets**

### 5.8 Sprint / Iteration Management (New Domain)
> No backend for this yet — full new domain needed.
- [ ] Sprint entity (name, start date, end date, project, status)
- [ ] Assign tasks to sprints
- [ ] Sprint board (Kanban per sprint)
- [ ] Sprint velocity chart
- [ ] Backlog management (unassigned sprint tasks)
- [ ] Sprint retrospective notes

### 5.9 Time Tracking (WorkLog exists in DB — needs full UI)
- [ ] Live timer button on task detail ("Start Timer" / "Stop Timer")
- [ ] Manual log entry (date, hours, description)
- [ ] Edit / delete own work log entries
- [ ] Per-task time summary (estimated vs logged)
- [ ] Per-user weekly timesheet view
- [ ] Export timesheets to CSV
- [ ] Billable vs non-billable flag on work log

### 5.10 Notifications & Communication
- [ ] **Email notifications** — task assigned, comment added, due-date reminder, SLA breach
- [ ] **In-app notification center** (bell icon + slide-out panel)
- [ ] **Push notifications** (PWA/service worker)
- [ ] **Digest emails** — daily/weekly summary
- [ ] **Notification preference center** — per event type, per channel (email / in-app)
- [ ] **Unsubscribe** from specific task notifications

### 5.11 UX / Accessibility
- [ ] **Dark mode** — MUI theme toggle persisted per user
- [ ] **Keyboard shortcuts** — `N` = new task, `Ctrl+K` = search, `?` = shortcut help
- [ ] **Responsive / mobile layout** — current layout likely breaks on phones
- [ ] **PWA manifest** — installable on mobile home screen
- [ ] **Accessibility audit** — WCAG 2.1 AA compliance
- [ ] **Onboarding tour** — step-by-step first-use walkthrough (Intro.js / Shepherd)
- [ ] **Empty state illustrations** — friendly art for empty lists
- [ ] **Loading skeleton screens** — smooth perceived performance

### 5.12 DevOps & Production Readiness
- [ ] **Docker Compose** — single-command local dev (frontend + backend + postgres)
- [ ] **Dockerfile** for frontend (nginx) and backend (JRE)
- [ ] **Kubernetes manifests** or Helm chart
- [ ] **Environment config** — proper `.env.production` with secrets management
- [ ] **Health check endpoint** — `/actuator/health` already in Spring Boot; expose to K8s
- [ ] **Database migrations** — replace `schema.sql` with Flyway or Liquibase
- [ ] **CI/CD pipeline** — GitHub Actions (build → test → Docker build → deploy)
- [ ] **Centralised logging** — ELK stack or CloudWatch
- [ ] **APM** — Sentry or Datadog for error tracking
- [ ] **HTTPS / TLS** — enforce SSL, HSTS header
- [ ] **Security headers** — CSP, X-Frame-Options, etc.
- [ ] **Backup strategy** — automated PostgreSQL backups

---

## 6. Prioritised Delivery Plan

### Phase 1 — Stabilise (Weeks 1–2)
> Goal: Get the existing app fully working end-to-end with real auth.
1. Remove `VITE_DEFAULT_USER_ID` — use logged-in user everywhere
2. Migrate `CreateTaskPage` and `TaskDetailsPage` to TypeScript + `useAuth()`
3. Wire task status/priority from DB (not hardcoded strings)
4. Add `/search`, `/notifications`, `/calendar` routes
5. Fix Task Detail inline edit (full form, not just status dialog)

### Phase 2 — Core Completeness (Weeks 3–5)
> Goal: All nav items do something useful.
1. Search page + global `Ctrl+K` overlay
2. Notifications page + bell badge
3. Calendar page (tasks by date + holidays)
4. Dashboard — real charts connected to API
5. Work Log — timer UI on task detail
6. Workflow-driven status changes (use WorkflowEngine transitions)
7. Task Statuses / Priorities driven by DB catalog

### Phase 3 — Collaboration (Weeks 6–8)
> Goal: Team can actually collaborate.
1. @mention in comments → notification
2. Task Watchers
3. Real-time updates via WebSocket
4. File storage → S3/MinIO (replace base64)
5. Rich text in description/comments
6. Recurring Tasks
7. Task Templates

### Phase 4 — Analytics & Reporting (Weeks 9–10)
> Goal: Management has visibility.
1. Reports page — chart types, filters, export
2. Burndown chart
3. SLA rules + compliance report
4. Workload heatmap
5. Scheduled email reports

### Phase 5 — Enterprise Security (Weeks 11–12)
> Goal: Enterprise IT will approve installation.
1. OAuth2 / SSO (Azure AD / Google)
2. 2FA (TOTP)
3. Rate limiting on auth
4. Session management page
5. Webhooks outbound
6. API documentation (Swagger UI)

### Phase 6 — Sprint Management (Weeks 13–14)
> Goal: Scrum teams can use the tool.
1. Sprint entity + CRUD
2. Sprint board (Kanban)
3. Backlog view
4. Velocity chart

### Phase 7 — Production Hardening (Ongoing)
1. Docker + CI/CD pipeline
2. Flyway migrations
3. Centralised logging + APM
4. Mobile responsive layout
5. Accessibility audit
6. Dark mode
7. Onboarding tour

---

## 7. Technical Debt Register

| Item | Risk | Effort |
|------|------|--------|
| Legacy JSX pages coexist with TypeScript modules | High — two parallel codebases, easy to diverge | M |
| `VITE_DEFAULT_USER_ID` bypass in 4+ pages | High — any user can act as any user | S |
| Task attachments stored as base64 in DB | High — DB bloat, no streaming, breaks for large files | L |
| `schema.sql` used instead of Flyway | Medium — no migration history, risky schema changes | M |
| Hardcoded status/priority strings | Medium — admin catalog changes won't reflect in UI | M |
| No HTTPS enforcement in config | High — credentials in plaintext if deployed as-is | S |
| CORS allows `57.154.241.153:5173` hardcoded | Medium — breaks if IP changes | S |
| No input sanitisation on comment text | Medium — XSS if rendered as HTML | S |
| Reports page renders raw JSON | Low — UX is poor | S |

---

## 8. Open Questions for Product Owner

1. **Multi-tenancy**: Is this a SaaS product (multiple companies) or a single-org deployment?
2. **Sprint Management**: Is Scrum/Agile methodology a requirement, or just task tracking?
3. **SLA**: Are SLAs per priority (e.g. Critical = 4h response) or per customer/project?
4. **File Storage**: S3, Azure Blob, or self-hosted MinIO? Or keep in DB for now?
5. **SSO**: Which identity provider? Azure AD? Google Workspace? LDAP?
6. **Mobile**: Native app or PWA or just responsive web?
7. **Billing/Subscriptions**: Is this internal tooling or a commercial product with plans?
8. **Integrations Priority**: Slack? Jira import? Git provider (GitHub/GitLab)?

---

## 9. Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Done — backend + frontend wired |
| ⚠️ | Exists but incomplete / not wired |
| [ ] | Not started |
| P0 | Must fix immediately |
| S / M / L | Small / Medium / Large effort estimate |
