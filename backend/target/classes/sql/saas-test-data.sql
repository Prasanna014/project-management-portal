-- Development/testing only. Do not execute in production.
-- Password for every test account: Test@123
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO tracker.companies (company_code, company_name, company_slug, active)
VALUES
    ('ABCOMPANY', 'AB Company', 'abcompany', true),
    ('XYZCOMPANY2', 'XYZ Company 2', 'xyzcompany2', true)
ON CONFLICT (company_code) DO NOTHING;

INSERT INTO tracker.tenant_status (company_id, status)
SELECT id, 'ACTIVE' FROM tracker.companies WHERE company_code IN ('ABCOMPANY', 'XYZCOMPANY2')
ON CONFLICT (company_id) DO UPDATE SET status = 'ACTIVE', updated_at = NOW();

INSERT INTO tracker.subscriptions (company_id, plan_id, start_date, end_date, status)
SELECT c.id, p.id, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 'ACTIVE'
FROM tracker.companies c
JOIN tracker.plans p ON p.plan_code = 'STANDARD'
WHERE c.company_code IN ('ABCOMPANY', 'XYZCOMPANY2')
  AND NOT EXISTS (SELECT 1 FROM tracker.subscriptions s WHERE s.company_id = c.id);

INSERT INTO tracker.users (employee_id, full_name, email, role, active, account_status, password_change_required, password_hash, company_id, created_at, updated_at)
VALUES
    ('GLOBAL001', 'Global Admin One', 'global.admin1@test.local', 'GLOBAL_ADMIN', true, 'ACTIVE', false, crypt('Test@123', gen_salt('bf', 10)), NULL, NOW(), NOW()),
    ('GLOBAL002', 'Global Admin Two', 'global.admin2@test.local', 'GLOBAL_ADMIN', true, 'ACTIVE', false, crypt('Test@123', gen_salt('bf', 10)), NULL, NOW(), NOW()),
    ('ABADMIN01', 'AB Company Admin', 'ab.admin@test.local', 'COMPANY_ADMIN', true, 'ACTIVE', false, crypt('Test@123', gen_salt('bf', 10)), (SELECT id FROM tracker.companies WHERE company_code = 'ABCOMPANY'), NOW(), NOW()),
    ('XYZADMIN1', 'XYZ Company Admin', 'xyz.admin@test.local', 'COMPANY_ADMIN', true, 'ACTIVE', false, crypt('Test@123', gen_salt('bf', 10)), (SELECT id FROM tracker.companies WHERE company_code = 'XYZCOMPANY2'), NOW(), NOW()),
    ('ABPROJ01', 'AB Project Admin', 'ab.project.admin@test.local', 'PROJECT_ADMIN', true, 'ACTIVE', false, crypt('Test@123', gen_salt('bf', 10)), (SELECT id FROM tracker.companies WHERE company_code = 'ABCOMPANY'), NOW(), NOW()),
    ('XYZPROJ1', 'XYZ Project Admin', 'xyz.project.admin@test.local', 'PROJECT_ADMIN', true, 'ACTIVE', false, crypt('Test@123', gen_salt('bf', 10)), (SELECT id FROM tracker.companies WHERE company_code = 'XYZCOMPANY2'), NOW(), NOW()),
    ('ABUSER001', 'AB User', 'ab.user@test.local', 'USER', true, 'ACTIVE', false, crypt('Test@123', gen_salt('bf', 10)), (SELECT id FROM tracker.companies WHERE company_code = 'ABCOMPANY'), NOW(), NOW()),
    ('XYZUSER01', 'XYZ User', 'xyz.user@test.local', 'USER', true, 'ACTIVE', false, crypt('Test@123', gen_salt('bf', 10)), (SELECT id FROM tracker.companies WHERE company_code = 'XYZCOMPANY2'), NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    active = true,
    account_status = 'ACTIVE',
    password_change_required = false,
    password_hash = EXCLUDED.password_hash,
    company_id = EXCLUDED.company_id,
    updated_at = NOW();

INSERT INTO tracker.user_roles (user_id, role_id, assigned_at, active)
SELECT u.id, r.id, NOW(), true
FROM tracker.users u
JOIN tracker.roles r ON r.role_key = u.role
WHERE u.email LIKE '%@test.local'
ON CONFLICT (user_id, role_id) DO UPDATE SET active = true, assigned_at = NOW();

INSERT INTO tracker.company_admins (company_id, user_id, active)
SELECT u.company_id, u.id, true
FROM tracker.users u
WHERE u.role = 'COMPANY_ADMIN' AND u.email LIKE '%@test.local'
ON CONFLICT (company_id, user_id) DO UPDATE SET active = true;

-- Test URLs after creating projects with project slugs:
-- https://www.dnsname.com/abcompany/projectname1/tasks
-- https://www.dnsname.com/xyzcompany2/projectname1/tasks
