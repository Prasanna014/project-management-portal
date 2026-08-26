import { useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  Collapse,
  Drawer,
  FormControl,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  AdminPanelSettingsRounded,
  ChevronLeft,
  ChevronRight,
  DashboardRounded,
  DescriptionRounded,
  FolderRounded,
  LibraryBooksRounded,
  MenuRounded,
  PeopleRounded,
  SettingsRounded,
  TaskRounded,
  ViewKanbanRounded,
} from "@mui/icons-material";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { administrationNavigation, mainNavigation } from "@app/router/navigation";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildReadPermissionCandidates } from "@shared/auth/permissions";
import type { SvgIconComponent } from "@mui/icons-material";

const drawerWidthExpanded = 260;
const drawerWidthCollapsed = 88;

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasAnyPermission } = useAuth();
  const [adminExpanded, setAdminExpanded] = useState(true);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);

  const navIconMap: Record<string, SvgIconComponent> = {
    Dashboard: DashboardRounded,
    Workspace: ViewKanbanRounded,
    Projects: FolderRounded,
    Tasks: TaskRounded,
    Reports: DescriptionRounded,
    Users: PeopleRounded,
    "Knowledge Base": LibraryBooksRounded,
    Settings: SettingsRounded,
  };

  const isMainItemSelected = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const sectionPermissionKey: Record<string, string> = {
    Dashboard: "dashboard",
    Workspace: "workspace",
    Projects: "projects",
    Tasks: "tasks",
    Reports: "reports",
    Users: "users",
    "Knowledge Base": "knowledge-base",
    Settings: "settings",
  };

  const hasSectionReadAccess = (label: string): boolean => {
    if (label === "Settings") {
      return true;
    }
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

  // group available modules by section
  const adminNavSections = useMemo(() => {
    const sectionOrder = ["Organization", "Access Control", "Task Catalog", "Workflows", "Projects", "System"];
    const grouped = new Map<string, typeof availableAdminModules>();
    for (const item of availableAdminModules) {
      const sec = item.section ?? "Other";
      if (!grouped.has(sec)) grouped.set(sec, []);
      grouped.get(sec)!.push(item);
    }
    return sectionOrder.filter((s) => grouped.has(s)).map((s) => ({ section: s, items: grouped.get(s)! }));
  }, [availableAdminModules]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "linear-gradient(90deg, #2B3A67 0%, #3F51B5 45%, #274060 100%)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setDrawerCollapsed((value) => !value)}
            sx={{ mr: 1 }}
          >
            {drawerCollapsed ? <MenuRounded /> : <ChevronLeft />}
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            SupportFlow Enterprise UI
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email ?? "Unknown user"}
          </Typography>
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
          width: drawerCollapsed ? drawerWidthCollapsed : drawerWidthExpanded,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerCollapsed ? drawerWidthCollapsed : drawerWidthExpanded,
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #F8FAFF 0%, #EEF2FF 100%)",
            borderRight: "1px solid #DCE3F4",
            transition: "width 0.2s ease-in-out",
          },
        }}
      >
        <Toolbar />
        <List
          subheader={
            <ListSubheader
              sx={{
                bgcolor: "transparent",
                color: "#6B7280",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {drawerCollapsed ? "Nav" : "Navigation"}
            </ListSubheader>
          }
        >
          {mainNavigation
            .filter((item) => item.label !== "Administration")
            .filter((item) => hasSectionReadAccess(item.label))
            .map((item) => (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                selected={isMainItemSelected(item.to)}
                sx={{
                  mx: 1,
                  mb: 0.6,
                  borderRadius: 2,
                  minHeight: 44,
                  justifyContent: drawerCollapsed ? "center" : "flex-start",
                  gap: drawerCollapsed ? 0 : 1.2,
                  "&.Mui-selected": {
                    bgcolor: "#DDE8FF",
                    color: "#1E3A8A",
                    boxShadow: "inset 3px 0 0 #3B82F6",
                  },
                }}
              >
                {(() => {
                  const Icon = navIconMap[item.label] ?? DashboardRounded;
                  return (
                    <Icon
                      fontSize="small"
                      style={{
                        color: isMainItemSelected(item.to) ? "#1E3A8A" : "#60708F",
                      }}
                    />
                  );
                })()}
                {!drawerCollapsed ? <ListItemText primary={item.label} /> : null}
              </ListItemButton>
            ))}

          {availableAdminModules.length > 0 ? (
            <ListItemButton
              selected={location.pathname.startsWith("/administration")}
              onClick={() => setAdminExpanded((value) => !value)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                minHeight: 44,
                justifyContent: drawerCollapsed ? "center" : "space-between",
                "&.Mui-selected": {
                  bgcolor: "#DDE8FF",
                  color: "#1E3A8A",
                },
              }}
            >
              <AdminPanelSettingsRounded
                fontSize="small"
                style={{
                  color: location.pathname.startsWith("/administration") ? "#1E3A8A" : "#60708F",
                }}
              />
              {!drawerCollapsed ? <ListItemText primary="Administration" /> : null}
              {!drawerCollapsed ? (adminExpanded ? <ChevronLeft fontSize="small" /> : <ChevronRight fontSize="small" />) : null}
            </ListItemButton>
          ) : null}

          <Collapse in={adminExpanded && !drawerCollapsed}>
            <List disablePadding>
              {adminNavSections.map(({ section, items }) => (
                <Box key={section}>
                  <ListSubheader
                    sx={{
                      pl: 4,
                      bgcolor: "transparent",
                      color: "#9CA3AF",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      lineHeight: "28px",
                    }}
                  >
                    {section}
                  </ListSubheader>
                  {items.map((navItem) => (
                    <ListItemButton
                      key={navItem.key}
                      component={NavLink}
                      to={navItem.to}
                      selected={location.pathname.startsWith(navItem.to)}
                      sx={{
                        pl: 4,
                        mx: 1,
                        mb: 0.4,
                        borderRadius: 2,
                        minHeight: 38,
                        "&.Mui-selected": { bgcolor: "#DDE8FF", color: "#1E3A8A" },
                      }}
                    >
                      <ListItemText primary={navItem.label} primaryTypographyProps={{ fontSize: "0.875rem" }} />
                    </ListItemButton>
                  ))}
                </Box>
              ))}

              {unavailableAdminModules.map((navItem) => (
                <ListItemButton key={navItem.key} disabled sx={{ pl: 4 }}>
                  <ListItemText primary={navItem.label} secondary={navItem.note} />
                  <Chip size="small" label="N/A" />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {user?.passwordChangeRequired ? (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => navigate("/settings")}>
                Change Password
              </Button>
            }
          >
            Your account is using a temporary password. Please change it from Settings.
          </Alert>
        ) : null}
        <Outlet />
      </Box>
    </Box>
  );
}
