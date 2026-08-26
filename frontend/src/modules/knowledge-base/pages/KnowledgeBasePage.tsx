import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import LibraryBooksRoundedIcon from "@mui/icons-material/LibraryBooksRounded";
import RestoreFromTrashRoundedIcon from "@mui/icons-material/RestoreFromTrashRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildActionPermissionCandidates, buildReadPermissionCandidates } from "@shared/auth/permissions";
import { EmptyState } from "@shared/ui/states/EmptyState";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { LoadingState } from "@shared/ui/states/LoadingState";
import { PageSnackbar, type SnackbarSeverity } from "@shared/ui/feedback/PageSnackbar";
import {
  ADMIN_RESTORE_WINDOW_DAYS,
  EXTENSION_POLICIES,
  getDaysSince,
  IMPLEMENTATION_BACKLOG,
  USER_RESTORE_WINDOW_DAYS,
} from "@modules/knowledge-base/data/knowledgeBaseData";
import {
  downloadKnowledgeDocument,
  listKnowledgeDocuments,
  restoreKnowledgeDocument,
  softDeleteKnowledgeDocument,
  updateKnowledgeDocument,
  uploadKnowledgeDocument,
  type KnowledgeDocumentRecord,
  type KnowledgeDocumentUpsertPayload,
} from "@modules/knowledge-base/services/knowledgeBaseApi";

type DialogMode = "create" | "edit" | null;

type FormState = KnowledgeDocumentUpsertPayload & {
  file: File | null;
};

const INITIAL_FORM: FormState = {
  title: "",
  category: "SOP",
  audience: "",
  description: "",
  file: null,
};

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function formatStatus(document: KnowledgeDocumentRecord) {
  if (!document.deletedAt) {
    return "Active";
  }
  return `Deleted ${getDaysSince(document.deletedAt)}d ago`;
}

function validateForm(form: FormState, dialogMode: DialogMode) {
  if (!form.title.trim()) {
    return "Title is required.";
  }
  if (!form.category.trim()) {
    return "Category is required.";
  }
  if (dialogMode === "create" && !form.file) {
    return "Choose a document file to upload.";
  }
  return null;
}

