import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { activateInvitation } from "@features/auth/services/authApi";

export function ActivateAccountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const tokenMissing = useMemo(() => !token.trim(), [token]);

  const mutation = useMutation({
    mutationFn: () => activateInvitation(token.trim(), password),
    onSuccess: () => {
      setFormError(null);
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "Unable to activate account.");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (tokenMissing) {
      setFormError("Invitation token is required.");
      return;
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    mutation.mutate();
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2, background: "linear-gradient(135deg, #f4f7fb 0%, #eaf2ff 100%)" }}>
      <Card sx={{ width: "100%", maxWidth: 440 }}>
        <CardContent>
          <Typography variant="h5">Activate Account</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Set your initial password to activate your account.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2.5 }}>
            <Stack spacing={1.5}>
              <TextField label="Invitation token" value={token} onChange={(event) => setToken(event.target.value)} />
              <TextField label="New password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <TextField label="Confirm password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              {formError ? <Alert severity="error">{formError}</Alert> : null}
              <Button type="submit" variant="contained" disabled={mutation.isPending}>
                {mutation.isPending ? "Activating..." : "Activate account"}
              </Button>
              <Button component={RouterLink} to="/login" variant="text">
                Back to sign in
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
