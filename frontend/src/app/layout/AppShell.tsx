import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  AppBar,
  Avatar,
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
  Menu,
  MenuItem,
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
  PeopleRounded,
  SearchRounded,
  SettingsRounded,
  DarkModeRounded,
  LightModeRounded,
  LogoutRounded,
  TaskRounded,
  ViewKanbanRounded,
} from "@mui/icons-material";
import { NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
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
  const { companySlug, projectSlug } = useParams();
  const { user, logout, hasAnyPermission } = useAuth();
  const { preferences, updatePreferences, addRecentSearch } = usePreferences();
  const [adminExpanded, setAdminExpanded] = useState(true);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<HTMLElement | null>(null);
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

  const tenantBasePath = companySlug && projectSlug ? `/${companySlug}/${projectSlug}` : "";
  const scopedPath = (path: string) => `${tenantBasePath}${path}`;
  const isMainItemSelected = (to: string) => location.pathname.startsWith(scopedPath(to));

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
    if (label === "Platform") {
      return hasAnyPermission(["GLOBAL_ADMIN", "ROLE_GLOBAL_ADMIN"]);
    }
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
  const profileInitials = (user?.email ?? "U").split("@")[0].slice(0, 2).toUpperCase();

  const handleOpenSearchTarget = (target: string, query?: string) => {
    if (query) {
      addRecentSearch(query);
    }
    setSearchOpen(false);
    setSearchValue("");
    navigate(scopedPath(target));
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
          <Typography variant="h6" sx={{ fontWeight: 600, whiteSpace: "nowrap", display: { xs: "none", lg: "block" } }}>
            SupportFlow Enterprise UI
          </Typography>
          <Button
            color="inherit"
            startIcon={<SearchRounded />}
            onClick={() => setSearchOpen(true)}
            sx={{
              ml: { sm: 1, lg: 2 },
              flexGrow: 1,
              justifyContent: "flex-start",
              minWidth: 0,
              maxWidth: 760,
              bgcolor: "rgba(255,255,255,0.12)",
              borderRadius: 999,
              textTransform: "none",
              color: "#e2e8f0",
            }}
          >
            Search tasks, projects, comments
            <Chip size="small" label="Ctrl+K" sx={{ ml: "auto", bgcolor: "rgba(255,255,255,0.16)", color: "#fff" }} />
          </Button>
          <Tooltip title="Account menu">
            <IconButton color="inherit" onClick={(event) => setProfileMenuAnchor(event.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "rgba(255,255,255,0.22)", fontSize: "0.75rem", fontWeight: 700 }}>
                {profileInitials}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={() => setProfileMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem disabled sx={{ opacity: "1 !important", minWidth: 220 }}>
          <Stack spacing={0.25}>
            <Typography variant="subtitle2">{user?.email ?? "Unknown user"}</Typography>
            <Typography variant="caption" color="text.secondary">Account</Typography>
          </Stack>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setProfileMenuAnchor(null); navigate(scopedPath("/profile")); }}>
          <ManageAccountsRounded fontSize="small" />
          <ListItemText sx={{ ml: 1.5 }}>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => updatePreferences({ themeMode: preferences.themeMode === "dark" ? "light" : "dark" })}>
          {preferences.themeMode === "dark" ? <LightModeRounded fontSize="small" /> : <DarkModeRounded fontSize="small" />}
          <ListItemText sx={{ ml: 1.5 }}>{preferences.themeMode === "dark" ? "Use light theme" : "Use dark theme"}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { logout(); navigate("/login", { replace: true }); }}>
          <LogoutRounded fontSize="small" />
          <ListItemText sx={{ ml: 1.5 }}>Log out</ListItemText>
        </MenuItem>
      </Menu>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerCollapsed ? drawerWidthCollapsed : drawerWidthExpanded,
          flexShrink: 0,
          "& .MuiDrawer-paper": (theme) => ({
            width: drawerCollapsed ? drawerWidthCollapsed : drawerWidthExpanded,
            boxSizing: "border-box",
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: "width 0.2s ease-in-out",
          }),
        }}
      >
        <Toolbar />
        <List
          subheader={
            <ListSubheader
              sx={{
                bgcolor: "transparent",
                color: "text.secondary",
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
                to={scopedPath(item.to)}
                selected={isMainItemSelected(item.to)}
                sx={{
                  mx: 1,
                  mb: 0.6,
                  borderRadius: 2,
                  minHeight: 44,
                  justifyContent: drawerCollapsed ? "center" : "flex-start",
                  gap: drawerCollapsed ? 0 : 1.2,
                  "&.Mui-selected": {
                    bgcolor: "action.selected",
                    color: "primary.main",
                    boxShadow: (theme) => `inset 3px 0 0 ${theme.palette.primary.main}`,
                  },
                }}
              >
                {(() => {
                  const Icon = navIconMap[item.label] ?? DashboardRounded;
                  return (
                    <Icon
                      fontSize="small"
                      style={{
                        color: isMainItemSelected(item.to) ? "primary.main" : "text.secondary",
                      }}
                    />
                  );
                })()}
                {!drawerCollapsed ? <ListItemText primary={item.label} /> : null}
              </ListItemButton>
            ))}

          {availableAdminModules.length > 0 ? (
            <ListItemButton
              selected={location.pathname.startsWith(scopedPath("/administration"))}
              onClick={() => setAdminExpanded((value) => !value)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                minHeight: 44,
                justifyContent: drawerCollapsed ? "center" : "space-between",
                "&.Mui-selected": {
                  bgcolor: "action.selected",
                  color: "primary.main",
                },
              }}
            >
              <AdminPanelSettingsRounded
                fontSize="small"
                style={{
                  color: location.pathname.startsWith(scopedPath("/administration")) ? "primary.main" : "text.secondary",
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
                      color: "text.secondary",
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
                      to={scopedPath(navItem.to)}
                      selected={location.pathname.startsWith(scopedPath(navItem.to))}
                      sx={{
                        pl: 4,
                        mx: 1,
                        mb: 0.4,
                        borderRadius: 2,
                        minHeight: 38,
                        "&.Mui-selected": { bgcolor: "action.selected", color: "primary.main" },
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
              <Button color="inherit" size="small" onClick={() => navigate(scopedPath("/settings"))}>
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
