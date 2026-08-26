import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@features/auth/context/AuthContext";
import { httpClient } from "@shared/api/httpClient";
import { PageSnackbar, type SnackbarSeverity } from "@shared/ui/feedback/PageSnackbar";
import {
  usePreferences,
  type NotificationPreferenceKey,
} from "@shared/preferences/PreferencesContext";
import { fetchCurrentUserProfile } from "@modules/users/services/usersApi";
import { fetchProjects } from "@modules/projects/services/projectsApi";
import {
  createPersonalAccessToken,
  fetchPersonalAccessTokens,
  revokePersonalAccessToken,
} from "@modules/settings/services/settingsApi";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
};

const TOKEN_SCOPE_OPTIONS = ["TASKS_READ", "TASKS_WRITE", "PROJECTS_READ", "KNOWLEDGE_BASE_READ", "REPORTS_EXPORT"];

const LOCALE_OPTIONS = [
  { label: "English (India)", value: "en-IN" },
  { label: "English (US)", value: "en-US" },
  { label: "English (UK)", value: "en-GB" },
];

const NOTIFICATION_TOGGLE_OPTIONS: Array<{ key: NotificationPreferenceKey; label: string; description: string }> = [
  { key: "assignments", label: "Assignments", description: "Task or ownership assignments" },
  { key: "comments", label: "Comments", description: "New discussion comments" },
  { key: "statusChanges", label: "Status updates", description: "Workflow and completion changes" },
  { key: "mentions", label: "Mentions", description: "Direct @mention alerts" },
  { key: "knowledgeBase", label: "Knowledge base", description: "Document publish, delete, restore actions" },
  { key: "userLifecycle", label: "User lifecycle", description: "Invite, suspension, reactivation actions" },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();
  const { preferences, updatePreferences, updateNotificationPreference } = usePreferences();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [tokenScopes, setTokenScopes] = useState<string[]>(["TASKS_READ"]);
  const [tokenExpiryDays, setTokenExpiryDays] = useState("30");
  const [newTokenValue, setNewTokenValue] = useState<string | null>(null);

  const currentProfileQuery = useQuery({
    queryKey: ["current-user-profile"],
    queryFn: fetchCurrentUserProfile,
    enabled: Boolean(user),
  });

  const projectsQuery = useQuery({
    queryKey: ["settings-projects"],
    queryFn: fetchProjects,
    enabled: Boolean(user),
  });

  const personalAccessTokensQuery = useQuery({
    queryKey: ["personal-access-tokens"],
    queryFn: fetchPersonalAccessTokens,
    enabled: Boolean(user),
  });

  const profile = currentProfileQuery.data;
  const projects = projectsQuery.data ?? [];
  const defaultProjectName = useMemo(() => {
    if (!preferences.defaultProjectId) {
      return "Not set";
    }
    return projects.find((project) => project.id === preferences.defaultProjectId)?.projectName ?? "Not set";
  }, [preferences.defaultProjectId, projects]);

  if (!user) {
    return <Alert severity="warning">You must be signed in to manage settings.</Alert>;
  }

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      await httpClient.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFormError(null);
      showSnackbar("Password changed successfully.", "success");
      updateUser({ ...user, passwordChangeRequired: false });
    },
    onError: () => {
      setFormError("Unable to change password.");
      showSnackbar("Unable to change password.", "error");
    },
  });

  const createTokenMutation = useMutation({
    mutationFn: async () => {
      const days = Number(tokenExpiryDays);
      const expiresAt = Number.isFinite(days) && days > 0
        ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 19)
        : null;
      return createPersonalAccessToken({
        tokenName: tokenName.trim(),
        scopes: tokenScopes,
        expiresAt,
      });
    },
    onSuccess: async (createdToken) => {
      setNewTokenValue(createdToken.plainTextToken ?? null);
      setTokenDialogOpen(false);
      setTokenName("");
      setTokenScopes(["TASKS_READ"]);
      setTokenExpiryDays("30");
      await queryClient.invalidateQueries({ queryKey: ["personal-access-tokens"] });
      showSnackbar("Personal access token created.", "success");
    },
    onError: () => {
      showSnackbar("Unable to create personal access token.", "error");
    },
  });

  const revokeTokenMutation = useMutation({
    mutationFn: revokePersonalAccessToken,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["personal-access-tokens"] });
      showSnackbar("Token revoked.", "success");
    },
    onError: () => {
      showSnackbar("Unable to revoke token.", "error");
    },
  });

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setFormError("All password fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setFormError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("New password and confirm password must match.");
      return;
    }
    changePasswordMutation.mutate();
  };

  return (
    <Stack spacing={3}>
      {user.passwordChangeRequired ? (
        <Alert severity="warning">
          Your account still requires a password setup or reset. Complete it now before continuing normal use.
        </Alert>
      ) : null}

      {newTokenValue ? (
        <Alert
          severity="success"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={async () => {
                await window.navigator.clipboard.writeText(newTokenValue);
                showSnackbar("Token copied to clipboard.", "success");
              }}
            >
              Copy
            </Button>
          }
        >
          Save this personal access token now. It will only be shown once: <strong>{newTokenValue}</strong>
        </Alert>
      ) : null}

      <Card sx={{ borderRadius: 5 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  Settings
                </Typography>
                <Typography color="text.secondary">
                  Keep the user and admin experience aligned with secure sign-in, personal preferences, and automation controls.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip icon={<PaletteRoundedIcon />} label={`${preferences.themeMode} theme`} />
                <Chip icon={<CalendarMonthRoundedIcon />} label={`Default project: ${defaultProjectName}`} />
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Stack direction={{ xs: "column", xl: "row" }} spacing={3} alignItems="stretch">
        <Card sx={{ flex: 1, borderRadius: 4 }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <ManageAccountsRoundedIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Profile & workspace defaults
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Choose what follows you across user and admin screens.
              </Typography>

              <TextField
                label="Theme"
                select
                value={preferences.themeMode}
                onChange={(event) => updatePreferences({ themeMode: event.target.value as "light" | "dark" })}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </TextField>

              <TextField
                label="Language / locale"
                select
                value={preferences.locale}
                onChange={(event) => updatePreferences({ locale: event.target.value })}
              >
                {LOCALE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Default project"
                select
                value={preferences.defaultProjectId ?? ""}
                onChange={(event) => updatePreferences({ defaultProjectId: event.target.value ? Number(event.target.value) : null })}
              >
                <MenuItem value="">No default project</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.projectCode} - {project.projectName}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Calendar start hour"
                select
                value={preferences.calendar.dayStartHour}
                onChange={(event) => {
                  const nextStartHour = Number(event.target.value);
                  updatePreferences({
                    calendar: {
                      dayStartHour: nextStartHour,
                      dayEndHour: Math.max(preferences.calendar.dayEndHour, nextStartHour + 1),
                    },
                  });
                }}
              >
                {Array.from({ length: 12 }, (_, index) => 6 + index).map((hour) => (
                  <MenuItem key={hour} value={hour}>
                    {hour}:00
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Calendar end hour"
                select
                value={preferences.calendar.dayEndHour}
                onChange={(event) => {
                  const nextEndHour = Number(event.target.value);
                  updatePreferences({
                    calendar: {
                      dayStartHour: Math.min(preferences.calendar.dayStartHour, nextEndHour - 1),
                      dayEndHour: nextEndHour,
                    },
                  });
                }}
              >
                {Array.from({ length: 12 }, (_, index) => 13 + index).map((hour) => (
                  <MenuItem key={hour} value={hour}>
                    {hour}:00
                  </MenuItem>
                ))}
              </TextField>

              <Button variant="outlined" onClick={() => navigate("/profile")}>
                Open profile page
              </Button>

              {profile ? (
                <Alert severity="info">
                  Signed in as <strong>{profile.fullName}</strong> {profile.designation ? `(${profile.designation})` : ""}.
                </Alert>
              ) : null}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 4 }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <NotificationsActiveRoundedIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Notification preferences
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                These preferences apply to your user workspace and admin workspace experience.
              </Typography>

              {NOTIFICATION_TOGGLE_OPTIONS.map((option) => (
                <FormControlLabel
                  key={option.key}
                  control={
                    <Switch
                      checked={preferences.notificationPreferences[option.key]}
                      onChange={(event) => updateNotificationPreference(option.key, event.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{option.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: "flex-start", ml: 0 }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Card sx={{ maxWidth: 760, borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Password & sign-in
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Keep your account ready for Jira-style invite and reset flows.
            </Typography>

            {formError ? <Alert severity="error">{formError}</Alert> : null}

            <TextField
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              fullWidth
            />
            <TextField
              label="New password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              helperText="Use at least 8 characters."
              fullWidth
            />
            <TextField
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              fullWidth
            />

            <Box>
              <Button variant="contained" onClick={handleChangePassword} disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? "Saving..." : "Change Password"}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <VpnKeyRoundedIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Personal access tokens
                </Typography>
              </Stack>
              <Button variant="contained" onClick={() => setTokenDialogOpen(true)}>
                Generate token
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Create scoped tokens for future API and automation use without exposing your password.
            </Typography>

            <Stack spacing={1.5}>
              {(personalAccessTokensQuery.data ?? []).map((token) => (
                <Card key={token.id} variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between">
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{token.tokenName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {token.tokenMaskedValue}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Scopes: {token.scopes.length > 0 ? token.scopes.join(", ") : "No scopes selected"}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={token.active ? "Active" : "Inactive"} color={token.active ? "success" : "default"} />
                        <Button
                          variant="outlined"
                          color="error"
                          disabled={!token.active || revokeTokenMutation.isPending}
                          onClick={() => revokeTokenMutation.mutate(token.id)}
                        >
                          Revoke
                        </Button>
                      </Stack>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Created {token.createdAt ? new Date(token.createdAt).toLocaleString() : "-"} {token.expiresAt ? `• Expires ${new Date(token.expiresAt).toLocaleString()}` : "• No expiry"}
                    </Typography>
                  </CardContent>
                </Card>
              ))}

              {(personalAccessTokensQuery.data ?? []).length === 0 ? (
                <Alert severity="info">No personal access tokens have been created yet.</Alert>
              ) : null}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={tokenDialogOpen} onClose={() => setTokenDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Generate personal access token</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Token name" value={tokenName} onChange={(event) => setTokenName(event.target.value)} fullWidth />
            <TextField
              label="Expiry (days)"
              type="number"
              value={tokenExpiryDays}
              onChange={(event) => setTokenExpiryDays(event.target.value)}
              fullWidth
            />
            <TextField
              label="Scopes"
              select
              SelectProps={{ multiple: true }}
              value={tokenScopes}
              onChange={(event) => setTokenScopes(typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value)}
              fullWidth
            >
              {TOKEN_SCOPE_OPTIONS.map((scope) => (
                <MenuItem key={scope} value={scope}>
                  {scope}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTokenDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!tokenName.trim() || tokenScopes.length === 0 || createTokenMutation.isPending}
            onClick={() => createTokenMutation.mutate()}
          >
            Create token
          </Button>
        </DialogActions>
      </Dialog>

      <PageSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      />
    </Stack>
  );
}
