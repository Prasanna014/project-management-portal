import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@features/auth/context/AuthContext";
import { loginWithPassword } from "@features/auth/services/authApi";

type LoginLocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const nextPath = (location.state as LoginLocationState | undefined)?.from?.pathname ?? "/";

  const loginMutation = useMutation({
    mutationFn: () => loginWithPassword({ email: email.trim(), password }),
    onSuccess: (result) => {
      setFormError(null);
      login(result.token, result.user);
      navigate(nextPath, { replace: true });
    },
    onError: () => {
      setFormError("Login failed. Check email and password.");
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setFormError("Email and password are required.");
      return;
    }

    loginMutation.mutate();
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2, background: "linear-gradient(135deg, #f4f7fb 0%, #eaf2ff 100%)" }}>
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent>
          <Typography variant="h5">Sign In</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Use your backend account to continue.
          </Typography>

          <Box component="form" onSubmit={onSubmit} sx={{ mt: 2.5 }}>
            <Stack spacing={1.5}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />

              {formError ? <Alert severity="error">{formError}</Alert> : null}

              <Button type="submit" variant="contained" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing In..." : "Sign In"}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
