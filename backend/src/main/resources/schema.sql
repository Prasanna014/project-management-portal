-- Create schema
CREATE SCHEMA IF NOT EXISTS tracker;

-- Existing core tables
CREATE TABLE IF NOT EXISTS tracker.users (
    id BIGSERIAL PRIMARY KEY,
    employee_id VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_employee_id_unique UNIQUE (employee_id)
);

CREATE TABLE IF NOT EXISTS tracker.projects (
    id BIGSERIAL PRIMARY KEY,
    project_code VARCHAR(255) NOT NULL UNIQUE,
    project_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT projects_code_unique UNIQUE (project_code),
    CONSTRAINT projects_name_unique UNIQUE (project_name)
);

CREATE TABLE IF NOT EXISTS tracker.tasks (
    id BIGSERIAL PRIMARY KEY,
    task_no VARCHAR(255) NOT NULL UNIQUE,
    project_id BIGINT NOT NULL REFERENCES tracker.projects(id),
    issue_action_item VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50),
    status VARCHAR(50),
    owner_id BIGINT REFERENCES tracker.users(id),
    target_date DATE,
    date_resolved DATE,
    created_by BIGINT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT tasks_no_unique UNIQUE (task_no),
    CONSTRAINT tasks_project_id_fk FOREIGN KEY (project_id) REFERENCES tracker.projects(id)
);

CREATE TABLE IF NOT EXISTS tracker.task_comments (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tracker.tasks(id),
    comment_text TEXT NOT NULL,
    commented_by BIGINT NOT NULL REFERENCES tracker.users(id),
    commented_at TIMESTAMP NOT NULL,
    CONSTRAINT task_comments_task_fk FOREIGN KEY (task_id) REFERENCES tracker.tasks(id)
);

CREATE TABLE IF NOT EXISTS tracker.task_attachments (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tracker.tasks(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_path VARCHAR(500) NOT NULL,
    uploaded_by BIGINT REFERENCES tracker.users(id),
    uploaded_at TIMESTAMP NOT NULL,
    CONSTRAINT task_attachments_task_fk FOREIGN KEY (task_id) REFERENCES tracker.tasks(id)
);

CREATE TABLE IF NOT EXISTS tracker.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES tracker.users(id),
    task_id BIGINT REFERENCES tracker.tasks(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    notification_type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT notifications_user_fk FOREIGN KEY (user_id) REFERENCES tracker.users(id),
    CONSTRAINT notifications_task_fk FOREIGN KEY (task_id) REFERENCES tracker.tasks(id)
);

CREATE TABLE IF NOT EXISTS tracker.activity_history (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tracker.tasks(id),
    activity_type VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    performed_by BIGINT REFERENCES tracker.users(id),
    performed_at TIMESTAMP NOT NULL,
    CONSTRAINT activity_history_task_fk FOREIGN KEY (task_id) REFERENCES tracker.tasks(id)
);

-- Configurable organization module
CREATE TABLE IF NOT EXISTS tracker.departments (
    id BIGSERIAL PRIMARY KEY,
    department_code VARCHAR(100) NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT departments_code_unique UNIQUE (department_code),
    CONSTRAINT departments_name_unique UNIQUE (department_name)
);

-- Configurable RBAC module
CREATE TABLE IF NOT EXISTS tracker.roles (
    id BIGSERIAL PRIMARY KEY,
    role_key VARCHAR(100) NOT NULL,
    role_name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    system_role BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT roles_key_unique UNIQUE (role_key),
    CONSTRAINT roles_name_unique UNIQUE (role_name)
);

CREATE TABLE IF NOT EXISTS tracker.permissions (
    id BIGSERIAL PRIMARY KEY,
    permission_key VARCHAR(150) NOT NULL,
    permission_name VARCHAR(255) NOT NULL,
    module_name VARCHAR(100),
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT permissions_key_unique UNIQUE (permission_key),
    CONSTRAINT permissions_name_unique UNIQUE (permission_name)
);

CREATE TABLE IF NOT EXISTS tracker.role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    granted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    granted_by BIGINT,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT role_permissions_role_fk FOREIGN KEY (role_id) REFERENCES tracker.roles(id),
    CONSTRAINT role_permissions_permission_fk FOREIGN KEY (permission_id) REFERENCES tracker.permissions(id),
    CONSTRAINT role_permissions_granted_by_fk FOREIGN KEY (granted_by) REFERENCES tracker.users(id)
);

