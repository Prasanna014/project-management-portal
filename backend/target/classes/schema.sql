--CREATE SCHEMA IF NOT EXISTS tracker;

-- Create schema
CREATE SCHEMA IF NOT EXISTS tracker;

-- Users table
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

-- Projects table
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

-- Tasks table
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

-- Task Comments table
CREATE TABLE IF NOT EXISTS tracker.task_comments (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tracker.tasks(id),
    comment_text TEXT NOT NULL,
    commented_by BIGINT NOT NULL REFERENCES tracker.users(id),
    commented_at TIMESTAMP NOT NULL,
    CONSTRAINT task_comments_task_fk FOREIGN KEY (task_id) REFERENCES tracker.tasks(id)
);

-- Task Attachments table
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

-- Notifications table
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

-- Activity History table
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

-- Create indexes for better query performance
CREATE INDEX idx_tasks_project_id ON tracker.tasks(project_id);
CREATE INDEX idx_tasks_owner_id ON tracker.tasks(owner_id);
CREATE INDEX idx_tasks_status ON tracker.tasks(status);
CREATE INDEX idx_tasks_priority ON tracker.tasks(priority);
CREATE INDEX idx_task_comments_task_id ON tracker.task_comments(task_id);
CREATE INDEX idx_task_attachments_task_id ON tracker.task_attachments(task_id);
CREATE INDEX idx_notifications_user_id ON tracker.notifications(user_id);
CREATE INDEX idx_notifications_task_id ON tracker.notifications(task_id);
CREATE INDEX idx_activity_history_task_id ON tracker.activity_history(task_id);

-- Insert sample data for testing
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