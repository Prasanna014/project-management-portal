import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Chip, MenuItem, Pagination, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { httpClient } from "@shared/api/httpClient";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { LoadingState } from "@shared/ui/states/LoadingState";
import type { PagedResponse } from "@shared/types/pagination";

type AuditLogRecord = {
  id: number;
  entityType: string;
  entityId?: number | null;
  action: string;
  oldValue?: string | null;
  newValue?: string | null;
  performedBy?: number | null;
  performedByName?: string | null;
  performedAt?: string | null;
  notes?: string | null;
};

type AuditFilterPreset = "all" | "user-lifecycle" | "knowledge-base";

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function truncate(value?: string | null, max = 80) {
  if (!value) {
    return "-";
  }
  return value.length <= max ? value : `${value.slice(0, max)}...`;
}

export function AuditLogsPanel() {
  const [preset, setPreset] = useState<AuditFilterPreset>("all");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const size = 20;

  const entityType = useMemo(() => {
    if (preset === "user-lifecycle") {
      return "USER";
    }
    if (preset === "knowledge-base") {
      return "KNOWLEDGE_DOCUMENT";
    }
    return undefined;
  }, [preset]);

  const auditLogsQuery = useQuery({
    queryKey: ["audit-logs-panel", preset, keyword, page],
    queryFn: async () => {
      const response = await httpClient.get<PagedResponse<AuditLogRecord>>("/admin/audit-logs", {
        params: {
          entityType,
          keyword: keyword.trim() || undefined,
          page,
          size,
          sortBy: "performedAt",
          sortDir: "desc",
        },
      });
      return response.data;
    },
  });

  const rows = auditLogsQuery.data?.content ?? [];

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={1.25}>
          <Box>
            <Typography variant="h5">Audit Logs</Typography>
            <Typography variant="body2" color="text.secondary">
              Filter user lifecycle actions and knowledge-base events without losing access to the full enterprise audit trail.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <TextField
              select
              size="small"
              label="Audit scope"
              value={preset}
              onChange={(event) => {
                setPreset(event.target.value as AuditFilterPreset);
                setPage(0);
              }}
              sx={{ minWidth: { xs: "100%", md: 260 } }}
            >
              <MenuItem value="all">All audit events</MenuItem>
              <MenuItem value="user-lifecycle">User lifecycle only</MenuItem>
              <MenuItem value="knowledge-base">Knowledge base only</MenuItem>
            </TextField>
            <TextField
              size="small"
              fullWidth
              label="Search action, notes, or entity details"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(0);
              }}
            />
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`Scope: ${preset.replaceAll("-", " ")}`} color="primary" variant="outlined" />
            <Chip label={`${auditLogsQuery.data?.totalElements ?? 0} matching events`} variant="outlined" />
          </Stack>
        </Stack>
      </Paper>

      {auditLogsQuery.isLoading ? <LoadingState variant="table" rows={8} /> : null}
      {auditLogsQuery.isError ? <ErrorState message="Unable to load audit logs." onRetry={() => auditLogsQuery.refetch()} /> : null}

      {!auditLogsQuery.isLoading && !auditLogsQuery.isError ? (
        <Paper sx={{ p: 2 }}>
          {rows.length === 0 ? (
            <Alert severity="info">No audit logs match the current filter.</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Entity Type</TableCell>
                    <TableCell>Entity ID</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Performed By</TableCell>
                    <TableCell>Performed At</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Before</TableCell>
                    <TableCell>After</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.entityType}</TableCell>
                      <TableCell>{row.entityId ?? "-"}</TableCell>
                      <TableCell>{row.action}</TableCell>
                      <TableCell>{row.performedByName ?? row.performedBy ?? "-"}</TableCell>
                      <TableCell>{formatDate(row.performedAt)}</TableCell>
                      <TableCell>{truncate(row.notes)}</TableCell>
                      <TableCell>{truncate(row.oldValue)}</TableCell>
                      <TableCell>{truncate(row.newValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Pagination
              count={Math.max(1, auditLogsQuery.data?.totalPages ?? 1)}
              page={page + 1}
              onChange={(_, nextPage) => setPage(nextPage - 1)}
              color="primary"
            />
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}