CREATE TABLE IF NOT EXISTS tracker.user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    assigned_by BIGINT,
    active BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT user_roles_user_fk FOREIGN KEY (user_id) REFERENCES tracker.users(id),
    CONSTRAINT user_roles_role_fk FOREIGN KEY (role_id) REFERENCES tracker.roles(id),
    CONSTRAINT user_roles_assigned_by_fk FOREIGN KEY (assigned_by) REFERENCES tracker.users(id)
);

-- Configurable task catalogs
CREATE TABLE IF NOT EXISTS tracker.task_statuses (
    id BIGSERIAL PRIMARY KEY,
    status_key VARCHAR(100) NOT NULL,
    status_name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    color_code VARCHAR(20),
    is_terminal BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT task_statuses_key_unique UNIQUE (status_key),
    CONSTRAINT task_statuses_name_unique UNIQUE (status_name)
);

CREATE TABLE IF NOT EXISTS tracker.task_priorities (
    id BIGSERIAL PRIMARY KEY,
    priority_key VARCHAR(100) NOT NULL,
    priority_name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    color_code VARCHAR(20),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT task_priorities_key_unique UNIQUE (priority_key),
    CONSTRAINT task_priorities_name_unique UNIQUE (priority_name)
);

CREATE TABLE IF NOT EXISTS tracker.task_categories (
    id BIGSERIAL PRIMARY KEY,
    category_key VARCHAR(100) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT task_categories_key_unique UNIQUE (category_key),
    CONSTRAINT task_categories_name_unique UNIQUE (category_name)
);

-- Configurable workflow module
CREATE TABLE IF NOT EXISTS tracker.workflow_definitions (
    id BIGSERIAL PRIMARY KEY,
    workflow_key VARCHAR(100) NOT NULL,
    workflow_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT workflow_definitions_key_unique UNIQUE (workflow_key),
    CONSTRAINT workflow_definitions_name_unique UNIQUE (workflow_name)
);

CREATE TABLE IF NOT EXISTS tracker.workflow_states (
    id BIGSERIAL PRIMARY KEY,
    workflow_id BIGINT NOT NULL,
    state_key VARCHAR(100) NOT NULL,
    state_name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_initial BOOLEAN NOT NULL DEFAULT false,
    is_terminal BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT workflow_states_workflow_fk FOREIGN KEY (workflow_id) REFERENCES tracker.workflow_definitions(id),
    CONSTRAINT workflow_states_workflow_state_key_unique UNIQUE (workflow_id, state_key),
    CONSTRAINT workflow_states_workflow_state_order_unique UNIQUE (workflow_id, display_order)
);

CREATE TABLE IF NOT EXISTS tracker.workflow_transitions (
    id BIGSERIAL PRIMARY KEY,
    workflow_id BIGINT NOT NULL,
    from_state_id BIGINT NOT NULL,
    to_state_id BIGINT NOT NULL,
    transition_key VARCHAR(100) NOT NULL,
    transition_name VARCHAR(255) NOT NULL,
    requires_comment BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT workflow_transitions_workflow_fk FOREIGN KEY (workflow_id) REFERENCES tracker.workflow_definitions(id),
    CONSTRAINT workflow_transitions_from_state_fk FOREIGN KEY (from_state_id) REFERENCES tracker.workflow_states(id),
    CONSTRAINT workflow_transitions_to_state_fk FOREIGN KEY (to_state_id) REFERENCES tracker.workflow_states(id),
    CONSTRAINT workflow_transitions_workflow_key_unique UNIQUE (workflow_id, transition_key)
);

CREATE TABLE IF NOT EXISTS tracker.workflow_transition_roles (
    transition_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (transition_id, role_id),
    CONSTRAINT workflow_transition_roles_transition_fk FOREIGN KEY (transition_id) REFERENCES tracker.workflow_transitions(id),
    CONSTRAINT workflow_transition_roles_role_fk FOREIGN KEY (role_id) REFERENCES tracker.roles(id)
);

-- Configurable API permission rules (database-driven authorization)
CREATE TABLE IF NOT EXISTS tracker.api_permission_rules (
    id BIGSERIAL PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    path_pattern VARCHAR(500) NOT NULL,
    permission_id BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT api_permission_rules_name_unique UNIQUE (rule_name),
    CONSTRAINT api_permission_rules_permission_fk FOREIGN KEY (permission_id) REFERENCES tracker.permissions(id)
);

