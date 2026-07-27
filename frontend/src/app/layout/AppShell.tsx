import { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Collapse,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Toolbar,
  Typography,
} from "@mui/material";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { administrationNavigation, mainNavigation } from "@app/router/navigation";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildReadPermissionCandidates } from "@shared/auth/permissions";

const drawerWidth = 260;

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasAnyPermission } = useAuth();
  const [adminExpanded, setAdminExpanded] = useState(true);

  const sectionPermissionKey: Record<string, string> = {
    Dashboard: "dashboard",
    Workspace: "workspace",
    Projects: "projects",
    Tasks: "tasks",
    Reports: "reports",
    Settings: "settings",
  };

  const hasSectionReadAccess = (label: string): boolean => {
    const key = sectionPermissionKey[label];
    if (!key) {
      return true;
    }
    return hasAnyPermission(buildReadPermissionCandidates(key));
  };

  const availableAdminModules = useMemo(
    () =>
      administrationNavigation.filter(
        (item) => item.available && hasAnyPermission(buildReadPermissionCandidates(item.key))
      ),
    [hasAnyPermission]
  );

  const unavailableAdminModules = useMemo(
    () => administrationNavigation.filter((item) => !item.available),
    []
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>SupportFlow Enterprise UI</Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>{user?.email ?? "Unknown user"}</Typography>
          <Button
            color="inherit"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <List subheader={<ListSubheader>Navigation</ListSubheader>}>
          {mainNavigation
            .filter((item) => item.label !== "Administration")
            .filter((item) => hasSectionReadAccess(item.label))
            .map((item) => (
              <ListItemButton key={item.to} component={NavLink} to={item.to}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}

          {availableAdminModules.length > 0 ? (
            <ListItemButton
              selected={location.pathname.startsWith("/administration")}
              onClick={() => setAdminExpanded((value) => !value)}
            >
              <ListItemText primary="Administration" />
            </ListItemButton>
          ) : null}

          <Collapse in={adminExpanded}>
            <List disablePadding>
              {availableAdminModules.map((item) => (
                <ListItemButton
                  key={item.key}
                  component={NavLink}
                  to={item.to}
                  sx={{ pl: 4 }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}

              {unavailableAdminModules.map((item) => (
                <ListItemButton key={item.key} disabled sx={{ pl: 4 }}>
                  <ListItemText primary={item.label} secondary={item.note} />
                  <Chip size="small" label="API Missing" />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
