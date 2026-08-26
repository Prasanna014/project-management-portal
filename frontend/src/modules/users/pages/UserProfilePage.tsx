import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Button, Card, CardContent, Chip, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@features/auth/context/AuthContext";
import { fetchCurrentUserProfile } from "@modules/users/services/usersApi";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { LoadingState } from "@shared/ui/states/LoadingState";

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function formatStatus(status?: string | null) {
  return status ? status.replaceAll("_", " ") : "Unknown";
}

export function UserProfilePage() {
  const { user } = useAuth();

  const profileQuery = useQuery({
    queryKey: ["current-user-profile", user?.userId],
    queryFn: fetchCurrentUserProfile,
    enabled: Boolean(user?.userId),
  });

  if (!user) {
    return <Alert severity="warning">You must be signed in to view your profile.</Alert>;
  }

  const profile = profileQuery.data;

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 5,
          overflow: "hidden",
          background: "linear-gradient(135deg, #f8fbff 0%, #eff6ff 52%, #eef2ff 100%)",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          boxShadow: "0 24px 50px rgba(15, 23, 42, 0.08)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.25 } }}>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5} justifyContent="space-between">
            <Stack spacing={1.3}>
              <Chip label="Enterprise profile view" sx={{ alignSelf: "flex-start", bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 700 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
                My Profile
              </Typography>
              <Typography sx={{ color: "#475569", maxWidth: 680 }}>
                View your organization-aligned user profile, reporting structure, and access status exactly as provisioned by the admin team.
              </Typography>
            </Stack>
            <Button component={RouterLink} to="/settings" variant="outlined" sx={{ alignSelf: { xs: "stretch", lg: "flex-start" }, textTransform: "none", borderRadius: 999 }}>
              Open Security Settings
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {profileQuery.isLoading ? <LoadingState variant="cards" rows={6} /> : null}
      {profileQuery.isError ? <ErrorState message="Unable to load your profile." onRetry={() => profileQuery.refetch()} /> : null}

      {profile ? (
        <>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" },
            }}
          >
            {[
              { label: "Department", value: profile.departmentName ?? "-" },
              { label: "Designation", value: profile.designation ?? "-" },
              { label: "Reporting Manager", value: profile.reportingManagerName ?? "-" },
              { label: "Account Status", value: formatStatus(profile.accountStatus) },
            ].map((item) => (
              <Paper key={item.label} sx={{ p: 2.25, borderRadius: 4, border: "1px solid rgba(148, 163, 184, 0.18)" }}>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1, fontWeight: 700, color: "#0f172a" }}>
                  {item.value}
                </Typography>
              </Paper>
            ))}
          </Box>

          <Paper sx={{ p: 2.5, borderRadius: 4 }}>
            <Stack spacing={1.5}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Identity details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                These fields are managed as part of the enterprise onboarding record and currently reflect admin-managed values.
              </Typography>
              {[
                ["Full Name", profile.fullName],
                ["Email", profile.email],
                ["Employee ID", profile.employeeId],
                ["Role", profile.role ?? "-"],
                ["Active", profile.active ? "Yes" : "No"],
                ["Last Login", formatDate(profile.lastLoginAt)],
                ["Created", formatDate(profile.createdAt)],
                ["Updated", formatDate(profile.updatedAt)],
              ].map(([label, value]) => (
                <Box key={label} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "180px 1fr" }, gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155" }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </>
      ) : null}
    </Stack>
  );
}