-- Project-to-organization mapping
CREATE TABLE IF NOT EXISTS tracker.project_departments (
    project_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    PRIMARY KEY (project_id, department_id),
    CONSTRAINT project_departments_project_fk FOREIGN KEY (project_id) REFERENCES tracker.projects(id),
    CONSTRAINT project_departments_department_fk FOREIGN KEY (department_id) REFERENCES tracker.departments(id)
);

-- Backward-compatible extension columns
ALTER TABLE tracker.users
    ADD COLUMN IF NOT EXISTS department_id BIGINT,
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

ALTER TABLE tracker.projects
    ADD COLUMN IF NOT EXISTS workflow_id BIGINT;

ALTER TABLE tracker.tasks
    ADD COLUMN IF NOT EXISTS status_id BIGINT,
    ADD COLUMN IF NOT EXISTS priority_id BIGINT,
    ADD COLUMN IF NOT EXISTS category_id BIGINT,
    ADD COLUMN IF NOT EXISTS workflow_state_id BIGINT;

-- Safe foreign key additions for existing tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_department_fk'
          AND connamespace = 'tracker'::regnamespace
    ) THEN
        ALTER TABLE tracker.users
            ADD CONSTRAINT users_department_fk
            FOREIGN KEY (department_id) REFERENCES tracker.departments(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'projects_workflow_fk'
          AND connamespace = 'tracker'::regnamespace
    ) THEN
        ALTER TABLE tracker.projects
            ADD CONSTRAINT projects_workflow_fk
            FOREIGN KEY (workflow_id) REFERENCES tracker.workflow_definitions(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'tasks_status_fk'
          AND connamespace = 'tracker'::regnamespace
    ) THEN
        ALTER TABLE tracker.tasks
            ADD CONSTRAINT tasks_status_fk
            FOREIGN KEY (status_id) REFERENCES tracker.task_statuses(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'tasks_priority_fk'
          AND connamespace = 'tracker'::regnamespace
    ) THEN
        ALTER TABLE tracker.tasks
            ADD CONSTRAINT tasks_priority_fk
            FOREIGN KEY (priority_id) REFERENCES tracker.task_priorities(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'tasks_category_fk'
          AND connamespace = 'tracker'::regnamespace
    ) THEN
        ALTER TABLE tracker.tasks
            ADD CONSTRAINT tasks_category_fk
            FOREIGN KEY (category_id) REFERENCES tracker.task_categories(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'tasks_workflow_state_fk'
          AND connamespace = 'tracker'::regnamespace
    ) THEN
        ALTER TABLE tracker.tasks
            ADD CONSTRAINT tasks_workflow_state_fk
            FOREIGN KEY (workflow_state_id) REFERENCES tracker.workflow_states(id);
    END IF;
END $$;

-- Existing table indexes made idempotent
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tracker.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_id ON tracker.tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tracker.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tracker.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON tracker.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON tracker.task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON tracker.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_task_id ON tracker.notifications(task_id);
CREATE INDEX IF NOT EXISTS idx_activity_history_task_id ON tracker.activity_history(task_id);

