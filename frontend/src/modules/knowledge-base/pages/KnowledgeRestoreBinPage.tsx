import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, CardContent, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import RestoreFromTrashRoundedIcon from "@mui/icons-material/RestoreFromTrashRounded";
import DeleteSweepRoundedIcon from "@mui/icons-material/DeleteSweepRounded";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildReadPermissionCandidates } from "@shared/auth/permissions";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { LoadingState } from "@shared/ui/states/LoadingState";
import { PageSnackbar, type SnackbarSeverity } from "@shared/ui/feedback/PageSnackbar";
import { ADMIN_RESTORE_WINDOW_DAYS, getDaysSince } from "@modules/knowledge-base/data/knowledgeBaseData";
import { listKnowledgeDocuments, restoreKnowledgeDocument } from "@modules/knowledge-base/services/knowledgeBaseApi";

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

export function KnowledgeRestoreBinPage() {
  const queryClient = useQueryClient();
  const { hasAnyPermission } = useAuth();
  const canAccess = hasAnyPermission(buildReadPermissionCandidates("audit-logs"));
  const [search, setSearch] = useState("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: SnackbarSeverity }>({
    open: false,
    message: "",
    severity: "info",
  });

  const deletedDocumentsQuery = useQuery({
    queryKey: ["knowledge-deleted-documents"],
    queryFn: () =>
      listKnowledgeDocuments({
        page: 0,
        size: 200,
        sortBy: "deletedAt",
        sortDir: "desc",
        includeDeleted: true,
        deletedOnly: true,
      }),
    enabled: canAccess,
  });

  const restoreMutation = useMutation({
    mutationFn: (documentId: number) => restoreKnowledgeDocument(documentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["knowledge-documents"] });
      await queryClient.invalidateQueries({ queryKey: ["knowledge-deleted-documents"] });
      setSnackbar({ open: true, message: "Knowledge document restored from admin restore bin.", severity: "success" });
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error instanceof Error ? error.message : "Unable to restore document.", severity: "error" });
    },
  });

  const filteredDocuments = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (deletedDocumentsQuery.data?.content ?? []).filter((document) => {
      const haystack = [document.title, document.category, document.fileName, document.uploadedByName ?? "", document.deletedByName ?? ""].join(" ").toLowerCase();
      return keyword ? haystack.includes(keyword) : true;
    });
  }, [deletedDocumentsQuery.data?.content, search]);

  if (!canAccess) {
    return <Alert severity="warning">Only administrators can access the knowledge restore bin.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 5,
          overflow: "hidden",
          background: "linear-gradient(135deg, #f8fbff 0%, #eff6ff 52%, #fff7ed 100%)",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          boxShadow: "0 24px 50px rgba(15, 23, 42, 0.08)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.25 } }}>
          <Stack direction={{ xs: "column", xl: "row" }} spacing={2.5} justifyContent="space-between">
            <Stack spacing={1.4} sx={{ maxWidth: 760 }}>
              <Chip label="Admin-only governance surface" sx={{ alignSelf: "flex-start", bgcolor: "#ffedd5", color: "#c2410c", fontWeight: 700 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
                Knowledge Restore Bin
              </Typography>
              <Typography sx={{ color: "#475569", maxWidth: 680 }}>
                Review soft-deleted knowledge files, recover them within the {ADMIN_RESTORE_WINDOW_DAYS}-day admin window, and let the scheduled purge remove expired records automatically.
              </Typography>
            </Stack>
            <Button component={RouterLink} to="/knowledge-base" variant="outlined" sx={{ textTransform: "none", borderRadius: 999, alignSelf: { xs: "stretch", xl: "flex-start" } }}>
              Back to Knowledge Base
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Alert severity="info">
        Scheduled purge permanently removes files after the admin restore window expires, while the audit trail remains available from Administration &gt; Audit Logs.
      </Alert>

      <Paper sx={{ p: 2.5, borderRadius: 4 }}>
        <TextField size="small" label="Search deleted documents" value={search} onChange={(event) => setSearch(event.target.value)} sx={{ minWidth: { xs: "100%", lg: 320 } }} />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.1} sx={{ mt: 2 }}>
          <Chip icon={<RestoreFromTrashRoundedIcon />} label={`${filteredDocuments.filter((document) => getDaysSince(document.deletedAt) <= ADMIN_RESTORE_WINDOW_DAYS).length} recoverable`} sx={{ bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 700 }} />
          <Chip icon={<DeleteSweepRoundedIcon />} label={`${filteredDocuments.filter((document) => getDaysSince(document.deletedAt) > ADMIN_RESTORE_WINDOW_DAYS).length} awaiting scheduled purge`} sx={{ bgcolor: "#fee2e2", color: "#b91c1c", fontWeight: 700 }} />
        </Stack>

        <Stack sx={{ mt: 2 }}>
          {deletedDocumentsQuery.isLoading ? <LoadingState variant="table" rows={6} /> : null}
          {deletedDocumentsQuery.isError ? <ErrorState message="Unable to load deleted knowledge files." onRetry={() => deletedDocumentsQuery.refetch()} /> : null}
          {!deletedDocumentsQuery.isLoading && !deletedDocumentsQuery.isError ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>File</TableCell>
                    <TableCell>Deleted By</TableCell>
                    <TableCell>Deleted At</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDocuments.map((document) => {
                    const recoverable = getDaysSince(document.deletedAt) <= ADMIN_RESTORE_WINDOW_DAYS;
                    return (
                      <TableRow key={document.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{document.title}</TableCell>
                        <TableCell>{document.fileName}</TableCell>
                        <TableCell>{document.deletedByName ?? "-"}</TableCell>
                        <TableCell>{formatDate(document.deletedAt)}</TableCell>
                        <TableCell>{document.deletedAt ? `${getDaysSince(document.deletedAt)} days` : "-"}</TableCell>
                        <TableCell>
                          <Chip size="small" label={recoverable ? "Recoverable" : "Expired"} color={recoverable ? "primary" : "warning"} />
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => restoreMutation.mutate(document.id)} disabled={!recoverable || restoreMutation.isPending}>
                            Restore
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
          {!deletedDocumentsQuery.isLoading && !deletedDocumentsQuery.isError && filteredDocuments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ pt: 2 }}>
              No deleted knowledge files match the current search.
            </Typography>
          ) : null}
        </Stack>
      </Paper>

      <PageSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((current) => ({ ...current, open: false }))} />
    </Stack>
  );
}
