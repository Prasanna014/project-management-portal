import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Pagination,
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
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminNavItem } from "@app/router/navigation";
import { useAuth } from "@features/auth/context/AuthContext";
import { LoadingState } from "@shared/ui/states/LoadingState";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { EmptyState } from "@shared/ui/states/EmptyState";
import { getAdminModuleSpec } from "@modules/administration/config/adminModules";
import {
  createAdminRecord,
  deleteAdminRecord,
  getEndpointPathParams,
  listAdminRecords,
  updateAdminRecord,
  type AdminRecord,
} from "@modules/administration/services/adminModuleApi";
import { ConfirmActionDialog } from "@shared/ui/feedback/ConfirmActionDialog";
import { PageSnackbar, type SnackbarSeverity } from "@shared/ui/feedback/PageSnackbar";
import { buildActionPermissionCandidates } from "@shared/auth/permissions";

type AdminModuleWorkspaceProps = {
  item: AdminNavItem;
};

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
};

type CapabilityChipProps = {
  label: string;
  enabled: boolean;
};

function CapabilityChip({ label, enabled }: CapabilityChipProps) {
  return <Chip size="small" label={label} color={enabled ? "primary" : "default"} variant={enabled ? "filled" : "outlined"} />;
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function createPathParamsRecord(keys: string[]): Record<string, string> {
  return keys.reduce<Record<string, string>>((acc, key) => {
    acc[key] = "";
    return acc;
  }, {});
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
          Missing module configuration. Add this module to adminModules.ts before implementation.
        </Alert>
      </Paper>
    );
  }

  const isAssignmentModule = item.key === "user-roles" || item.key === "role-permissions" || item.key === "project-departments";
  const canRead = moduleSpec.capabilities.read && hasAnyPermission(buildActionPermissionCandidates(item.key, "read"));
  const canCreate = moduleSpec.capabilities.create && hasAnyPermission(buildActionPermissionCandidates(item.key, "create"));
  const canAssign = moduleSpec.capabilities.create && hasAnyPermission(buildActionPermissionCandidates(item.key, "assign"));
  const canCreateOrAssign = canCreate || (isAssignmentModule && canAssign);
  const canUpdate = moduleSpec.capabilities.update && hasAnyPermission(buildActionPermissionCandidates(item.key, "update"));
  const canDelete = moduleSpec.capabilities.delete && hasAnyPermission(buildActionPermissionCandidates(item.key, "delete"));

  const [keyword, setKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "true" | "false">("all");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [createPayload, setCreatePayload] = useState("{}");
  const [updatePayload, setUpdatePayload] = useState("{}");

  const listPathParamKeys = useMemo(() => getEndpointPathParams(moduleSpec.listEndpoint), [moduleSpec.listEndpoint]);
  const updatePathParamKeys = useMemo(
    () => (moduleSpec.updateEndpoint ? getEndpointPathParams(moduleSpec.updateEndpoint) : []),
    [moduleSpec.updateEndpoint]
  );
  const deletePathParamKeys = useMemo(
    () => (moduleSpec.deleteEndpoint ? getEndpointPathParams(moduleSpec.deleteEndpoint) : []),
    [moduleSpec.deleteEndpoint]
  );

  const [listPathParams, setListPathParams] = useState<Record<string, string>>(createPathParamsRecord(listPathParamKeys));
  const [updatePathParams, setUpdatePathParams] = useState<Record<string, string>>(createPathParamsRecord(updatePathParamKeys));
  const [deletePathParams, setDeletePathParams] = useState<Record<string, string>>(createPathParamsRecord(deletePathParamKeys));
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    setKeyword("");
    setActiveFilter("all");
    setPage(0);
    setSize(10);
    setCreatePayload("{}");
    setUpdatePayload("{}");
    setListPathParams(createPathParamsRecord(listPathParamKeys));
    setUpdatePathParams(createPathParamsRecord(updatePathParamKeys));
    setDeletePathParams(createPathParamsRecord(deletePathParamKeys));
    setActionError(null);
  }, [item.key, listPathParamKeys, updatePathParamKeys, deletePathParamKeys]);

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
            ? {
                page,
                size,
                sortBy: "id",
                sortDir: "asc",
                keyword: keyword.trim() || undefined,
                active: activeValue,
              }
            : undefined,
      }),
    enabled: canRead,
  });

  const reloadList = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-module-list", item.key] });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!moduleSpec.createEndpoint) {
        throw new Error("Create endpoint is not configured for this module.");
      }

      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(createPayload) as Record<string, unknown>;
      } catch {
        throw new Error("Create payload must be valid JSON.");
      }

      await createAdminRecord({
        endpoint: moduleSpec.createEndpoint,
        payload,
      });
    },
    onSuccess: () => {
      setActionError(null);
      reloadList();
      showSnackbar(`${moduleSpec.title} ${isAssignmentModule ? "assigned" : "created"}.`, "success");
    },
    onError: (error) => {
      setActionError((error as Error).message);
      showSnackbar((error as Error).message, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!moduleSpec.updateEndpoint) {
        throw new Error("Update endpoint is not configured for this module.");
      }

      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(updatePayload) as Record<string, unknown>;
      } catch {
        throw new Error("Update payload must be valid JSON.");
      }

      await updateAdminRecord({
        endpoint: moduleSpec.updateEndpoint,
        pathParams: updatePathParams,
        payload,
      });
    },
    onSuccess: () => {
      setActionError(null);
      reloadList();
      showSnackbar(`${moduleSpec.title} record updated.`, "success");
    },
    onError: (error) => {
      setActionError((error as Error).message);
      showSnackbar((error as Error).message, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!moduleSpec.deleteEndpoint) {
        throw new Error("Delete endpoint is not configured for this module.");
      }

      await deleteAdminRecord({
        endpoint: moduleSpec.deleteEndpoint,
        pathParams: deletePathParams,
      });
    },
    onSuccess: () => {
      setActionError(null);
      reloadList();
      setConfirmDeleteOpen(false);
      showSnackbar(`${moduleSpec.title} record deleted.`, "success");
    },
    onError: (error) => {
      setActionError((error as Error).message);
      showSnackbar((error as Error).message, "error");
    },
  });

  const rows = listQuery.data?.rows ?? [];
  const totalPages = listQuery.data?.totalPages ?? 0;
  const totalElements = listQuery.data?.totalElements ?? 0;

  const hasMissingListPathParams = listPathParamKeys.some((key) => !listPathParams[key]?.trim());
  const hasMissingUpdatePathParams = updatePathParamKeys.some((key) => !updatePathParams[key]?.trim());
  const hasMissingDeletePathParams = deletePathParamKeys.some((key) => !deletePathParams[key]?.trim());

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
          <Box>
            <Typography variant="h5">{moduleSpec.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
              {moduleSpec.description}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              API endpoint: {moduleSpec.backendEndpoint}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={reloadList}>Refresh</Button>
            {canCreateOrAssign ? (
              <Button variant="contained" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {isAssignmentModule ? "Assign" : "Create"}
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Paper>

      <Card>
        <CardContent>
          <Typography variant="subtitle1">Module Capabilities</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap", rowGap: 1 }}>
            <CapabilityChip label={isAssignmentModule ? "Assign" : "Create"} enabled={canCreateOrAssign} />
            <CapabilityChip label="Read" enabled={canRead} />
            <CapabilityChip label="Update" enabled={canUpdate} />
            <CapabilityChip label="Delete" enabled={canDelete} />
            <CapabilityChip label="Search" enabled={moduleSpec.capabilities.search && canRead} />
            <CapabilityChip label="Pagination" enabled={moduleSpec.capabilities.pagination && canRead} />
            <CapabilityChip label="Filtering" enabled={moduleSpec.capabilities.filtering && canRead} />
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search records"
                  placeholder={`Search ${moduleSpec.title.toLowerCase()}`}
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.target.value);
                    setPage(0);
                  }}
                  disabled={!moduleSpec.capabilities.search || !canRead}
                />
                <TextField
                  select
                  size="small"
                  label="Active"
                  value={activeFilter}
                  onChange={(event) => {
                    setActiveFilter(event.target.value as "all" | "true" | "false");
                    setPage(0);
                  }}
                  sx={{ minWidth: 120 }}
                  disabled={!moduleSpec.capabilities.filtering || !canRead}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </TextField>
                {moduleSpec.capabilities.pagination ? (
                  <TextField
                    select
                    size="small"
                    label="Page Size"
                    value={String(size)}
                    onChange={(event) => {
                      setSize(Number(event.target.value));
                      setPage(0);
                    }}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="10">10</MenuItem>
                    <MenuItem value="20">20</MenuItem>
                    <MenuItem value="50">50</MenuItem>
                  </TextField>
                ) : null}
              </Stack>

              {listPathParamKeys.length > 0 ? (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ mt: 1.5 }}>
                  {listPathParamKeys.map((key) => (
                    <TextField
                      key={key}
                      size="small"
                      label={key}
                      value={listPathParams[key] ?? ""}
                      onChange={(event) => {
                        setListPathParams((prev) => ({
                          ...prev,
                          [key]: event.target.value,
                        }));
                        setPage(0);
                      }}
                    />
                  ))}
                </Stack>
              ) : null}

              <Divider sx={{ my: 2 }} />

              {!canRead ? (
                <Alert severity="warning">You do not have read permission for this module.</Alert>
              ) : hasMissingListPathParams ? (
                <Alert severity="info">Enter required path parameters to load records.</Alert>
              ) : listQuery.isLoading ? (
                <LoadingState variant="table" rows={7} />
              ) : listQuery.isError ? (
                <ErrorState message={(listQuery.error as Error).message} onRetry={() => listQuery.refetch()} />
              ) : rows.length === 0 ? (
                <EmptyState title="No records found" description="Try changing search or filter values." />
              ) : (
                <Stack spacing={1.2}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {moduleSpec.columns.map((column) => (
                            <TableCell key={column.accessor}>{column.label}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row: AdminRecord, index) => (
                          <TableRow key={String(row.id ?? `${item.key}-${index}`)}>
                            {moduleSpec.columns.map((column) => (
                              <TableCell key={`${String(row.id ?? index)}-${column.accessor}`}>
                                {formatCellValue(row[column.accessor])}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {moduleSpec.capabilities.pagination && totalPages > 1 ? (
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        {totalElements} total records
                      </Typography>
                      <Pagination
                        count={totalPages}
                        page={page + 1}
                        onChange={(_, nextPage) => setPage(nextPage - 1)}
                        size="small"
                      />
                    </Stack>
                  ) : null}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          {canCreateOrAssign ? (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1">{isAssignmentModule ? "Assign Action" : "Create Payload"}</Typography>
                <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                  {moduleSpec.fields.map((field) => (
                    <TextField key={field.name} size="small" label={field.name} placeholder={field.required ? "Required" : "Optional"} disabled />
                  ))}
                  <TextField
                    label="JSON body"
                    multiline
                    minRows={4}
                    value={createPayload}
                    onChange={(event) => setCreatePayload(event.target.value)}
                  />
                  <Button
                    variant="contained"
                    onClick={() => createMutation.mutate()}
                    disabled={createMutation.isPending}
                  >
                    {isAssignmentModule ? "Submit Assign" : "Submit Create"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : null}

          {canUpdate ? (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1">Update Action</Typography>
                <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                  {updatePathParamKeys.map((key) => (
                    <TextField
                      key={key}
                      size="small"
                      label={key}
                      value={updatePathParams[key] ?? ""}
                      onChange={(event) =>
                        setUpdatePathParams((prev) => ({
                          ...prev,
                          [key]: event.target.value,
                        }))
                      }
                    />
                  ))}
                  <TextField
                    label="JSON body"
                    multiline
                    minRows={4}
                    value={updatePayload}
                    onChange={(event) => setUpdatePayload(event.target.value)}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => updateMutation.mutate()}
                    disabled={!moduleSpec.updateEndpoint || hasMissingUpdatePathParams || updateMutation.isPending}
                  >
                    Submit Update
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : null}

          {canDelete ? (
            <Card>
              <CardContent>
                <Typography variant="subtitle1">Delete Action</Typography>
                <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                  {deletePathParamKeys.map((key) => (
                    <TextField
                      key={key}
                      size="small"
                      label={key}
                      value={deletePathParams[key] ?? ""}
                      onChange={(event) =>
                        setDeletePathParams((prev) => ({
                          ...prev,
                          [key]: event.target.value,
                        }))
                      }
                    />
                  ))}
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={() => setConfirmDeleteOpen(true)}
                    disabled={!moduleSpec.deleteEndpoint || hasMissingDeletePathParams || deleteMutation.isPending}
                  >
                    Submit Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : null}
        </Grid>
      </Grid>

      {actionError ? <ErrorState message={actionError} /> : null}
      <ConfirmActionDialog
        open={confirmDeleteOpen}
        title={`Delete ${moduleSpec.title} record`}
        message="This action cannot be undone. Continue with delete request?"
        confirmLabel="Delete"
        danger
        loading={deleteMutation.isPending}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
      <PageSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </Stack>
  );
}