-- New module indexes
CREATE INDEX IF NOT EXISTS idx_users_department_id ON tracker.users(department_id);
CREATE INDEX IF NOT EXISTS idx_projects_workflow_id ON tracker.projects(workflow_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status_id ON tracker.tasks(status_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority_id ON tracker.tasks(priority_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tracker.tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workflow_state_id ON tracker.tasks(workflow_state_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON tracker.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON tracker.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_workflow_states_workflow_id ON tracker.workflow_states(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_transitions_workflow_id ON tracker.workflow_transitions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_transitions_from_state_id ON tracker.workflow_transitions(from_state_id);
CREATE INDEX IF NOT EXISTS idx_workflow_transitions_to_state_id ON tracker.workflow_transitions(to_state_id);
CREATE INDEX IF NOT EXISTS idx_project_departments_department_id ON tracker.project_departments(department_id);
CREATE INDEX IF NOT EXISTS idx_api_permission_rules_permission_id ON tracker.api_permission_rules(permission_id);
CREATE INDEX IF NOT EXISTS idx_api_permission_rules_active_method ON tracker.api_permission_rules(active, http_method);

-- Existing sample data for testing
INSERT INTO tracker.users (employee_id, full_name, email, role, active, created_at, updated_at) VALUES
('EMP001', 'John Doe', 'john.doe@example.com', 'Project Manager', true, NOW(), NOW()),
('EMP002', 'Jane Smith', 'jane.smith@example.com', 'Developer', true, NOW(), NOW()),
('EMP003', 'Bob Johnson', 'bob.johnson@example.com', 'QA Engineer', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO tracker.projects (project_code, project_name, description, active, created_at) VALUES
('PRJ-001', 'Portal Development', 'Build project management portal', true, NOW()),
('PRJ-002', 'Data Migration', 'Migrate legacy data to new system', true, NOW()),
('PRJ-003', 'Performance Optimization', 'Optimize system performance', true, NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Minimum runnable seed for authentication, authorization, and admin modules
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO tracker.departments (department_code, department_name, description, active, created_at, updated_at)
VALUES ('ENG', 'Engineering', 'Core engineering department', true, NOW(), NOW())
ON CONFLICT (department_code) DO UPDATE SET
    department_name = EXCLUDED.department_name,
    active = true,
    updated_at = NOW();

INSERT INTO tracker.roles (role_key, role_name, description, active, system_role, created_at, updated_at)
VALUES ('SUPER_ADMIN', 'Super Admin', 'Full access role', true, true, NOW(), NOW())
ON CONFLICT (role_key) DO UPDATE SET
    role_name = EXCLUDED.role_name,
    active = true,
    system_role = true,
    updated_at = NOW();

INSERT INTO tracker.permissions (permission_key, permission_name, module_name, description, active, created_at, updated_at)
VALUES ('SUPER_ADMIN', 'Super Admin Access', 'SYSTEM', 'Global full access permission', true, NOW(), NOW())
ON CONFLICT (permission_key) DO UPDATE SET
    permission_name = EXCLUDED.permission_name,
    active = true,
    updated_at = NOW();

INSERT INTO tracker.users (employee_id, full_name, email, role, active, created_at, updated_at, department_id, password_hash)
VALUES (
    'EMPADMIN',
    'System Administrator',
    'admin@project.local',
    'SUPER_ADMIN',
    true,
    NOW(),
    NOW(),
    (SELECT id FROM tracker.departments WHERE department_code = 'ENG'),
    crypt('Admin@123', gen_salt('bf', 10))
)
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    active = true,
    updated_at = NOW(),
    department_id = EXCLUDED.department_id,
    password_hash = EXCLUDED.password_hash;

INSERT INTO tracker.user_roles (user_id, role_id, assigned_at, assigned_by, active)
SELECT u.id, r.id, NOW(), u.id, true
FROM tracker.users u
JOIN tracker.roles r ON r.role_key = 'SUPER_ADMIN'
WHERE u.email = 'admin@project.local'
ON CONFLICT (user_id, role_id) DO UPDATE SET
    active = true,
    assigned_at = NOW();

INSERT INTO tracker.role_permissions (role_id, permission_id, granted_at, granted_by)
SELECT r.id, p.id, NOW(), u.id
FROM tracker.roles r
JOIN tracker.permissions p ON p.permission_key = 'SUPER_ADMIN'
JOIN tracker.users u ON u.email = 'admin@project.local'
WHERE r.role_key = 'SUPER_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO tracker.api_permission_rules (rule_name, http_method, path_pattern, permission_id, active, created_at, updated_at)
SELECT 'ADMIN_GET_ALL', 'GET', '/api/admin/**', p.id, true, NOW(), NOW()
FROM tracker.permissions p
WHERE p.permission_key = 'SUPER_ADMIN'
ON CONFLICT (rule_name) DO UPDATE SET active = true, updated_at = NOW();

INSERT INTO tracker.api_permission_rules (rule_name, http_method, path_pattern, permission_id, active, created_at, updated_at)
SELECT 'ADMIN_POST_ALL', 'POST', '/api/admin/**', p.id, true, NOW(), NOW()
FROM tracker.permissions p
WHERE p.permission_key = 'SUPER_ADMIN'
ON CONFLICT (rule_name) DO UPDATE SET active = true, updated_at = NOW();

INSERT INTO tracker.api_permission_rules (rule_name, http_method, path_pattern, permission_id, active, created_at, updated_at)
SELECT 'ADMIN_PUT_ALL', 'PUT', '/api/admin/**', p.id, true, NOW(), NOW()
FROM tracker.permissions p
WHERE p.permission_key = 'SUPER_ADMIN'
ON CONFLICT (rule_name) DO UPDATE SET active = true, updated_at = NOW();

INSERT INTO tracker.api_permission_rules (rule_name, http_method, path_pattern, permission_id, active, created_at, updated_at)
SELECT 'ADMIN_DELETE_ALL', 'DELETE', '/api/admin/**', p.id, true, NOW(), NOW()
FROM tracker.permissions p
WHERE p.permission_key = 'SUPER_ADMIN'
ON CONFLICT (rule_name) DO UPDATE SET active = true, updated_at = NOW();

INSERT INTO tracker.api_permission_rules (rule_name, http_method, path_pattern, permission_id, active, created_at, updated_at)
SELECT 'ADMIN_PATCH_ALL', 'PATCH', '/api/admin/**', p.id, true, NOW(), NOW()
FROM tracker.permissions p
WHERE p.permission_key = 'SUPER_ADMIN'
ON CONFLICT (rule_name) DO UPDATE SET active = true, updated_at = NOW();

INSERT INTO tracker.task_statuses (status_key, status_name, description, display_order, color_code, is_terminal, active, created_at, updated_at)
VALUES
('TODO', 'To Do', 'Work not started', 1, '#6b7280', false, true, NOW(), NOW()),
('OPEN', 'Open', 'Ready to be worked on', 2, '#0ea5e9', false, true, NOW(), NOW()),
('WAITING', 'Waiting', 'Paused for pending input', 3, '#f59e0b', false, true, NOW(), NOW()),
('IN_PROGRESS', 'In Progress', 'Work in progress', 4, '#2563eb', false, true, NOW(), NOW()),
('BLOCKED', 'Blocked', 'Cannot proceed due to hard dependency', 5, '#ef4444', false, true, NOW(), NOW()),
('SCHEDULED', 'Scheduled', 'Planned for a future start', 6, '#6366f1', false, true, NOW(), NOW()),
('OVERDUE', 'Overdue', 'Past target date and still unresolved', 7, '#dc2626', false, true, NOW(), NOW()),
('DONE', 'Done', 'Work completed', 8, '#16a34a', true, true, NOW(), NOW()),
('COMPLETED', 'Completed', 'Work completed', 9, '#22c55e', true, true, NOW(), NOW())
ON CONFLICT (status_key) DO UPDATE SET
    status_name = EXCLUDED.status_name,
    active = true,
    updated_at = NOW();

INSERT INTO tracker.task_priorities (priority_key, priority_name, description, display_order, color_code, active, created_at, updated_at)
VALUES
('LOW', 'Low', 'Low priority', 1, '#10b981', true, NOW(), NOW()),
('MEDIUM', 'Medium', 'Medium priority', 2, '#f59e0b', true, NOW(), NOW()),
('HIGH', 'High', 'High priority', 3, '#ef4444', true, NOW(), NOW())
ON CONFLICT (priority_key) DO UPDATE SET
    priority_name = EXCLUDED.priority_name,
    active = true,
    updated_at = NOW();

INSERT INTO tracker.task_categories (category_key, category_name, description, active, created_at, updated_at)
VALUES
('GENERAL', 'General', 'General tasks', true, NOW(), NOW()),
('BUG', 'Bug', 'Bug fix tasks', true, NOW(), NOW()),
('FEATURE', 'Feature', 'Feature development tasks', true, NOW(), NOW())
ON CONFLICT (category_key) DO UPDATE SET
    category_name = EXCLUDED.category_name,
    active = true,
    updated_at = NOW();

INSERT INTO tracker.workflow_definitions (workflow_key, workflow_name, entity_type, description, active, created_at, updated_at)
VALUES ('TASK_DEFAULT', 'Task Default Workflow', 'TASK', 'Default workflow for tasks', true, NOW(), NOW())
ON CONFLICT (workflow_key) DO UPDATE SET
    workflow_name = EXCLUDED.workflow_name,
    active = true,
    updated_at = NOW();

WITH wf AS (
    SELECT id FROM tracker.workflow_definitions WHERE workflow_key = 'TASK_DEFAULT'
)
INSERT INTO tracker.workflow_states (workflow_id, state_key, state_name, description, display_order, is_initial, is_terminal, active, created_at, updated_at)
SELECT wf.id, 'TODO', 'To Do', 'Initial state', 1, true, false, true, NOW(), NOW() FROM wf
ON CONFLICT (workflow_id, state_key) DO UPDATE SET
    state_name = EXCLUDED.state_name,
    active = true,
    updated_at = NOW();

WITH wf AS (
    SELECT id FROM tracker.workflow_definitions WHERE workflow_key = 'TASK_DEFAULT'
)
INSERT INTO tracker.workflow_states (workflow_id, state_key, state_name, description, display_order, is_initial, is_terminal, active, created_at, updated_at)
SELECT wf.id, 'IN_PROGRESS', 'In Progress', 'Work in progress', 2, false, false, true, NOW(), NOW() FROM wf
ON CONFLICT (workflow_id, state_key) DO UPDATE SET
    state_name = EXCLUDED.state_name,
    active = true,
    updated_at = NOW();

WITH wf AS (
    SELECT id FROM tracker.workflow_definitions WHERE workflow_key = 'TASK_DEFAULT'
)
INSERT INTO tracker.workflow_states (workflow_id, state_key, state_name, description, display_order, is_initial, is_terminal, active, created_at, updated_at)
SELECT wf.id, 'DONE', 'Done', 'Completed state', 3, false, true, true, NOW(), NOW() FROM wf
ON CONFLICT (workflow_id, state_key) DO UPDATE SET
    state_name = EXCLUDED.state_name,
    active = true,
    updated_at = NOW();

WITH wf AS (
    SELECT id FROM tracker.workflow_definitions WHERE workflow_key = 'TASK_DEFAULT'
),
st_todo AS (
    SELECT id FROM tracker.workflow_states WHERE workflow_id = (SELECT id FROM wf) AND state_key = 'TODO'
),
st_progress AS (
    SELECT id FROM tracker.workflow_states WHERE workflow_id = (SELECT id FROM wf) AND state_key = 'IN_PROGRESS'
),
st_done AS (
    SELECT id FROM tracker.workflow_states WHERE workflow_id = (SELECT id FROM wf) AND state_key = 'DONE'
)
INSERT INTO tracker.workflow_transitions (workflow_id, from_state_id, to_state_id, transition_key, transition_name, requires_comment, active, created_at, updated_at)
SELECT (SELECT id FROM wf), (SELECT id FROM st_todo), (SELECT id FROM st_progress), 'START', 'Start Progress', false, true, NOW(), NOW()
ON CONFLICT (workflow_id, transition_key) DO UPDATE SET
    active = true,
    updated_at = NOW();

WITH wf AS (
    SELECT id FROM tracker.workflow_definitions WHERE workflow_key = 'TASK_DEFAULT'
),
st_progress AS (
    SELECT id FROM tracker.workflow_states WHERE workflow_id = (SELECT id FROM wf) AND state_key = 'IN_PROGRESS'
),
st_done AS (
    SELECT id FROM tracker.workflow_states WHERE workflow_id = (SELECT id FROM wf) AND state_key = 'DONE'
)
INSERT INTO tracker.workflow_transitions (workflow_id, from_state_id, to_state_id, transition_key, transition_name, requires_comment, active, created_at, updated_at)
SELECT (SELECT id FROM wf), (SELECT id FROM st_progress), (SELECT id FROM st_done), 'COMPLETE', 'Complete Task', false, true, NOW(), NOW()
ON CONFLICT (workflow_id, transition_key) DO UPDATE SET
    active = true,
    updated_at = NOW();

WITH role_admin AS (
    SELECT id FROM tracker.roles WHERE role_key = 'SUPER_ADMIN'
),
all_transitions AS (
    SELECT id FROM tracker.workflow_transitions
)
INSERT INTO tracker.workflow_transition_roles (transition_id, role_id)
SELECT t.id, r.id
FROM all_transitions t
CROSS JOIN role_admin r
ON CONFLICT (transition_id, role_id) DO NOTHING;

UPDATE tracker.projects
SET workflow_id = (SELECT id FROM tracker.workflow_definitions WHERE workflow_key = 'TASK_DEFAULT')
WHERE workflow_id IS NULL;

UPDATE tracker.tasks
SET
    status_id = COALESCE(status_id, (SELECT id FROM tracker.task_statuses WHERE status_key = 'TODO')),
    priority_id = COALESCE(priority_id, (SELECT id FROM tracker.task_priorities WHERE priority_key = 'MEDIUM')),
    category_id = COALESCE(category_id, (SELECT id FROM tracker.task_categories WHERE category_key = 'GENERAL')),
    workflow_state_id = COALESCE(workflow_state_id, (
        SELECT ws.id
        FROM tracker.workflow_states ws
        JOIN tracker.workflow_definitions wd ON wd.id = ws.workflow_id
        WHERE wd.workflow_key = 'TASK_DEFAULT' AND ws.state_key = 'TODO'
    ));