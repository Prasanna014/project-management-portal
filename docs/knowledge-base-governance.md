# Knowledge Base Governance Blueprint

## Purpose
Create a dedicated knowledge base for SOPs, templates, policies, runbooks, training assets, and reference documents inside the project management portal.

## Recommended document categories
- SOP
- Runbook
- Policy
- Template
- Checklist
- Architecture / ADR
- Training
- Archive

## Supported extension families
### Office documents
- `.doc`, `.docx`, `.ppt`, `.pptx`, `.xls`, `.xlsx`, `.csv`

### Editable knowledge text
- `.md`, `.txt`, `.rtf`, `.pdf`

### Visual artifacts
- `.png`, `.jpg`, `.jpeg`, `.svg`, `.webp`, `.vsdx`

### Media and training
- `.mp4`, `.mov`, `.wav`

### Controlled packages
- `.zip`, `.7z`, `.json`, `.xml`

## Metadata that every document should store
- Title
- Category
- Owner
- Department
- Audience
- Confidentiality
- Version
- Effective date
- Review date
- Retention state
- Delete actor and deleted date

## Soft delete and recovery policy
- Users can restore deleted files for 30 days.
- Admins can restore deleted files for 60 days.
- After 60 days, the file should be purged permanently by a scheduled retention job.
- Purge events must remain in the audit log even after the file is removed.

## Recommended backend design
### Core entities
- `knowledge_documents`
- `knowledge_document_versions`
- `knowledge_document_tags`
- `knowledge_document_access`
- `knowledge_document_audit`
- `knowledge_document_retention_jobs`

### Core services
- Upload and extension validation
- Malware scanning
- Metadata and version management
- Preview generation
- Search and tagging
- Retention and restore orchestration

### Suggested API surface
- `GET /api/knowledge-base/documents`
- `POST /api/knowledge-base/documents`
- `PUT /api/knowledge-base/documents/{id}`
- `POST /api/knowledge-base/documents/{id}/soft-delete`
- `POST /api/knowledge-base/documents/{id}/restore`
- `GET /api/knowledge-base/documents/deleted`
- `GET /api/knowledge-base/extensions`

## Implementation priorities
1. Create database tables and storage abstraction.
2. Add upload, metadata, versioning, and restore APIs.
3. Add audit logging and retention jobs.
4. Add full-text search, preview, and approval workflow.
5. Add analytics for stale SOPs, pending reviews, and purge backlog.
