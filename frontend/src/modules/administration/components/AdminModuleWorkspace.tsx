import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminNavItem } from "@app/router/navigation";
import { useAuth } from "@features/auth/context/AuthContext";
import { LoadingState } from "@shared/ui/states/LoadingState";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { EmptyState } from "@shared/ui/states/EmptyState";
import { getAdminModuleSpec } from "@modules/administration/config/adminModules";
import type { ModuleField } from "@modules/administration/config/adminModules";
import {
  createAdminRecord,
  deleteAdminRecord,
  listAdminRecords,
  updateAdminRecord,
  type AdminRecord,
} from "@modules/administration/services/adminModuleApi";
import { ConfirmActionDialog } from "@shared/ui/feedback/ConfirmActionDialog";
import { PageSnackbar, type SnackbarSeverity } from "@shared/ui/feedback/PageSnackbar";
import { buildActionPermissionCandidates } from "@shared/auth/permissions";
import { httpClient } from "@shared/api/httpClient";

type AdminModuleWorkspaceProps = {
  item: AdminNavItem;
};

type SnackbarState = { open: boolean; message: string; severity: SnackbarSeverity };

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function buildInitialForm(fields: ModuleField[]): Record<string, unknown> {
  const form: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === "boolean") form[f.name] = true;
    else if (f.type === "number") form[f.name] = "";
    else form[f.name] = "";
  }
  return form;
}

function populateForm(fields: ModuleField[], row: AdminRecord): Record<string, unknown> {
  const form: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = row[f.name];
    if (raw === null || raw === undefined) {
      form[f.name] = f.type === "boolean" ? false : "";
    } else {
      form[f.name] = raw;
    }
  }
  return form;
}

type SelectOptionsMap = Record<string, { label: string; value: unknown }[]>;