export function KnowledgeBasePage() {
  const queryClient = useQueryClient();
  const { user, hasAnyPermission } = useAuth();
  const canRead = hasAnyPermission([
    ...buildReadPermissionCandidates("knowledge-base"),
    ...buildReadPermissionCandidates("documents"),
    ...buildReadPermissionCandidates("attachments"),
  ]);
  const canCreate = hasAnyPermission(buildActionPermissionCandidates("knowledge-base", "create"));
  const canUpdate = hasAnyPermission(buildActionPermissionCandidates("knowledge-base", "update"));
  const canAccessRestoreBin = hasAnyPermission(buildReadPermissionCandidates("audit-logs"));
  const isAdmin = canAccessRestoreBin;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "deleted" | "my-deleted">("all");
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedDocument, setSelectedDocument] = useState<KnowledgeDocumentRecord | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: SnackbarSeverity }>({
    open: false,
    message: "",
    severity: "info",
  });

  const documentsQuery = useQuery({
    queryKey: ["knowledge-documents", statusFilter],
    queryFn: () =>
      listKnowledgeDocuments({
        page: 0,
        size: 200,
        sortBy: "createdAt",
        sortDir: "desc",
        includeDeleted: true,
      }),
    enabled: canRead,
  });

  const reloadDocuments = async () => {
    await queryClient.invalidateQueries({ queryKey: ["knowledge-documents"] });
  };

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const createMutation = useMutation({
    mutationFn: () => uploadKnowledgeDocument(form.file!, form),
    onSuccess: async () => {
      await reloadDocuments();
      setDialogMode(null);
      setSelectedDocument(null);
      setForm(INITIAL_FORM);
      setFormError(null);
      showSnackbar("Knowledge document uploaded successfully.", "success");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unable to upload document.";
      setFormError(message);
      showSnackbar(message, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateKnowledgeDocument(selectedDocument!.id, {
        title: form.title,
        category: form.category,
        audience: form.audience,
        description: form.description,
      }),
    onSuccess: async () => {
      await reloadDocuments();
      setDialogMode(null);
      setSelectedDocument(null);
      setForm(INITIAL_FORM);
      setFormError(null);
      showSnackbar("Knowledge document metadata updated.", "success");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unable to update document.";
      setFormError(message);
      showSnackbar(message, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: number) => softDeleteKnowledgeDocument(documentId),
    onSuccess: async () => {
      await reloadDocuments();
      showSnackbar("Document moved to soft-delete state.", "success");
    },
    onError: (error) => showSnackbar(error instanceof Error ? error.message : "Unable to delete document.", "error"),
  });

  const restoreMutation = useMutation({
    mutationFn: (documentId: number) => restoreKnowledgeDocument(documentId),
    onSuccess: async () => {
      await reloadDocuments();
      showSnackbar("Document restored successfully.", "success");
    },
    onError: (error) => showSnackbar(error instanceof Error ? error.message : "Unable to restore document.", "error"),
  });

  const filteredDocuments = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (documentsQuery.data?.content ?? []).filter((document) => {
      const matchesSearch = keyword
        ? [document.title, document.category, document.audience ?? "", document.fileName, document.uploadedByName ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(keyword)
        : true;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? !document.deletedAt
            : statusFilter === "deleted"
              ? Boolean(document.deletedAt)
              : Boolean(document.deletedAt) && Number(document.deletedBy) === Number(user?.userId);
      return matchesSearch && matchesStatus;
    });
  }, [documentsQuery.data?.content, search, statusFilter, user?.userId]);

  const stats = useMemo(() => {
    const rows = documentsQuery.data?.content ?? [];
    return {
      total: rows.length,
      active: rows.filter((row) => !row.deletedAt).length,
      deleted: rows.filter((row) => Boolean(row.deletedAt)).length,
      markdown: rows.filter((row) => (row.fileExtension ?? "").toLowerCase() === "md").length,
    };
  }, [documentsQuery.data?.content]);

  const canManageDocument = (document: KnowledgeDocumentRecord) =>
    canUpdate && (isAdmin || Number(document.uploadedBy) === Number(user?.userId));

  const canRestoreDocument = (document: KnowledgeDocumentRecord) => {
    if (!document.deletedAt) {
      return false;
    }
    const days = getDaysSince(document.deletedAt);
    if (isAdmin) {
      return days <= ADMIN_RESTORE_WINDOW_DAYS;
    }
    return Number(document.deletedBy) === Number(user?.userId) && days <= USER_RESTORE_WINDOW_DAYS;
  };

  const openCreateDialog = () => {
    setSelectedDocument(null);
    setForm(INITIAL_FORM);
    setFormError(null);
    setDialogMode("create");
  };

  const openEditDialog = (document: KnowledgeDocumentRecord) => {
    setSelectedDocument(document);
    setForm({
      title: document.title,
      category: document.category,
      audience: document.audience ?? "",
      description: document.description ?? "",
      file: null,
    });
    setFormError(null);
    setDialogMode("edit");
  };

  const handleSubmit = () => {
    const validationError = validateForm(form, dialogMode);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    if (dialogMode === "create") {
      createMutation.mutate();
      return;
    }
    if (dialogMode === "edit") {
      updateMutation.mutate();
    }
  };

  if (!canRead) {
    return <Alert severity="warning">You do not have read permission for the knowledge base.</Alert>;
  }

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
              <Chip label="Knowledge governance + storage" sx={{ alignSelf: "flex-start", bgcolor: "#dcfce7", color: "#166534", fontWeight: 700 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
                Knowledge Base
              </Typography>
              <Typography sx={{ color: "#475569", maxWidth: 680 }}>
                Store SOPs, runbooks, reports, media, packaged handovers, and Markdown knowledge articles with real backend persistence, soft delete, and governed recovery.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.1} flexWrap="wrap">
                <Chip icon={<DescriptionRoundedIcon />} label={`${stats.total} documents`} sx={{ bgcolor: "#ffffff", color: "#0f172a", fontWeight: 600 }} />
                <Chip icon={<RestoreFromTrashRoundedIcon />} label={`${stats.deleted} soft deleted`} sx={{ bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 700 }} />
                <Chip icon={<LibraryBooksRoundedIcon />} label={`${stats.markdown} markdown articles`} sx={{ bgcolor: "#ede9fe", color: "#6d28d9", fontWeight: 700 }} />
              </Stack>
            </Stack>

            <Stack spacing={1.2} alignItems={{ xs: "stretch", xl: "flex-end" }}>
              {canAccessRestoreBin ? (
                <Button component={RouterLink} to="/knowledge-base/restore-bin" variant="outlined" sx={{ textTransform: "none", borderRadius: 999 }}>
                  Open Admin Restore Bin
                </Button>
              ) : null}
              {canCreate ? (
                <Button variant="contained" startIcon={<UploadFileRoundedIcon />} onClick={openCreateDialog} sx={{ textTransform: "none", borderRadius: 999 }}>
                  Upload document
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Alert severity="info">
        The backend accepts any file extension for knowledge storage, including <strong>.md</strong> for Markdown-based SOPs and knowledge articles.
      </Alert>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" },
        }}
      >
        {[
          { label: "Active documents", value: stats.active, tone: "#166534" },
          { label: "Deleted documents", value: stats.deleted, tone: "#1d4ed8" },
          { label: "User restore window", value: `${USER_RESTORE_WINDOW_DAYS} days`, tone: "#9a3412" },
          { label: "Admin restore window", value: `${ADMIN_RESTORE_WINDOW_DAYS} days`, tone: "#6d28d9" },
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
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ flexGrow: 1 }}>
            <TextField size="small" fullWidth label="Search documents" value={search} onChange={(event) => setSearch(event.target.value)} />
            <TextField select size="small" label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} sx={{ minWidth: { xs: "100%", md: 180 } }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="deleted">Deleted</MenuItem>
              <MenuItem value="my-deleted">My deleted</MenuItem>
            </TextField>
          </Stack>
          <Button variant="outlined" onClick={() => documentsQuery.refetch()} sx={{ textTransform: "none" }}>
            Refresh
          </Button>
        </Stack>

        <Box sx={{ mt: 2 }}>
          {documentsQuery.isLoading ? (
            <LoadingState variant="table" rows={6} />
          ) : documentsQuery.isError ? (
            <ErrorState message="Unable to load knowledge documents." onRetry={() => documentsQuery.refetch()} />
          ) : filteredDocuments.length === 0 ? (
            <EmptyState title="No documents found" description="Upload a knowledge file or adjust the filters." />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>File</TableCell>
                    <TableCell>Extension</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Audience</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{document.title}</TableCell>
                      <TableCell>{document.fileName}</TableCell>
                      <TableCell>{document.fileExtension ? `.${document.fileExtension}` : "-"}</TableCell>
                      <TableCell>{document.category}</TableCell>
                      <TableCell>{document.audience ?? "-"}</TableCell>
                      <TableCell>{document.uploadedByName ?? `User ${document.uploadedBy}`}</TableCell>
                      <TableCell>
                        <Chip size="small" label={formatStatus(document)} color={document.deletedAt ? "warning" : "success"} />
                      </TableCell>
                      <TableCell>{formatDate(document.updatedAt)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.75} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                          <Button size="small" startIcon={<DownloadRoundedIcon />} onClick={() => void downloadKnowledgeDocument(document.id, document.fileName)}>
                            Download
                          </Button>
                          {!document.deletedAt && canManageDocument(document) ? (
                            <>
                              <Button size="small" startIcon={<EditRoundedIcon />} onClick={() => openEditDialog(document)}>
                                Edit
                              </Button>
                              <Button size="small" color="warning" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => deleteMutation.mutate(document.id)} disabled={deleteMutation.isPending}>
                                Soft delete
                              </Button>
                            </>
                          ) : null}
                          {document.deletedAt && canRestoreDocument(document) ? (
                            <Button size="small" onClick={() => restoreMutation.mutate(document.id)} disabled={restoreMutation.isPending}>
                              Restore
                            </Button>
                          ) : null}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
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
                <TableCell>Example extensions</TableCell>
                <TableCell>Primary use</TableCell>
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

      <Dialog open={dialogMode !== null} onClose={() => setDialogMode(null)} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === "create" ? "Upload knowledge document" : "Edit knowledge metadata"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}
            <TextField size="small" label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} fullWidth required />
            <TextField size="small" label="Category" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} fullWidth required />
            <TextField size="small" label="Audience" value={form.audience ?? ""} onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value }))} fullWidth />
            <TextField size="small" label="Description" value={form.description ?? ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} fullWidth multiline minRows={3} />
            {dialogMode === "create" ? (
              <Button variant="outlined" component="label" sx={{ textTransform: "none" }}>
                {form.file ? `Selected: ${form.file.name}` : "Choose file"}
                <input
                  hidden
                  type="file"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      file: event.target.files?.[0] ?? null,
                    }))
                  }
                />
              </Button>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogMode(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
            {dialogMode === "create" ? "Upload" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <PageSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((current) => ({ ...current, open: false }))} />
    </Stack>
  );
}
