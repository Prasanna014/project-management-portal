import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  AppBar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AdminPanelSettingsRounded,
  ChevronLeft,
  ChevronRight,
  CommentRounded,
  DashboardRounded,
  DateRangeRounded,
  DescriptionRounded,
  FolderRounded,
  LibraryBooksRounded,
  ManageAccountsRounded,
  MenuRounded,
  NotificationsRounded,
  PeopleRounded,
  SearchRounded,
  SettingsRounded,
  TaskRounded,
  ViewKanbanRounded,
} from "@mui/icons-material";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import type { SvgIconComponent } from "@mui/icons-material";
import { administrationNavigation, mainNavigation } from "@app/router/navigation";
import { useAuth } from "@features/auth/context/AuthContext";
import { buildReadPermissionCandidates } from "@shared/auth/permissions";
import { usePreferences } from "@shared/preferences/PreferencesContext";
import { fetchUnreadNotifications } from "@modules/notifications/services/notificationsApi";
import { globalSearch } from "@modules/search/services/searchApi";

const drawerWidthExpanded = 260;
const drawerWidthCollapsed = 88;

type QuickSearchItem = {
  id: string;
  label: string;
  detail: string;
  to: string;
  icon: "task" | "project" | "comment";
};

function buildQuickResults(searchData: Awaited<ReturnType<typeof globalSearch>> | undefined): QuickSearchItem[] {
  if (!searchData) {
    return [];
  }

  return [
    ...searchData.tasks.slice(0, 3).map((task) => ({
      id: `task-${task.id}`,
      label: task.issueActionItem ?? task.taskNo ?? `Task #${task.id}`,
      detail: [task.taskNo, task.priority, task.status].filter(Boolean).join(" • "),
      to: `/task/${task.id}`,
      icon: "task" as const,
    })),
    ...searchData.projects.slice(0, 2).map((project) => ({
      id: `project-${project.id}`,
      label: project.projectName,
      detail: [project.projectCode, project.active ? "Active" : "Inactive"].filter(Boolean).join(" • "),
      to: `/projects?q=${encodeURIComponent(project.projectCode || project.projectName)}&projectId=${project.id}`,
      icon: "project" as const,
    })),
    ...searchData.comments.slice(0, 3).map((comment) => ({
      id: `comment-${comment.id}`,
      label: comment.taskTitle ?? comment.taskNo ?? `Comment #${comment.id}`,
      detail: (comment.commentText ?? "").trim().slice(0, 90),
      to: comment.taskId ? `/task/${comment.taskId}?commentId=${comment.id}` : "/tasks",
      icon: "comment" as const,
    })),
  ];
}

