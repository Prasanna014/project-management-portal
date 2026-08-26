import { Alert, Box, Button, Card, CardContent, Link, Stack, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import { requestForgotPassword } from "@features/auth/services/authApi";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => requestForgotPassword(email.trim()),
    onSuccess: (result) => {
      setFormError(null);
      setResetLink(result.passwordResetLink ?? null);
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "Unable to request a password reset.");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setFormError("Email is required.");
      return;
    }
    mutation.mutate();
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2, background: "linear-gradient(135deg, #f4f7fb 0%, #eaf2ff 100%)" }}>
      <Card sx={{ width: "100%", maxWidth: 440 }}>
        <CardContent>
          <Typography variant="h5">Forgot Password</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Request a password reset link for your account.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2.5 }}>
            <Stack spacing={1.5}>
              <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              {formError ? <Alert severity="error">{formError}</Alert> : null}
              {resetLink ? (
                <Alert severity="success">
                  Reset link ready:{" "}
                  <Link href={resetLink} target="_blank" rel="noreferrer">
                    open reset page
                  </Link>
                </Alert>
              ) : null}
              <Button type="submit" variant="contained" disabled={mutation.isPending}>
                {mutation.isPending ? "Submitting..." : "Request reset"}
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
