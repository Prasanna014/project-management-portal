# Admin Perspective Enterprise Readiness

## What admins should control
- User lifecycle: invite, activate, suspend, offboard, archive.
- Role and permission mapping using the existing backend role-permission model.
- Department, business unit, location, and workflow governance.
- Knowledge base taxonomy, retention, recovery, and final purge controls.
- Audit review for user changes, document recovery, permission updates, and workflow modifications.

## Recommended admin powers
### Platform Admin
- Full access to users, roles, permissions, workflows, and system logs
- Can restore deleted knowledge files for up to 60 days
- Can approve retention overrides and permanent purge jobs

### PMO / Governance Admin
- Manage project standards, reporting structures, templates, and SOP publishing
- Review portfolio health and organizational compliance

### Knowledge Curator / Documentation Admin
- Manage document metadata, versions, review cycles, approvals, and information architecture

## Current enterprise gaps observed
- Authentication and authorization are still not production-grade; the project needs hardened auth, SSO, and directory integration.
- No dedicated backend knowledge base domain exists yet for document metadata, versioning, or retention jobs.
- OpenAPI/Swagger, test automation, and migration tooling are still missing from the platform roadmap.
- Some legacy front-end pages are still outside the TypeScript app shell.
- Secrets and environment hardening need stronger production treatment according to the current readiness report.

## Admin improvements recommended next
1. Move from single-string `role` on users to many-to-many user-role assignments everywhere.
2. Add SCIM/SSO onboarding and offboarding before enterprise rollout.
3. Add approval workflows for high-risk changes such as permission changes, retention overrides, and workflow edits.
4. Add audit dashboards for access changes, inactive accounts, failed logins, and deleted document restores.
5. Add scheduled retention jobs with evidence logs for final purge after the admin recovery window expires.

## Knowledge base governance policy
- User restore window: 30 days
- Admin restore window: 60 days
- Final purge: after day 60
- Mandatory metadata: owner, department, confidentiality, review date, document type, version
- Mandatory controls: malware scanning, extension validation, audit trail, version history

## Success criteria
- Admins can govern the platform without direct database changes.
- Access decisions are role-based, auditable, and reversible.
- Document lifecycle rules are clear and consistently enforced.
- Offboarding and deprovisioning can be completed safely within policy.