function QuickResultIcon({ icon }: { icon: QuickSearchItem["icon"] }) {
  if (icon === "project") {
    return <FolderRounded fontSize="small" color="primary" />;
  }
  if (icon === "comment") {
    return <CommentRounded fontSize="small" color="primary" />;
  }
  return <TaskRounded fontSize="small" color="primary" />;
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasAnyPermission } = useAuth();
  const { preferences, addRecentSearch } = usePreferences();
  const [adminExpanded, setAdminExpanded] = useState(true);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(searchValue.trim()), 250);
    return () => window.clearTimeout(timeoutId);
  }, [searchValue]);

  const unreadNotificationsQuery = useQuery({
    queryKey: ["notifications-unread", user?.userId],
    queryFn: () => fetchUnreadNotifications(user?.userId ?? 0),
    enabled: Boolean(user?.userId),
    refetchInterval: 30000,
  });

  const quickSearchQuery = useQuery({
    queryKey: ["shell-search", debouncedSearch],
    queryFn: () => globalSearch(debouncedSearch),
    enabled: searchOpen && debouncedSearch.length >= 2,
  });

  const navIconMap: Record<string, SvgIconComponent> = {
    Dashboard: DashboardRounded,
    Workspace: ViewKanbanRounded,
    Projects: FolderRounded,
    Tasks: TaskRounded,
    Reports: DescriptionRounded,
    Users: PeopleRounded,
    "Knowledge Base": LibraryBooksRounded,
    Search: SearchRounded,
    Notifications: NotificationsRounded,
    Calendar: DateRangeRounded,
    Profile: ManageAccountsRounded,
    Settings: SettingsRounded,
  };

  const isMainItemSelected = (to: string) => (to === "/" ? location.pathname === "/" : location.pathname.startsWith(to));

  const sectionPermissionKey: Record<string, string> = {
    Dashboard: "dashboard",
    Workspace: "workspace",
    Projects: "projects",
    Tasks: "tasks",
    Reports: "reports",
    Users: "users",
    Search: "search",
    Notifications: "notifications",
    Calendar: "calendar",
    "Knowledge Base": "knowledge-base",
    Settings: "settings",
  };

  const hasSectionReadAccess = (label: string): boolean => {
    if (label === "Settings" || label === "Profile") {
      return true;
    }
    const key = sectionPermissionKey[label];
    if (!key) {
      return true;
    }
    return hasAnyPermission(buildReadPermissionCandidates(key));
  };

  const availableAdminModules = useMemo(
    () => administrationNavigation.filter((item) => item.available && hasAnyPermission(buildReadPermissionCandidates(item.key))),
    [hasAnyPermission]
  );

  const unavailableAdminModules = useMemo(() => administrationNavigation.filter((item) => !item.available), []);

  const adminNavSections = useMemo(() => {
    const sectionOrder = ["Organization", "Access Control", "Task Catalog", "Workflows", "Projects", "System"];
    const grouped = new Map<string, typeof availableAdminModules>();
    for (const item of availableAdminModules) {
      const section = item.section ?? "Other";
      if (!grouped.has(section)) {
        grouped.set(section, []);
      }
      grouped.get(section)?.push(item);
    }
    return sectionOrder.filter((section) => grouped.has(section)).map((section) => ({ section, items: grouped.get(section) ?? [] }));
  }, [availableAdminModules]);

  const quickResults = useMemo(() => buildQuickResults(quickSearchQuery.data), [quickSearchQuery.data]);
  const unreadCount = unreadNotificationsQuery.data?.length ?? 0;

  const handleOpenSearchTarget = (target: string, query?: string) => {
    if (query) {
      addRecentSearch(query);
    }
    setSearchOpen(false);
    setSearchValue("");
    navigate(target);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "linear-gradient(90deg, #2B3A67 0%, #3F51B5 45%, #274060 100%)",
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <IconButton color="inherit" onClick={() => setDrawerCollapsed((value) => !value)} sx={{ mr: 0.5 }}>
            {drawerCollapsed ? <MenuRounded /> : <ChevronLeft />}
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
            SupportFlow Enterprise UI
          </Typography>
          <Button
            color="inherit"
            startIcon={<SearchRounded />}
            onClick={() => setSearchOpen(true)}
            sx={{
              ml: { md: 2 },
              flexGrow: 1,
              justifyContent: "flex-start",
              minWidth: 180,
              maxWidth: 480,
              bgcolor: "rgba(255,255,255,0.12)",
              borderRadius: 999,
              textTransform: "none",
              color: "#e2e8f0",
            }}
          >
            Search tasks, projects, comments
            <Chip size="small" label="Ctrl+K" sx={{ ml: 1, bgcolor: "rgba(255,255,255,0.16)", color: "#fff" }} />
          </Button>
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={() => navigate("/notifications")}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsRounded />
              </Badge>
            </IconButton>
          </Tooltip>
          <Chip
            size="small"
            label={preferences.themeMode === "dark" ? "Dark" : "Light"}
            sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "#fff", fontWeight: 700 }}
          />
          <Typography variant="body2" sx={{ mr: 1 }}>
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
                    disableSticky
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

      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Global Search</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              autoFocus
              fullWidth
              placeholder="Search tasks, projects, comments"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleOpenSearchTarget(`/search?q=${encodeURIComponent(searchValue.trim())}`, searchValue);
                }
              }}
            />

            {debouncedSearch.length < 2 ? (
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1.25}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Recent searches
                    </Typography>
                    {preferences.recentSearches.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No recent searches yet.
                      </Typography>
                    ) : (
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {preferences.recentSearches.map((entry) => (
                          <Chip
                            key={entry}
                            label={entry}
                            onClick={() => handleOpenSearchTarget(`/search?q=${encodeURIComponent(entry)}`, entry)}
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ) : null}

            {quickSearchQuery.isSuccess && quickResults.length > 0 ? (
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1.25}>
                    {quickResults.map((item, index) => (
                      <Box key={item.id}>
                        {index > 0 ? <Divider sx={{ mb: 1.25 }} /> : null}
                        <ListItemButton
                          onClick={() => handleOpenSearchTarget(item.to, searchValue)}
                          sx={{ px: 0, borderRadius: 2 }}
                        >
                          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ width: "100%" }}>
                            <QuickResultIcon icon={item.icon} />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography sx={{ fontWeight: 700 }}>{item.label}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.detail || "Open result"}
                              </Typography>
                            </Box>
                          </Stack>
                        </ListItemButton>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            ) : null}

            {quickSearchQuery.isSuccess && debouncedSearch.length >= 2 && quickResults.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No results found. Open the full search page to refine filters.
              </Typography>
            ) : null}

            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={<SearchRounded />}
                onClick={() => handleOpenSearchTarget(`/search?q=${encodeURIComponent(searchValue.trim())}`, searchValue)}
              >
                Open full search
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
