-- Create schema
CREATE SCHEMA IF NOT EXISTS tracker;

CREATE TABLE IF NOT EXISTS tracker.companies (
    id BIGSERIAL PRIMARY KEY,
    company_code VARCHAR(100) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL UNIQUE,
    company_slug VARCHAR(100) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tracker.plans (
    id BIGSERIAL PRIMARY KEY,
    plan_code VARCHAR(100) NOT NULL UNIQUE,
    plan_name VARCHAR(255) NOT NULL,
    max_users INTEGER NOT NULL,
    max_projects INTEGER NOT NULL,
    storage_limit_mb BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tracker.subscriptions (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES tracker.companies(id),
    plan_id BIGINT NOT NULL REFERENCES tracker.plans(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tracker.billing (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES tracker.companies(id),
    subscription_id BIGINT REFERENCES tracker.subscriptions(id),
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    payment_date TIMESTAMP,
    due_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tracker.tenant_status (
    company_id BIGINT PRIMARY KEY REFERENCES tracker.companies(id),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE tracker.companies ADD COLUMN IF NOT EXISTS company_slug VARCHAR(100);
UPDATE tracker.companies
SET company_slug = lower(regexp_replace(company_code, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE company_slug IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_company_slug ON tracker.companies(company_slug);

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

CREATE TABLE IF NOT EXISTS tracker.company_admins (
    company_id BIGINT NOT NULL REFERENCES tracker.companies(id),
    user_id BIGINT NOT NULL REFERENCES tracker.users(id),
    active BOOLEAN NOT NULL DEFAULT true,
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (company_id, user_id)
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

-- Existing installations retain all data under this initial tenant.
INSERT INTO tracker.companies (company_code, company_name, company_slug)
VALUES ('DEFAULT', 'Default Company', 'default')
ON CONFLICT (company_code) DO NOTHING;

INSERT INTO tracker.plans (plan_code, plan_name, max_users, max_projects, storage_limit_mb)
VALUES ('STANDARD', 'Standard', 100, 25, 10240)
ON CONFLICT (plan_code) DO NOTHING;

INSERT INTO tracker.tenant_status (company_id, status)
SELECT id, 'ACTIVE' FROM tracker.companies
ON CONFLICT (company_id) DO NOTHING;

INSERT INTO tracker.subscriptions (company_id, plan_id, start_date, end_date, status)
SELECT c.id, p.id, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 'ACTIVE'
FROM tracker.companies c
JOIN tracker.plans p ON p.plan_code = 'STANDARD'
WHERE NOT EXISTS (SELECT 1 FROM tracker.subscriptions s WHERE s.company_id = c.id);

ALTER TABLE tracker.users ADD COLUMN IF NOT EXISTS company_id BIGINT;
ALTER TABLE tracker.projects ADD COLUMN IF NOT EXISTS company_id BIGINT;
ALTER TABLE tracker.projects ADD COLUMN IF NOT EXISTS project_slug VARCHAR(150);
ALTER TABLE tracker.tasks ADD COLUMN IF NOT EXISTS company_id BIGINT;
ALTER TABLE tracker.departments ADD COLUMN IF NOT EXISTS company_id BIGINT;

UPDATE tracker.users SET company_id = (SELECT id FROM tracker.companies WHERE company_code = 'DEFAULT') WHERE company_id IS NULL;
UPDATE tracker.projects SET company_id = (SELECT id FROM tracker.companies WHERE company_code = 'DEFAULT') WHERE company_id IS NULL;
UPDATE tracker.projects
SET project_slug = lower(regexp_replace(project_code, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE project_slug IS NULL;
UPDATE tracker.tasks task SET company_id = project.company_id FROM tracker.projects project WHERE task.project_id = project.id AND task.company_id IS NULL;
UPDATE tracker.departments SET company_id = (SELECT id FROM tracker.companies WHERE company_code = 'DEFAULT') WHERE company_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_company_id ON tracker.users(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON tracker.projects(company_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_company_slug ON tracker.projects(company_id, project_slug);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON tracker.tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON tracker.departments(company_id);

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

INSERT INTO tracker.roles (role_key, role_name, description, active, system_role, created_at, updated_at)
VALUES
    ('COMPANY_ADMIN', 'Company Admin', 'Manages one company and its users, projects, and configuration', true, true, NOW(), NOW()),
    ('PROJECT_ADMIN', 'Project Admin', 'Manages assigned projects within one company', true, true, NOW(), NOW()),
    ('USER', 'User', 'Creates and manages assigned tickets within one company', true, true, NOW(), NOW()),
    ('GLOBAL_ADMIN', 'Global Admin', 'Manages the SupportFlow platform, companies, subscriptions, and billing', true, true, NOW(), NOW())
ON CONFLICT (role_key) DO NOTHING;

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

CREATE TABLE IF NOT EXISTS tracker.labels (
    id BIGSERIAL PRIMARY KEY,
    label_key VARCHAR(100) NOT NULL,
    label_name VARCHAR(255) NOT NULL,
    color_code VARCHAR(20),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT labels_key_unique UNIQUE (label_key),
    CONSTRAINT labels_name_unique UNIQUE (label_name)
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

-- Organization: Company Profile, Business Units, Time Zones, Locations, Holidays
CREATE TABLE IF NOT EXISTS tracker.company_profile (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    trading_name VARCHAR(255),
    registration_number VARCHAR(100),
    industry VARCHAR(100),
    logo_url VARCHAR(500),
    default_timezone VARCHAR(100),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tracker.business_units (
    id BIGSERIAL PRIMARY KEY,
    unit_code VARCHAR(100) NOT NULL,
    unit_name VARCHAR(255) NOT NULL,
    description TEXT,
    department_id BIGINT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT business_units_code_unique UNIQUE (unit_code),
    CONSTRAINT business_units_name_unique UNIQUE (unit_name),
    CONSTRAINT business_units_department_fk FOREIGN KEY (department_id) REFERENCES tracker.departments(id)
);

CREATE TABLE IF NOT EXISTS tracker.time_zones (
    id BIGSERIAL PRIMARY KEY,
    timezone_code VARCHAR(100) NOT NULL,
    timezone_name VARCHAR(255) NOT NULL,
    utc_offset VARCHAR(10) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT time_zones_code_unique UNIQUE (timezone_code),
    CONSTRAINT time_zones_name_unique UNIQUE (timezone_name)
);

CREATE TABLE IF NOT EXISTS tracker.locations (
    id BIGSERIAL PRIMARY KEY,
    location_code VARCHAR(100) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    timezone_id BIGINT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT locations_code_unique UNIQUE (location_code),
    CONSTRAINT locations_name_unique UNIQUE (location_name),
    CONSTRAINT locations_timezone_fk FOREIGN KEY (timezone_id) REFERENCES tracker.time_zones(id)
);

CREATE TABLE IF NOT EXISTS tracker.holidays (
    id BIGSERIAL PRIMARY KEY,
    holiday_date DATE NOT NULL,
    holiday_name VARCHAR(255) NOT NULL,
    holiday_type VARCHAR(50) NOT NULL DEFAULT 'PUBLIC',
    location_id BIGINT,
    recurring BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT holidays_location_fk FOREIGN KEY (location_id) REFERENCES tracker.locations(id)
);

-- Backward-compatible extension columns
ALTER TABLE tracker.departments
    ADD COLUMN IF NOT EXISTS parent_department_id BIGINT,
    ADD COLUMN IF NOT EXISTS department_head_id BIGINT,
    ADD COLUMN IF NOT EXISTS cost_center VARCHAR(100),
    ADD COLUMN IF NOT EXISTS department_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS department_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS working_hours VARCHAR(100),
    ADD COLUMN IF NOT EXISTS default_workflow_id BIGINT;

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

-- Workflow engine enhancement columns
ALTER TABLE tracker.workflow_states
    ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#6b7280';

ALTER TABLE tracker.workflow_transitions
    ADD COLUMN IF NOT EXISTS button_label VARCHAR(255),
    ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Safe foreign key additions for existing tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'departments_parent_fk' AND connamespace = 'tracker'::regnamespace
    ) THEN
        ALTER TABLE tracker.departments
            ADD CONSTRAINT departments_parent_fk
            FOREIGN KEY (parent_department_id) REFERENCES tracker.departments(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'departments_head_fk' AND connamespace = 'tracker'::regnamespace
    ) THEN
        ALTER TABLE tracker.departments
            ADD CONSTRAINT departments_head_fk
            FOREIGN KEY (department_head_id) REFERENCES tracker.users(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'departments_workflow_fk' AND connamespace = 'tracker'::regnamespace
    ) THEN
        ALTER TABLE tracker.departments
            ADD CONSTRAINT departments_workflow_fk
            FOREIGN KEY (default_workflow_id) REFERENCES tracker.workflow_definitions(id);
    END IF;
END $$;

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

-- ─── New tables: Project Members, Audit Logs, Work Logs ───────────────────────
CREATE TABLE IF NOT EXISTS tracker.project_members (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    member_role VARCHAR(100) NOT NULL DEFAULT 'MEMBER',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT project_members_project_fk FOREIGN KEY (project_id) REFERENCES tracker.projects(id),
    CONSTRAINT project_members_user_fk FOREIGN KEY (user_id) REFERENCES tracker.users(id),
    CONSTRAINT project_members_unique UNIQUE (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS tracker.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT,
    action VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    performed_by BIGINT,
    performed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(50),
    notes TEXT,
    CONSTRAINT audit_logs_performed_by_fk FOREIGN KEY (performed_by) REFERENCES tracker.users(id)
);

CREATE TABLE IF NOT EXISTS tracker.work_logs (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    hours_logged DECIMAL(5,2) NOT NULL,
    log_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT work_logs_task_fk FOREIGN KEY (task_id) REFERENCES tracker.tasks(id),
    CONSTRAINT work_logs_user_fk FOREIGN KEY (user_id) REFERENCES tracker.users(id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON tracker.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON tracker.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON tracker.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_at ON tracker.audit_logs(performed_at);
CREATE INDEX IF NOT EXISTS idx_work_logs_task_id ON tracker.work_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_work_logs_user_id ON tracker.work_logs(user_id);
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
CREATE INDEX IF NOT EXISTS idx_labels_active ON tracker.labels(active);
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
VALUES ('GLOBAL_ADMIN', 'Global Admin', 'Full platform access role', true, true, NOW(), NOW())
ON CONFLICT (role_key) DO UPDATE SET
    role_name = EXCLUDED.role_name,
    active = true,
    system_role = true,
    updated_at = NOW();

INSERT INTO tracker.permissions (permission_key, permission_name, module_name, description, active, created_at, updated_at)
VALUES ('GLOBAL_ADMIN', 'Global Admin Access', 'SYSTEM', 'Global full access permission', true, NOW(), NOW())
ON CONFLICT (permission_key) DO UPDATE SET
    permission_name = EXCLUDED.permission_name,
    active = true,
    updated_at = NOW();

INSERT INTO tracker.users (employee_id, full_name, email, role, active, created_at, updated_at, department_id, password_hash)
VALUES (
    'EMPADMIN',
    'System Administrator',
    'admin@project.local',
    'GLOBAL_ADMIN',
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
JOIN tracker.roles r ON r.role_key = 'GLOBAL_ADMIN'
WHERE u.email = 'admin@project.local'
ON CONFLICT (user_id, role_id) DO UPDATE SET
    active = true,
    assigned_at = NOW();

INSERT INTO tracker.role_permissions (role_id, permission_id, granted_at, granted_by)
SELECT r.id, p.id, NOW(), u.id
FROM tracker.roles r
JOIN tracker.permissions p ON p.permission_key = 'GLOBAL_ADMIN'
JOIN tracker.users u ON u.email = 'admin@project.local'
WHERE r.role_key = 'GLOBAL_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO tracker.api_permission_rules (rule_name, http_method, path_pattern, permission_id, active, created_at, updated_at)
SELECT 'ADMIN_GET_ALL', 'GET', '/api/admin/**', p.id, true, NOW(), NOW()
FROM tracker.permissions p
WHERE p.permission_key = 'GLOBAL_ADMIN'
ON CONFLICT (rule_name) DO UPDATE SET active = true, updated_at = NOW();

INSERT INTO tracker.api_permission_rules (rule_name, http_method, path_pattern, permission_id, active, created_at, updated_at)
SELECT 'ADMIN_POST_ALL', 'POST', '/api/admin/**', p.id, true, NOW(), NOW()
FROM tracker.permissions p
WHERE p.permission_key = 'GLOBAL_ADMIN'
ON CONFLICT (rule_name) DO UPDATE SET active = true, updated_at = NOW();

INSERT INTO tracker.api_permission_rules (rule_name, http_method, path_pattern, permission_id, active, created_at, updated_at)
SELECT 'ADMIN_PUT_ALL', 'PUT', '/api/admin/**', p.id, true, NOW(), NOW()
FROM tracker.permissions p
WHERE p.permission_key = 'GLOBAL_ADMIN'
ON CONFLICT (rule_name) DO UPDATE SET active = true, updated_at = NOW();

INSERT INTO tracker.api_permission_rules (rule_name, http_method, path_pattern, permission_id, active, created_at, updated_at)
SELECT 'ADMIN_DELETE_ALL', 'DELETE', '/api/admin/**', p.id, true, NOW(), NOW()
FROM tracker.permissions p
WHERE p.permission_key = 'GLOBAL_ADMIN'
ON CONFLICT (rule_name) DO UPDATE SET active = true, updated_at = NOW();

INSERT INTO tracker.api_permission_rules (rule_name, http_method, path_pattern, permission_id, active, created_at, updated_at)
SELECT 'ADMIN_PATCH_ALL', 'PATCH', '/api/admin/**', p.id, true, NOW(), NOW()
FROM tracker.permissions p
WHERE p.permission_key = 'GLOBAL_ADMIN'
ON CONFLICT (rule_name) DO UPDATE SET active = true, updated_at = NOW();

-- Least-privilege tenant roles. Global Admin remains enforced separately by role.
INSERT INTO tracker.permissions (permission_key, permission_name, module_name, description, active, created_at, updated_at)
VALUES
    ('COMPANY_ADMIN_ACCESS', 'Company Administration Access', 'TENANT', 'Manage users, projects, and tenant configuration', true, NOW(), NOW()),
    ('PROJECT_ADMIN_ACCESS', 'Project Administration Access', 'PROJECT', 'Manage assigned project members, workflows, and tickets', true, NOW(), NOW()),
    ('TICKET_USER_ACCESS', 'Ticket User Access', 'TICKETS', 'Create, update owned, and view tenant tickets', true, NOW(), NOW())
ON CONFLICT (permission_key) DO UPDATE SET active = true, updated_at = NOW();

INSERT INTO tracker.role_permissions (role_id, permission_id, granted_at)
SELECT r.id, p.id, NOW()
FROM tracker.roles r
JOIN tracker.permissions p ON (r.role_key = 'COMPANY_ADMIN' AND p.permission_key IN ('COMPANY_ADMIN_ACCESS', 'PROJECT_ADMIN_ACCESS', 'TICKET_USER_ACCESS'))
    OR (r.role_key = 'PROJECT_ADMIN' AND p.permission_key IN ('PROJECT_ADMIN_ACCESS', 'TICKET_USER_ACCESS'))
    OR (r.role_key = 'USER' AND p.permission_key = 'TICKET_USER_ACCESS')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO tracker.api_permission_rules (rule_name, http_method, path_pattern, permission_id, active, created_at, updated_at)
SELECT rule_name, http_method, path_pattern, p.id, true, NOW(), NOW()
FROM (VALUES
    ('COMPANY_USERS_GET', 'GET', '/api/users/**', 'COMPANY_ADMIN_ACCESS'),
    ('COMPANY_USERS_POST', 'POST', '/api/users/**', 'COMPANY_ADMIN_ACCESS'),
    ('COMPANY_USERS_PUT', 'PUT', '/api/users/**', 'COMPANY_ADMIN_ACCESS'),
    ('COMPANY_USERS_DELETE', 'DELETE', '/api/users/**', 'COMPANY_ADMIN_ACCESS'),
    ('COMPANY_PROJECTS_POST', 'POST', '/api/projects/**', 'COMPANY_ADMIN_ACCESS'),
    ('COMPANY_PROJECTS_PUT', 'PUT', '/api/projects/**', 'COMPANY_ADMIN_ACCESS'),
    ('COMPANY_PROJECTS_DELETE', 'DELETE', '/api/projects/**', 'COMPANY_ADMIN_ACCESS'),
    ('COMPANY_ORGANIZATION_GET', 'GET', '/api/admin/organization/**', 'COMPANY_ADMIN_ACCESS'),
    ('COMPANY_ORGANIZATION_POST', 'POST', '/api/admin/organization/**', 'COMPANY_ADMIN_ACCESS'),
    ('COMPANY_ORGANIZATION_PUT', 'PUT', '/api/admin/organization/**', 'COMPANY_ADMIN_ACCESS'),
    ('COMPANY_ORGANIZATION_DELETE', 'DELETE', '/api/admin/organization/**', 'COMPANY_ADMIN_ACCESS'),
    ('COMPANY_ROLE_ASSIGN', 'POST', '/api/admin/roles/assignments/users', 'COMPANY_ADMIN_ACCESS'),
    ('COMPANY_ROLE_UNASSIGN', 'DELETE', '/api/admin/roles/assignments/users/**', 'COMPANY_ADMIN_ACCESS'),
    ('COMPANY_ROLE_GET', 'GET', '/api/admin/roles/**', 'COMPANY_ADMIN_ACCESS'),
    ('COMPANY_MEMBERS_GET', 'GET', '/api/admin/project-members/**', 'COMPANY_ADMIN_ACCESS'),
    ('COMPANY_MEMBERS_POST', 'POST', '/api/admin/project-members/**', 'COMPANY_ADMIN_ACCESS'),
    ('COMPANY_MEMBERS_PUT', 'PUT', '/api/admin/project-members/**', 'COMPANY_ADMIN_ACCESS'),
    ('COMPANY_MEMBERS_DELETE', 'DELETE', '/api/admin/project-members/**', 'COMPANY_ADMIN_ACCESS'),
    ('PROJECT_MEMBERS_GET', 'GET', '/api/admin/project-members/**', 'PROJECT_ADMIN_ACCESS'),
    ('PROJECT_MEMBERS_POST', 'POST', '/api/admin/project-members/**', 'PROJECT_ADMIN_ACCESS'),
    ('PROJECT_MEMBERS_PUT', 'PUT', '/api/admin/project-members/**', 'PROJECT_ADMIN_ACCESS'),
    ('PROJECT_MEMBERS_DELETE', 'DELETE', '/api/admin/project-members/**', 'PROJECT_ADMIN_ACCESS'),
    ('PROJECT_WORKFLOWS_GET', 'GET', '/api/admin/workflows/**', 'PROJECT_ADMIN_ACCESS'),
    ('PROJECT_WORKFLOWS_POST', 'POST', '/api/admin/workflows/**', 'PROJECT_ADMIN_ACCESS'),
    ('PROJECT_WORKFLOWS_PUT', 'PUT', '/api/admin/workflows/**', 'PROJECT_ADMIN_ACCESS'),
    ('PROJECT_WORKFLOWS_DELETE', 'DELETE', '/api/admin/workflows/**', 'PROJECT_ADMIN_ACCESS'),
    ('TICKETS_READ', 'GET', '/api/projects/**', 'TICKET_USER_ACCESS'),
    ('TASKS_READ', 'GET', '/api/tasks/**', 'TICKET_USER_ACCESS'),
    ('TASKS_CREATE', 'POST', '/api/tasks', 'TICKET_USER_ACCESS'),
    ('TASKS_UPDATE', 'PUT', '/api/tasks/**', 'TICKET_USER_ACCESS'),
    ('TASKS_COMMENT', 'POST', '/api/tasks/*/comments', 'TICKET_USER_ACCESS'),
    ('TASKS_ATTACHMENT', 'POST', '/api/attachments/task/**', 'TICKET_USER_ACCESS')
) AS rules(rule_name, http_method, path_pattern, permission_key)
JOIN tracker.permissions p ON p.permission_key = rules.permission_key
ON CONFLICT (rule_name) DO UPDATE SET
    http_method = EXCLUDED.http_method,
    path_pattern = EXCLUDED.path_pattern,
    permission_id = EXCLUDED.permission_id,
    active = true,
    updated_at = NOW();

INSERT INTO tracker.task_statuses (status_key, status_name, description, display_order, color_code, is_terminal, active, created_at, updated_at)
VALUES
('TODO', 'To Do', 'Work not started', 1, '#6b7280', false, true, NOW(), NOW()),
('OPEN', 'Open', 'Ready to be worked on', 2, '#0ea5e9', false, true, NOW(), NOW()),
('WAITING', 'Waiting', 'Paused for pending input', 3, '#f59e0b', false, true, NOW(), NOW()),
('IN_PROGRESS', 'In Progress', 'Work in progress', 4, '#2563eb', false, true, NOW(), NOW()),
('BLOCKED', 'Blocked', 'Cannot proceed due to hard dependency', 5, '#ef4444', false, true, NOW(), NOW()),
('REOPENED', 'Reopened', 'Previously closed, reopened for rework', 6, '#f97316', false, true, NOW(), NOW()),
('SCHEDULED', 'Scheduled', 'Planned for a future start', 7, '#6366f1', false, true, NOW(), NOW()),
('OVERDUE', 'Overdue', 'Past target date and still unresolved', 8, '#dc2626', false, true, NOW(), NOW()),
('DONE', 'Done', 'Work completed', 9, '#16a34a', true, true, NOW(), NOW()),
('COMPLETED', 'Completed', 'Work completed', 10, '#22c55e', true, true, NOW(), NOW())
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

-- OPEN mirrors the legacy "Open" status string tasks already have
WITH wf AS (
    SELECT id FROM tracker.workflow_definitions WHERE workflow_key = 'TASK_DEFAULT'
)
INSERT INTO tracker.workflow_states (workflow_id, state_key, state_name, description, display_order, is_initial, is_terminal, active, created_at, updated_at)
SELECT wf.id, 'OPEN', 'Open', 'Ready to be worked on', 6, false, false, true, NOW(), NOW() FROM wf
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

-- REOPENED: previously closed; is_terminal=false so work can resume
WITH wf AS (
    SELECT id FROM tracker.workflow_definitions WHERE workflow_key = 'TASK_DEFAULT'
)
INSERT INTO tracker.workflow_states (workflow_id, state_key, state_name, description, display_order, is_initial, is_terminal, active, created_at, updated_at)
SELECT wf.id, 'REOPENED', 'Reopened', 'Previously closed, reopened for rework', 4, false, false, true, NOW(), NOW() FROM wf
ON CONFLICT (workflow_id, state_key) DO UPDATE SET
    state_name = EXCLUDED.state_name, active = true, updated_at = NOW();

-- BLOCKED: stuck waiting on external dependency
WITH wf AS (
    SELECT id FROM tracker.workflow_definitions WHERE workflow_key = 'TASK_DEFAULT'
)
INSERT INTO tracker.workflow_states (workflow_id, state_key, state_name, description, display_order, is_initial, is_terminal, active, created_at, updated_at)
SELECT wf.id, 'BLOCKED', 'Blocked', 'Ticket blocked waiting on dependency', 5, false, false, true, NOW(), NOW() FROM wf
ON CONFLICT (workflow_id, state_key) DO UPDATE SET
    state_name = EXCLUDED.state_name, active = true, updated_at = NOW();

-- START: To Do → In Progress
WITH wf AS (
    SELECT id FROM tracker.workflow_definitions WHERE workflow_key = 'TASK_DEFAULT'
),
st_todo AS (
    SELECT id FROM tracker.workflow_states WHERE workflow_id = (SELECT id FROM wf) AND state_key = 'TODO'
),
st_progress AS (
    SELECT id FROM tracker.workflow_states WHERE workflow_id = (SELECT id FROM wf) AND state_key = 'IN_PROGRESS'
)
INSERT INTO tracker.workflow_transitions (workflow_id, from_state_id, to_state_id, transition_key, transition_name, requires_comment, active, created_at, updated_at)
SELECT (SELECT id FROM wf), (SELECT id FROM st_todo), (SELECT id FROM st_progress), 'START', 'Start Progress', false, true, NOW(), NOW()
ON CONFLICT (workflow_id, transition_key) DO UPDATE SET
    active = true,
    updated_at = NOW();

-- START_FROM_OPEN: Open → In Progress (covers tasks with legacy "Open" status)
WITH wf AS (
    SELECT id FROM tracker.workflow_definitions WHERE workflow_key = 'TASK_DEFAULT'
),
st_open AS (
    SELECT id FROM tracker.workflow_states WHERE workflow_id = (SELECT id FROM wf) AND state_key = 'OPEN'
),
st_progress AS (
    SELECT id FROM tracker.workflow_states WHERE workflow_id = (SELECT id FROM wf) AND state_key = 'IN_PROGRESS'
)
INSERT INTO tracker.workflow_transitions (workflow_id, from_state_id, to_state_id, transition_key, transition_name, requires_comment, active, created_at, updated_at)
SELECT (SELECT id FROM wf), (SELECT id FROM st_open), (SELECT id FROM st_progress), 'START_FROM_OPEN', 'Start Progress', false, true, NOW(), NOW()
ON CONFLICT (workflow_id, transition_key) DO UPDATE SET active = true, updated_at = NOW();

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

-- REOPEN: Done → Reopened; requires comment explaining why
WITH wf AS (SELECT id FROM tracker.workflow_definitions WHERE workflow_key = 'TASK_DEFAULT'),
st_done     AS (SELECT id FROM tracker.workflow_states WHERE workflow_id = (SELECT id FROM wf) AND state_key = 'DONE'),
st_reopened AS (SELECT id FROM tracker.workflow_states WHERE workflow_id = (SELECT id FROM wf) AND state_key = 'REOPENED')
INSERT INTO tracker.workflow_transitions (workflow_id, from_state_id, to_state_id, transition_key, transition_name, requires_comment, active, created_at, updated_at)
SELECT (SELECT id FROM wf), (SELECT id FROM st_done), (SELECT id FROM st_reopened), 'REOPEN', 'Reopen Ticket', true, true, NOW(), NOW()
ON CONFLICT (workflow_id, transition_key) DO UPDATE SET active = true, requires_comment = true, updated_at = NOW();

-- RESTART: Reopened → In Progress
WITH wf AS (SELECT id FROM tracker.workflow_definitions WHERE workflow_key = 'TASK_DEFAULT'),
st_reopened AS (SELECT id FROM tracker.workflow_states WHERE workflow_id = (SELECT id FROM wf) AND state_key = 'REOPENED'),
st_progress AS (SELECT id FROM tracker.workflow_states WHERE workflow_id = (SELECT id FROM wf) AND state_key = 'IN_PROGRESS')
INSERT INTO tracker.workflow_transitions (workflow_id, from_state_id, to_state_id, transition_key, transition_name, requires_comment, active, created_at, updated_at)
SELECT (SELECT id FROM wf), (SELECT id FROM st_reopened), (SELECT id FROM st_progress), 'RESTART', 'Restart Work', false, true, NOW(), NOW()
ON CONFLICT (workflow_id, transition_key) DO UPDATE SET active = true, updated_at = NOW();

-- BLOCK: In Progress → Blocked; requires comment describing the blocker
WITH wf AS (SELECT id FROM tracker.workflow_definitions WHERE workflow_key = 'TASK_DEFAULT'),
st_progress AS (SELECT id FROM tracker.workflow_states WHERE workflow_id = (SELECT id FROM wf) AND state_key = 'IN_PROGRESS'),
st_blocked  AS (SELECT id FROM tracker.workflow_states WHERE workflow_id = (SELECT id FROM wf) AND state_key = 'BLOCKED')
INSERT INTO tracker.workflow_transitions (workflow_id, from_state_id, to_state_id, transition_key, transition_name, requires_comment, active, created_at, updated_at)
SELECT (SELECT id FROM wf), (SELECT id FROM st_progress), (SELECT id FROM st_blocked), 'BLOCK', 'Mark as Blocked', true, true, NOW(), NOW()
ON CONFLICT (workflow_id, transition_key) DO UPDATE SET active = true, requires_comment = true, updated_at = NOW();

-- UNBLOCK: Blocked → In Progress
WITH wf AS (SELECT id FROM tracker.workflow_definitions WHERE workflow_key = 'TASK_DEFAULT'),
st_blocked  AS (SELECT id FROM tracker.workflow_states WHERE workflow_id = (SELECT id FROM wf) AND state_key = 'BLOCKED'),
st_progress AS (SELECT id FROM tracker.workflow_states WHERE workflow_id = (SELECT id FROM wf) AND state_key = 'IN_PROGRESS')
INSERT INTO tracker.workflow_transitions (workflow_id, from_state_id, to_state_id, transition_key, transition_name, requires_comment, active, created_at, updated_at)
SELECT (SELECT id FROM wf), (SELECT id FROM st_blocked), (SELECT id FROM st_progress), 'UNBLOCK', 'Unblock', false, true, NOW(), NOW()
ON CONFLICT (workflow_id, transition_key) DO UPDATE SET active = true, updated_at = NOW();

WITH role_admin AS (
    SELECT id FROM tracker.roles WHERE role_key = 'GLOBAL_ADMIN'
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
    category_id = COALESCE(category_id, (SELECT id FROM tracker.task_categories WHERE category_key = 'GENERAL'));

-- Sync workflow_state_id to match the task's actual status string.
-- This runs every time schema.sql is applied so stale/mismatched states are corrected.
UPDATE tracker.tasks t
SET workflow_state_id = (
    SELECT ws.id
    FROM tracker.workflow_states ws
    JOIN tracker.workflow_definitions wd ON wd.id = ws.workflow_id
    WHERE wd.workflow_key = 'TASK_DEFAULT'
      AND LOWER(ws.state_name) = LOWER(t.status)
    LIMIT 1
)
WHERE (
    -- no state assigned yet
    t.workflow_state_id IS NULL
    OR
    -- state is assigned but its name no longer matches the task's status string
    NOT EXISTS (
        SELECT 1
        FROM tracker.workflow_states ws
        JOIN tracker.workflow_definitions wd ON wd.id = ws.workflow_id
        WHERE ws.id = t.workflow_state_id
          AND wd.workflow_key = 'TASK_DEFAULT'
          AND LOWER(ws.state_name) = LOWER(t.status)
    )
)
AND EXISTS (
    -- only update if a matching workflow state actually exists
    SELECT 1
    FROM tracker.workflow_states ws
    JOIN tracker.workflow_definitions wd ON wd.id = ws.workflow_id
    WHERE wd.workflow_key = 'TASK_DEFAULT'
      AND LOWER(ws.state_name) = LOWER(t.status)
);

-- Fallback: any task that still has no workflow_state_id gets the initial (To Do) state
UPDATE tracker.tasks t
SET workflow_state_id = (
    SELECT ws.id
    FROM tracker.workflow_states ws
    JOIN tracker.workflow_definitions wd ON wd.id = ws.workflow_id
    WHERE wd.workflow_key = 'TASK_DEFAULT' AND ws.is_initial = true
    LIMIT 1
)
WHERE t.workflow_state_id IS NULL;