function DynamicFormField({
  field,
  value,
  onChange,
  selectOptions,
}: {
  field: ModuleField;
  value: unknown;
  onChange: (name: string, val: unknown) => void;
  selectOptions: SelectOptionsMap;
}) {
  if (field.type === "boolean") {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={Boolean(value)}
            onChange={(e) => onChange(field.name, e.target.checked)}
          />
        }
        label={field.label}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <TextField
        fullWidth
        size="small"
        label={field.label}
        multiline
        minRows={3}
        required={field.required}
        value={String(value ?? "")}
        onChange={(e) => onChange(field.name, e.target.value)}
      />
    );
  }

  if (field.type === "color") {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          fullWidth
          size="small"
          label={field.label}
          placeholder="#FF5733"
          required={field.required}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
        {!!value && (
          <Box
            sx={{ width: 28, height: 28, borderRadius: 1, border: "1px solid #ccc", bgcolor: String(value), flexShrink: 0 }}
          />
        )}
      </Stack>
    );
  }

  if (field.type === "select") {
    const opts = field.staticOptions
      ? field.staticOptions.map((o) => ({ label: String(o.label), value: o.value }))
      : (selectOptions[field.name] ?? []);
    return (
      <TextField
        select
        fullWidth
        size="small"
        label={field.label}
        required={field.required}
        value={value === "" || value === null || value === undefined ? "" : String(value)}
        onChange={(e) => onChange(field.name, e.target.value === "" ? null : e.target.value)}
      >
        <MenuItem value="">-- Select --</MenuItem>
        {opts.map((opt) => (
          <MenuItem key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  if (field.type === "date") {
    return (
      <TextField
        fullWidth
        size="small"
        type="date"
        label={field.label}
        required={field.required}
        value={String(value ?? "")}
        onChange={(e) => onChange(field.name, e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
    );
  }

  if (field.type === "number") {
    return (
      <TextField
        fullWidth
        size="small"
        type="number"
        label={field.label}
        required={field.required}
        value={String(value ?? "")}
        onChange={(e) => onChange(field.name, e.target.value === "" ? "" : Number(e.target.value))}
      />
    );
  }

  return (
    <TextField
      fullWidth
      size="small"
      label={field.label}
      required={field.required}
      value={String(value ?? "")}
      onChange={(e) => onChange(field.name, e.target.value)}
    />
  );
}

export function AdminModuleWorkspace({ item }: AdminModuleWorkspaceProps) {
  const queryClient = useQueryClient();
  const { hasAnyPermission } = useAuth();

  if (!item.available) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">{item.label}</Typography>
        <Alert severity="warning" sx={{ mt: 2 }}>
          {item.note ?? "This module is intentionally disabled because the backend API is not available yet."}
        </Alert>
      </Paper>
    );
  }

  const moduleSpec = getAdminModuleSpec(item.key);

  if (!moduleSpec) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">{item.label}</Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          Missing module configuration. Add this module to adminModules.ts.
        </Alert>
      </Paper>
    );
  }

  const canRead = moduleSpec.capabilities.read && hasAnyPermission(buildActionPermissionCandidates(item.key, "read"));
  const canCreate = moduleSpec.capabilities.create && hasAnyPermission(buildActionPermissionCandidates(item.key, "create"));
  const canUpdate = moduleSpec.capabilities.update && hasAnyPermission(buildActionPermissionCandidates(item.key, "update"));
  const canDelete = moduleSpec.capabilities.delete && hasAnyPermission(buildActionPermissionCandidates(item.key, "delete"));

  const [keyword, setKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "true" | "false">("all");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // dialog state
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [editRow, setEditRow] = useState<AdminRecord | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminRecord | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: "", severity: "info" });

  const showSnackbar = (message: string, severity: SnackbarSeverity) =>
    setSnackbar({ open: true, message, severity });

  // path params for list (e.g. :userId in notifications)
  const listPathParamKeys = useMemo(() => {
    const matches = moduleSpec.listEndpoint.match(/:([a-zA-Z]+)/g);
    return matches ? matches.map((m) => m.slice(1)) : [];
  }, [moduleSpec.listEndpoint]);

  const [listPathParams, setListPathParams] = useState<Record<string, string>>(() =>
    listPathParamKeys.reduce<Record<string, string>>((acc, k) => { acc[k] = ""; return acc; }, {})
  );

  useEffect(() => {
    setKeyword("");
    setActiveFilter("all");
    setPage(0);
    setSize(10);
    setListPathParams(listPathParamKeys.reduce<Record<string, string>>((acc, k) => { acc[k] = ""; return acc; }, {}));
    setActionError(null);
    setDialogMode(null);
    setEditRow(null);
  }, [item.key, listPathParamKeys]);

  const hasMissingListPathParams = listPathParamKeys.some((k) => !listPathParams[k]?.trim());

  const activeValue = activeFilter === "all" ? undefined : activeFilter === "true";

  const listQuery = useQuery({
    queryKey: ["admin-module-list", item.key, page, size, keyword, activeValue, listPathParams],
    queryFn: () =>
      listAdminRecords({
        endpoint: moduleSpec.listEndpoint,
        pathParams: listPathParams,
        responseMode: moduleSpec.listResponseMode,
        queryParams:
          moduleSpec.listResponseMode === "paged"
            ? { page, size, sortBy: "id", sortDir: "asc", keyword: keyword.trim() || undefined, active: activeValue }
            : undefined,
      }),
    enabled: canRead && !hasMissingListPathParams,
  });

  // load select options for FK fields
  const selectEndpoints = useMemo(
    () => moduleSpec.fields.filter((f) => f.type === "select" && f.selectEndpoint && !f.staticOptions),
    [moduleSpec.fields]
  );

  const selectOptionsQueries = selectEndpoints.map((field) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ["select-options", field.name, field.selectEndpoint],
      queryFn: async () => {
        const res = await httpClient.get<unknown>(field.selectEndpoint!);
        const data = res.data as Record<string, unknown>;
        let items: unknown[] = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (field.selectResponseKey && Array.isArray(data[field.selectResponseKey])) {
          items = data[field.selectResponseKey] as unknown[];
        } else if (Array.isArray(data["content"])) {
          items = data["content"] as unknown[];
        }
        return items.map((item: unknown) => {
          const row = item as Record<string, unknown>;
          return {
            label: String(row[field.selectLabelKey ?? "name"] ?? ""),
            value: row[field.selectValueKey ?? "id"],
          };
        });
      },
      staleTime: 60_000,
    })
  );

  const selectOptionsMap: SelectOptionsMap = useMemo(() => {
    const map: SelectOptionsMap = {};
    selectEndpoints.forEach((field, idx) => {
      map[field.name] = selectOptionsQueries[idx].data ?? [];
    });
    return map;
  }, [selectEndpoints, selectOptionsQueries]);

  const reloadList = () => queryClient.invalidateQueries({ queryKey: ["admin-module-list", item.key] });

  const handleOpenCreate = () => {
    setFormData(buildInitialForm(moduleSpec.fields));
    setActionError(null);
    setDialogMode("create");
  };

  const handleOpenEdit = (row: AdminRecord) => {
    setEditRow(row);
    setFormData(populateForm(moduleSpec.fields, row));
    setActionError(null);
    setDialogMode("edit");
  };

  const handleCloseDialog = () => {
    setDialogMode(null);
    setEditRow(null);
    setActionError(null);
  };

  const handleFormChange = useCallback((name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // build payload: convert numeric strings, drop empty strings for optional fields
  function buildPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    for (const field of moduleSpec!.fields) {
      const val = formData[field.name];
      if (val === "" || val === null || val === undefined) {
        if (!field.required) continue;
      }
      if (field.type === "number" && val !== "" && val !== null && val !== undefined) {
        payload[field.name] = Number(val);
      } else if (field.type === "boolean") {
        payload[field.name] = Boolean(val);
      } else {
        payload[field.name] = val;
      }
    }
    return payload;
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!moduleSpec.createEndpoint) throw new Error("Create endpoint not configured.");
      await createAdminRecord({ endpoint: moduleSpec.createEndpoint, payload: buildPayload() });
    },
    onSuccess: () => {
      setActionError(null);
      reloadList();
      handleCloseDialog();
      showSnackbar(`${moduleSpec.title} created.`, "success");
    },
    onError: (error) => {
      setActionError((error as Error).message);
      showSnackbar((error as Error).message, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!moduleSpec.updateEndpoint || !editRow) throw new Error("Update not configured.");
      await updateAdminRecord({
        endpoint: moduleSpec.updateEndpoint,
        pathParams: { id: String(editRow.id) },
        payload: buildPayload(),
      });
    },
    onSuccess: () => {
      setActionError(null);
      reloadList();
      handleCloseDialog();
      showSnackbar(`${moduleSpec.title} updated.`, "success");
    },
    onError: (error) => {
      setActionError((error as Error).message);
      showSnackbar((error as Error).message, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!moduleSpec.deleteEndpoint || !deleteTarget) throw new Error("Delete not configured.");
      await deleteAdminRecord({
        endpoint: moduleSpec.deleteEndpoint,
        pathParams: { id: String(deleteTarget.id) },
      });
    },
    onSuccess: () => {
      reloadList();
      setConfirmDeleteOpen(false);
      setDeleteTarget(null);
      showSnackbar(`${moduleSpec.title} deleted.`, "success");
    },
    onError: (error) => {
      showSnackbar((error as Error).message, "error");
    },
  });

  const rows = listQuery.data?.rows ?? [];
  const totalPages = listQuery.data?.totalPages ?? 0;
  const totalElements = listQuery.data?.totalElements ?? 0;

  return (
    <Stack spacing={2.5}>
      {/* Header */}
      <Paper sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
          <Box>
            <Typography variant="h5">{moduleSpec.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {moduleSpec.description}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" onClick={reloadList}>Refresh</Button>
            {canCreate && moduleSpec.fields.length > 0 ? (
              <Button variant="contained" size="small" onClick={handleOpenCreate}>
                + Create {moduleSpec.title}
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Paper>

      {/* Filters + Table */}
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Search"
            placeholder={`Search ${moduleSpec.title.toLowerCase()}`}
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
            disabled={!moduleSpec.capabilities.search}
          />
          {moduleSpec.capabilities.filtering ? (
            <TextField
              select
              size="small"
              label="Status"
              value={activeFilter}
              onChange={(e) => { setActiveFilter(e.target.value as "all" | "true" | "false"); setPage(0); }}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </TextField>
          ) : null}
          {moduleSpec.capabilities.pagination ? (
            <TextField
              select
              size="small"
              label="Page Size"
              value={String(size)}
              onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
              sx={{ minWidth: 100 }}
            >
              <MenuItem value="10">10</MenuItem>
              <MenuItem value="20">20</MenuItem>
              <MenuItem value="50">50</MenuItem>
            </TextField>
          ) : null}
        </Stack>

        {/* Dynamic path param inputs (e.g. userId for notifications) */}
        {listPathParamKeys.length > 0 ? (
          <Stack direction="row" spacing={1.2} sx={{ mb: 2 }}>
            {listPathParamKeys.map((key) => (
              <TextField
                key={key}
                size="small"
                label={key}
                placeholder={`Enter ${key}`}
                value={listPathParams[key] ?? ""}
                onChange={(e) => { setListPathParams((prev) => ({ ...prev, [key]: e.target.value })); setPage(0); }}
              />
            ))}
          </Stack>
        ) : null}

        <Divider sx={{ mb: 2 }} />

        {!canRead ? (
          <Alert severity="warning">You do not have read permission for this module.</Alert>
        ) : hasMissingListPathParams ? (
          <Alert severity="info">Enter the required path parameter(s) above to load records.</Alert>
        ) : listQuery.isLoading ? (
          <LoadingState variant="table" rows={7} />
        ) : listQuery.isError ? (
          <ErrorState message={(listQuery.error as Error).message} onRetry={() => listQuery.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState title="No records found" description="Try changing filters or create a new record." />
        ) : (
          <Stack spacing={1.2}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {moduleSpec.columns.map((col) => (
                      <TableCell key={col.accessor}>{col.label}</TableCell>
                    ))}
                    {(canUpdate || canDelete) ? <TableCell align="right">Actions</TableCell> : null}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row: AdminRecord, idx) => (
                    <TableRow key={String(row.id ?? `row-${idx}`)} hover>
                      {moduleSpec.columns.map((col) => (
                        <TableCell key={col.accessor}>{formatCellValue(row[col.accessor])}</TableCell>
                      ))}
                      {(canUpdate || canDelete) ? (
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            {canUpdate && moduleSpec.fields.length > 0 ? (
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleOpenEdit(row)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                            {canDelete ? (
                              <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => { setDeleteTarget(row); setConfirmDeleteOpen(true); }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                          </Stack>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {moduleSpec.capabilities.pagination && totalPages > 1 ? (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="caption" color="text.secondary">{totalElements} total</Typography>
                <Pagination count={totalPages} page={page + 1} onChange={(_, p) => setPage(p - 1)} size="small" />
              </Stack>
            ) : null}
          </Stack>
        )}
      </Paper>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogMode !== null} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === "create" ? `Create ${moduleSpec.title}` : `Edit ${moduleSpec.title}`}
          {editRow?.id ? <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>(ID: {String(editRow.id)})</Typography> : null}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {actionError ? <Alert severity="error">{actionError}</Alert> : null}
            {moduleSpec.fields.map((field) => (
              <DynamicFormField
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={handleFormChange}
                selectOptions={selectOptionsMap}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={createMutation.isPending || updateMutation.isPending}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => dialogMode === "create" ? createMutation.mutate() : updateMutation.mutate()}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {dialogMode === "create" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmActionDialog
        open={confirmDeleteOpen}
        title={`Delete ${moduleSpec.title}`}
        message={`Are you sure you want to delete this record? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => { setConfirmDeleteOpen(false); setDeleteTarget(null); }}
        loading={deleteMutation.isPending}
      />

      <PageSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Stack>
  );
}
