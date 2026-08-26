# User Perspective Enterprise Readiness

## What users should be able to do
- Sign in with role-based access and see only the workspaces, projects, tasks, and documents they are allowed to access.
- Create and update their own work items, comment on tasks, upload supporting files, and collaborate without admin help.
- Search across projects, tasks, comments, and knowledge articles from one global entry point.
- Access approved SOPs, templates, runbooks, and training content from a dedicated knowledge base.
- Restore their own deleted knowledge files for up to 30 days.

## Recommended user personas
### Contributor
- View assigned work
- Update owned tasks
- Add comments and files
- Read approved knowledge articles
- Restore own deleted files within 30 days

### Team Lead
- All contributor permissions
- Reassign team work
- Review workload and overdue items
- Approve team document changes

### Project Manager
- Create and manage projects
- Assign tasks
- Manage project members
- Publish project SOPs and templates
- Review delivery dashboards and reports

### Executive Viewer
- Read dashboards and reports
- Read project summaries
- Read approved SOPs
- No operational edit rights

## Current gaps observed in this project
- Search, notifications, and calendar still need to be completed in the TypeScript shell.
- Task details need richer editing, dependency management, watchers, mentions, and workflow-driven transitions.
- Settings is still a placeholder.
- The application still has some legacy pages and route migration work in progress.
- Knowledge base document management does not yet exist on the backend.

## What to improve next for users
1. Add a unified global search and command palette.
2. Add a notification center with unread counts and deep links.
3. Add self-service profile, password reset, MFA status, and session visibility.
4. Add document preview, version history, and acknowledgements for SOPs.
5. Add mobile-friendly layouts for daily contributors and approvers.

## Success criteria
- Users can complete daily delivery work without admin intervention.
- Users can find the right SOP or template in under one minute.
- Users can recover accidental document deletion within the policy window.
- Users see only the data allowed by their project, department, and role scope.
