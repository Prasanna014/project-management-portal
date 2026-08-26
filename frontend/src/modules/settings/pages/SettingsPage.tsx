import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useAuth } from "@features/auth/context/AuthContext";
import { httpClient } from "@shared/api/httpClient";
import { PageSnackbar, type SnackbarSeverity } from "@shared/ui/feedback/PageSnackbar";

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: SnackbarSeverity }>({
    open: false,
    message: "",
    severity: "info",
  });

  if (!user) {
    return <Alert severity="warning">You must be signed in to manage settings.</Alert>;
  }

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
      setSnackbar({ open: true, message: "Password changed successfully.", severity: "success" });
      updateUser({ ...user, passwordChangeRequired: false });
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "Unable to change password.");
      setSnackbar({ open: true, message: "Unable to change password.", severity: "error" });
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
      {user?.passwordChangeRequired ? (
        <Alert severity="warning">
          Your account was created with a temporary password. Change it now before continuing normal use.
        </Alert>
      ) : null}

      <Card sx={{ maxWidth: 640 }}>
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h5">Settings</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your sign-in password for this portal.
              </Typography>
            </Box>

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

      <PageSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      />
    </Stack>
  );
}
