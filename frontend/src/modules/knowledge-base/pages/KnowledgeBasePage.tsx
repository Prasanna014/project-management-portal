import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AutoDeleteRoundedIcon from "@mui/icons-material/AutoDeleteRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import LibraryBooksRoundedIcon from "@mui/icons-material/LibraryBooksRounded";
import RestoreFromTrashRoundedIcon from "@mui/icons-material/RestoreFromTrashRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildReadPermissionCandidates } from "@shared/auth/permissions";
import { PageSnackbar, type SnackbarSeverity } from "@shared/ui/feedback/PageSnackbar";

type ActorRole = "user" | "admin";

type KnowledgeDocument = {
  id: number;
  title: string;
  category: string;
  extension: string;
  audience: string;
  owner: string;
  deletedAt?: string;
  deletedBy?: ActorRole;
};

type ExtensionPolicy = {
  category: string;
  extensions: string[];
  useCase: string;
  notes: string;
};

const RETENTION_WINDOWS: Record<ActorRole, number> = {
  user: 30,
  admin: 60,
};

const EXTENSION_POLICIES: ExtensionPolicy[] = [
  {
    category: "Office documents",
    extensions: [".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".csv"],
    useCase: "SOPs, policies, templates, release decks, and structured reporting.",
    notes: "Require metadata tags for owner, department, review date, and confidentiality.",
  },
  {
    category: "Knowledge-first text",
    extensions: [".md", ".txt", ".rtf", ".pdf"],
    useCase: "Runbooks, ADRs, manuals, meeting notes, published SOP packs.",
    notes: "Prefer Markdown for editable internal content and PDF for approved snapshots.",
  },
  {
    category: "Visual artifacts",
    extensions: [".png", ".jpg", ".jpeg", ".svg", ".webp", ".vsdx"],
    useCase: "Process maps, architecture diagrams, screenshots, training visuals.",
    notes: "Store alt text, source system, and linked process ID where applicable.",
  },
  {
    category: "Media and training",
    extensions: [".mp4", ".mov", ".wav"],
    useCase: "Recorded walkthroughs, training material, operational recordings.",
    notes: "Large files should move to object storage with streamed preview support.",
  },
  {
    category: "Controlled packages",
    extensions: [".zip", ".7z", ".json", ".xml"],
    useCase: "Policy bundles, import/export packages, structured reference payloads.",
    notes: "Always scan for malware and restrict public sharing or inline execution.",
  },
];

const INITIAL_DOCUMENTS: KnowledgeDocument[] = [
  { id: 1, title: "Project Intake SOP", category: "SOP", extension: ".docx", audience: "Operations", owner: "PMO Office" },
  { id: 2, title: "Incident Escalation Runbook", category: "Runbook", extension: ".md", audience: "Engineering", owner: "Platform Team" },
  { id: 3, title: "Executive Steering Template", category: "Template", extension: ".pptx", audience: "Leadership", owner: "Delivery Office" },
  { id: 4, title: "Risk Review Checklist", category: "Checklist", extension: ".pdf", audience: "Project Managers", owner: "Governance Team" },
  {
    id: 5,
    title: "Legacy Vendor SOP Archive",
    category: "Archive",
    extension: ".zip",
    audience: "Admins",
    owner: "Procurement",
    deletedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    deletedBy: "user",
  },
  {
    id: 6,
    title: "Quarterly PMO Review Pack",
    category: "Reporting",
    extension: ".xlsx",
    audience: "PMO",
    owner: "PMO Office",
    deletedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    deletedBy: "admin",
  },
  {
    id: 7,
    title: "Retired Process Draft",
    category: "Archive",
    extension: ".txt",
    audience: "Governance",
    owner: "Quality Team",
    deletedAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
    deletedBy: "admin",
  },
];

const IMPLEMENTATION_BACKLOG = [
  "Persist documents in object storage and store metadata, version history, and retention state in the database.",
  "Add antivirus scanning, MIME validation, signed download URLs, and preview generation for enterprise-safe handling.",
  "Support document approval workflows, review reminders, expirations, and mandatory reader acknowledgements for SOPs.",
  "Capture every upload, delete, restore, publish, and permission change in audit history.",
  "Add full-text search, tags, folder hierarchy, and department-based access scopes before business rollout.",
];

function getDaysSince(value?: string) {
  if (!value) {
    return 0;
  }

  const ms = Date.now() - new Date(value).getTime();
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

function canRestore(actorRole: ActorRole, deletedAt?: string) {
  if (!deletedAt) {
    return false;
  }

  return getDaysSince(deletedAt) <= RETENTION_WINDOWS[actorRole];
}

function formatDeletedStatus(document: KnowledgeDocument) {
  if (!document.deletedAt) {
    return "Active";
  }

  const days = getDaysSince(document.deletedAt);
  return `Deleted ${days}d ago`;
}

export function KnowledgeBasePage() {
  const { hasAnyPermission } = useAuth();
  const canRead = hasAnyPermission([
    ...buildReadPermissionCandidates("knowledge-base"),
    ...buildReadPermissionCandidates("documents"),
    ...buildReadPermissionCandidates("attachments"),
  ]);

  const [actorRole, setActorRole] = useState<ActorRole>("admin");
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(INITIAL_DOCUMENTS);
  const [search, setSearch] = useState("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: SnackbarSeverity }>({
    open: false,
    message: "",
    severity: "info",
  });

  const filteredDocuments = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return documents.filter((document) => {
      const haystack = `${document.title} ${document.category} ${document.extension} ${document.owner} ${document.audience}`.toLowerCase();
      return keyword ? haystack.includes(keyword) : true;
    });
  }, [documents, search]);

  const stats = useMemo(() => {
    const activeCount = documents.filter((document) => !document.deletedAt).length;
    const recoverableCount = documents.filter((document) => canRestore(actorRole, document.deletedAt)).length;
    const expiredCount = documents.filter((document) => document.deletedAt && !canRestore(actorRole, document.deletedAt)).length;

    return {
      total: documents.length,
      active: activeCount,
      recoverable: recoverableCount,
      expired: expiredCount,
    };
  }, [actorRole, documents]);

  if (!canRead) {
    return <Alert severity="warning">You do not have read permission for the knowledge base.</Alert>;
  }

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSoftDelete = (documentId: number) => {
    setDocuments((current) =>
      current.map((document) =>
        document.id === documentId
          ? { ...document, deletedAt: new Date().toISOString(), deletedBy: actorRole }
          : document
      )
    );
    showSnackbar(`Document soft deleted. ${actorRole === "admin" ? "Admins" : "Users"} can restore within ${RETENTION_WINDOWS[actorRole]} days.`, "success");
  };

  const handleRestore = (documentId: number) => {
    const document = documents.find((item) => item.id === documentId);
    if (!document || !canRestore(actorRole, document.deletedAt)) {
      showSnackbar("Restore window has expired for the selected role.", "warning");
      return;
    }

    setDocuments((current) =>
      current.map((item) =>
        item.id === documentId
          ? { ...item, deletedAt: undefined, deletedBy: undefined }
          : item
      )
    );
    showSnackbar("Document restored successfully.", "success");
  };

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 5,
          overflow: "hidden",
          background: "linear-gradient(135deg, #f8fbff 0%, #eff6ff 52%, #ecfdf5 100%)",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          boxShadow: "0 24px 50px rgba(15, 23, 42, 0.08)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.25 } }}>
          <Stack direction={{ xs: "column", xl: "row" }} spacing={2.5} justifyContent="space-between">
            <Stack spacing={1.4} sx={{ maxWidth: 760 }}>
              <Chip
                label="Knowledge governance blueprint"
                sx={{ alignSelf: "flex-start", bgcolor: "#dcfce7", color: "#166534", fontWeight: 700 }}
              />
              <Typography variant="h3" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
                Knowledge Base
              </Typography>
              <Typography sx={{ color: "#475569", maxWidth: 660 }}>
                Blueprint the SOP and document repository with enterprise-friendly extension controls, metadata,
                and role-based soft-delete recovery.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.1} flexWrap="wrap">
                <Chip icon={<DescriptionRoundedIcon />} label={`${stats.total} sample records`} sx={{ bgcolor: "#ffffff", color: "#0f172a", fontWeight: 600 }} />
                <Chip icon={<RestoreFromTrashRoundedIcon />} label={`${stats.recoverable} recoverable for ${actorRole}`} sx={{ bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 700 }} />
                <Chip icon={<AutoDeleteRoundedIcon />} label={`${stats.expired} outside restore window`} sx={{ bgcolor: "#fee2e2", color: "#b91c1c", fontWeight: 700 }} />
              </Stack>
            </Stack>

            <Paper variant="outlined" sx={{ p: 2, minWidth: { xl: 280 }, borderRadius: 4 }}>
              <Stack spacing={1.25}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  View policy as
                </Typography>
                <TextField
                  select
                  size="small"
                  value={actorRole}
                  onChange={(event) => setActorRole(event.target.value as ActorRole)}
                >
                  <MenuItem value="admin">Admin (60-day restore)</MenuItem>
                  <MenuItem value="user">User (30-day restore)</MenuItem>
                </TextField>
                <Typography variant="caption" color="text.secondary">
                  Users can restore deleted documents for 30 days. Admins can recover the same documents for up to 60 days before final purge.
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </CardContent>
      </Card>

      <Alert severity="info">
        This page is a front-end governance blueprint for now. The next step is wiring document metadata, storage,
        versioning, and retention APIs on the backend.
      </Alert>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" },
        }}
      >
        {[
          { label: "Active documents", value: stats.active, tone: "#166534", bg: "#dcfce7" },
          { label: "Recoverable now", value: stats.recoverable, tone: "#1d4ed8", bg: "#dbeafe" },
          { label: "Expired restore window", value: stats.expired, tone: "#b91c1c", bg: "#fee2e2" },
          { label: "Extension families", value: EXTENSION_POLICIES.length, tone: "#6d28d9", bg: "#ede9fe" },
        ].map((item) => (
          <Paper key={item.label} sx={{ p: 2.25, borderRadius: 4, border: "1px solid rgba(148, 163, 184, 0.18)" }}>
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 800, color: item.tone }}>
              {item.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Paper sx={{ p: 2.5, borderRadius: 4 }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2} justifyContent="space-between">
          <Stack spacing={0.7}>
            <Stack direction="row" spacing={1} alignItems="center">
              <LibraryBooksRoundedIcon color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Document library prototype
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Seeded examples of SOP, runbook, template, archive, and reporting content with role-based restore rules.
            </Typography>
          </Stack>
          <TextField
            size="small"
            label="Search documents"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ minWidth: { xs: "100%", lg: 280 } }}
          />
        </Stack>

        <TableContainer sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Extension</TableCell>
                <TableCell>Audience</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Restore</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocuments.map((document) => {
                const restoreAllowed = canRestore(actorRole, document.deletedAt);
                return (
                  <TableRow key={document.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{document.title}</TableCell>
                    <TableCell>{document.category}</TableCell>
                    <TableCell>{document.extension}</TableCell>
                    <TableCell>{document.audience}</TableCell>
                    <TableCell>{document.owner}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={formatDeletedStatus(document)}
                        color={document.deletedAt ? "warning" : "success"}
                      />
                    </TableCell>
                    <TableCell>
                      {document.deletedAt ? `${restoreAllowed ? "Allowed" : "Expired"} for ${actorRole}` : "-"}
                    </TableCell>
                    <TableCell align="right">
                      {document.deletedAt ? (
                        <Button size="small" onClick={() => handleRestore(document.id)} disabled={!restoreAllowed}>
                          Restore
                        </Button>
                      ) : (
                        <Button size="small" color="warning" onClick={() => handleSoftDelete(document.id)}>
                          Soft delete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 4 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <ShieldRoundedIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Supported extension policy
          </Typography>
        </Stack>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Extensions</TableCell>
                <TableCell>Primary use case</TableCell>
                <TableCell>Governance notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {EXTENSION_POLICIES.map((policy) => (
                <TableRow key={policy.category} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{policy.category}</TableCell>
                  <TableCell>{policy.extensions.join(", ")}</TableCell>
                  <TableCell>{policy.useCase}</TableCell>
                  <TableCell>{policy.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
          Retention and recovery rules
        </Typography>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", lg: "repeat(3, minmax(0, 1fr))" },
          }}
        >
          {[
            {
              title: "User restore window",
              description: "Users can restore their deleted documents for 30 days. After that, the item remains visible only to administrators for governance handling.",
            },
            {
              title: "Admin recovery override",
              description: "Administrators can restore or review soft-deleted files for up to 60 days, supporting compliance, audits, and accidental deletion recovery.",
            },
            {
              title: "Permanent purge",
              description: "After day 60, documents should be permanently purged by a scheduled retention job with audit evidence preserved.",
            },
          ].map((rule) => (
            <Paper key={rule.title} variant="outlined" sx={{ p: 2.25, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {rule.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {rule.description}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
          Enterprise implementation backlog
        </Typography>
        <Stack spacing={1.1}>
          {IMPLEMENTATION_BACKLOG.map((item) => (
            <Box key={item} sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#16a34a", mt: 0.9, flexShrink: 0 }} />
              <Typography variant="body2" color="text.secondary">
                {item}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      <PageSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      />
    </Stack>
  );
}
