import { ModulePlaceholder } from "@shared/ui/states/ModulePlaceholder";
import { useParams } from "react-router-dom";
import { administrationNavigation } from "@app/router/navigation";
import { AdminModuleWorkspace } from "@modules/administration/components/AdminModuleWorkspace";
import { Alert } from "@mui/material";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildReadPermissionCandidates } from "@shared/auth/permissions";

export function AdministrationPage() {
  const { hasAnyPermission } = useAuth();
  const { moduleKey } = useParams();
  const selected = administrationNavigation.find((item) => item.key === moduleKey);

  const readableAdminModules = administrationNavigation.filter(
    (item) => item.available && hasAnyPermission(buildReadPermissionCandidates(item.key))
  );

  if (!moduleKey) {
    if (readableAdminModules.length === 0) {
      return <Alert severity="warning">You do not have read permission for administration modules.</Alert>;
    }

    return (
      <ModulePlaceholder
        title="Administration"
        note="Select an Administration module from the left navigation."
      />
    );
  }

  if (!selected) {
    return <ModulePlaceholder title="Administration" note="Module route not found." />;
  }

  if (selected.available && !hasAnyPermission(buildReadPermissionCandidates(selected.key))) {
    return <Alert severity="warning">You do not have read permission for this administration module.</Alert>;
  }

  return <AdminModuleWorkspace item={selected} />;
}
