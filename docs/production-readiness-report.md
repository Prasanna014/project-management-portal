# Production Readiness Report

## Report 1 - Workspace Analysis

### Application Purpose
Project and task tracking platform with projects, tasks, comments, attachments, notifications, activity history, search, and reporting.

### Architecture
- Frontend: React + Vite + Material UI + Axios + React Router.
- Backend: Spring Boot REST API with layered architecture (Controller -> Service -> Repository -> PostgreSQL).
- Data: JPA/Hibernate entities in schema `tracker`.

### Module Summary
- Backend modules: config, controller, dto, entity, exception, repository, service.
- Frontend modules: pages, components, services, layout, routes, theme, utils.

## Report 2 - Missing Functionality

### Missing/Broken Before Fix
- Corrupted notifications page and notification service syntax.
- Broken service imports and function names across pages.
- Hardcoded API host not environment-driven.
- Dashboard/report/search page response mapping mismatches.
- Empty calendar page and incomplete route coverage.
- Static/mock task creation form values not tied to backend lookups.

### Implemented
- Rebuilt notification and task creation flows with real backend integration.
- Added missing route targets and live calendar page.
- Unified services on shared Axios client with environment base URL.
- Fixed project/users/tasks/task-details integration breakages.

## Report 3 - Database Design

### ERD Description
- users (1) -> (many) tasks via tasks.owner_id
- users (1) -> (many) notifications via notifications.user_id
- users (1) -> (many) task_comments via task_comments.commented_by
- users (1) -> (many) task_attachments via task_attachments.uploaded_by
- projects (1) -> (many) tasks via tasks.project_id
- tasks (1) -> (many) task_comments via task_comments.task_id
- tasks (1) -> (many) task_attachments via task_attachments.task_id
- tasks (1) -> (many) notifications via notifications.task_id
- tasks (1) -> (many) activity_history via activity_history.task_id

### SQL Creation Script Required

CREATE SCHEMA IF NOT EXISTS tracker;

CREATE TABLE IF NOT EXISTS tracker.users (
  id BIGSERIAL PRIMARY KEY,
  employee_id VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(100),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tracker.projects (
  id BIGSERIAL PRIMARY KEY,
  project_code VARCHAR(100) NOT NULL UNIQUE,
  project_name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tracker.tasks (
  id BIGSERIAL PRIMARY KEY,
  task_no VARCHAR(100) NOT NULL UNIQUE,
  project_id BIGINT NOT NULL,
  issue_action_item VARCHAR(500) NOT NULL,
  description TEXT,
  priority VARCHAR(50),
  status VARCHAR(50),
  owner_id BIGINT,
  target_date DATE,
  date_resolved DATE,
  created_by BIGINT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP,
  CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES tracker.projects(id),
  CONSTRAINT fk_tasks_owner FOREIGN KEY (owner_id) REFERENCES tracker.users(id),
  CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by) REFERENCES tracker.users(id)
);

CREATE TABLE IF NOT EXISTS tracker.task_comments (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL,
  comment_text TEXT NOT NULL,
  commented_by BIGINT NOT NULL,
  commented_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_task_comments_task FOREIGN KEY (task_id) REFERENCES tracker.tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_comments_user FOREIGN KEY (commented_by) REFERENCES tracker.users(id)
);

CREATE TABLE IF NOT EXISTS tracker.task_attachments (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_type VARCHAR(200),
  file_path TEXT NOT NULL,
  uploaded_by BIGINT,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_task_attachments_task FOREIGN KEY (task_id) REFERENCES tracker.tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_attachments_user FOREIGN KEY (uploaded_by) REFERENCES tracker.users(id)
);

CREATE TABLE IF NOT EXISTS tracker.notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  task_id BIGINT,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  notification_type VARCHAR(100),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES tracker.users(id),
  CONSTRAINT fk_notifications_task FOREIGN KEY (task_id) REFERENCES tracker.tasks(id)
);

CREATE TABLE IF NOT EXISTS tracker.activity_history (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL,
  activity_type VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  performed_by BIGINT,
  performed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_activity_task FOREIGN KEY (task_id) REFERENCES tracker.tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_user FOREIGN KEY (performed_by) REFERENCES tracker.users(id)
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tracker.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_id ON tracker.tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tracker.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tracker.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON tracker.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_attachments_task_id ON tracker.task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON tracker.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_task_id ON tracker.activity_history(task_id);

## Report 4 - Defects

- Backend build portability issue: Java version pinned at 21 and duplicate Lombok dependencies.
- Backend startup risk: schema `tracker` required but not created automatically.
- Hardcoded secrets: SMTP username/password in code.
- Backend placeholder logic: attachment uploadedBy hardcoded.
- Frontend runtime failure: corrupted notifications page content and malformed notification service file.
- Frontend integration failures: wrong import names and undefined functions (`getProjects`, `getUsers`, `getComments`, `getActivity`).
- Frontend contract mismatches: pages expected axios `.data` when services already returned payload.
- Routing gaps: sidebar routes missing in app router.
- Hardcoded external backend host in all services.

## Report 5 - Production Readiness

### Working
- Core CRUD APIs and frontend pages for tasks, projects, users, search, reports, dashboard, notifications.
- DTO validation on major write endpoints.
- Centralized frontend API client with env-based base URL.

### Partially Working
- Security/auth flow exists only as permit-all security filter; registration/login and role-based auth are not implemented.
- Email sending requires valid environment SMTP configuration.

### Broken/Needs Further Development
- No automated tests included.
- No migration framework (Flyway/Liquibase) currently wired.
- Some entity relationships are represented as scalar IDs rather than typed JPA relationships.
