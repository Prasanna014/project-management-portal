import { ModulePlaceholder } from "@shared/ui/states/ModulePlaceholder";
import { useParams } from "react-router-dom";
import { administrationNavigation } from "@app/router/navigation";
import { AdminModuleWorkspace } from "@modules/administration/components/AdminModuleWorkspace";
import { CompanyProfilePanel } from "@modules/administration/components/CompanyProfilePanel";
import { DepartmentAdminPanel } from "@modules/administration/components/DepartmentAdminPanel";
import { UserAdminPanel } from "@modules/administration/components/UserAdminPanel";
import { AuditLogsPanel } from "@modules/administration/components/AuditLogsPanel";
import { WorkflowStatesPanel } from "@modules/administration/components/WorkflowStatesPanel";
import { WorkflowTransitionsPanel } from "@modules/administration/components/WorkflowTransitionsPanel";
import { UserRolePanel } from "@modules/administration/components/UserRolePanel";
import { RolePermissionPanel } from "@modules/administration/components/RolePermissionPanel";
import { ProjectDepartmentsPanel } from "@modules/administration/components/ProjectDepartmentsPanel";
import { ProjectMembersPanel } from "@modules/administration/components/ProjectMembersPanel";
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

  // Dedicated panels for modules with specialized UIs
  if (selected.key === "company-profile") return <CompanyProfilePanel />;
  if (selected.key === "departments") return <DepartmentAdminPanel />;
  if (selected.key === "users") return <UserAdminPanel />;
  if (selected.key === "audit-logs") return <AuditLogsPanel />;
  if (selected.key === "workflow-states") return <WorkflowStatesPanel />;
  if (selected.key === "workflow-transitions") return <WorkflowTransitionsPanel />;
  if (selected.key === "user-roles") return <UserRolePanel />;
  if (selected.key === "role-permissions") return <RolePermissionPanel />;
  if (selected.key === "project-departments") return <ProjectDepartmentsPanel />;
  if (selected.key === "project-members") return <ProjectMembersPanel />;

  // Generic workspace for all remaining modules (auto-form rendering)
  return <AdminModuleWorkspace item={selected} />;
}
