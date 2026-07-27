import { ModulePlaceholder } from "@shared/ui/states/ModulePlaceholder";
import { Alert } from "@mui/material";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildReadPermissionCandidates } from "@shared/auth/permissions";

export function SettingsPage() {
  const { hasAnyPermission } = useAuth();

  if (!hasAnyPermission(buildReadPermissionCandidates("settings"))) {
    return <Alert severity="warning">You do not have read permission for settings.</Alert>;
  }

  return <ModulePlaceholder title="Settings" note="Settings backend APIs are currently missing and will be flagged in UI." />;
}
