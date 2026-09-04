import { Alert, Box, Paper, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@shared/api/httpClient";
import { LoadingState } from "@shared/ui/states/LoadingState";
import { ErrorState } from "@shared/ui/states/ErrorState";

type PlatformMetrics = {
  totalCompanies: number;
  totalProjects: number;
  totalUsers: number;
  totalTickets: number;
  activeCompanies: number;
  suspendedCompanies: number;
};

export function PlatformDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["platform-dashboard"],
    queryFn: async () => (await httpClient.get<PlatformMetrics>("/platform/dashboard")).data,
  });

  if (dashboardQuery.isLoading) return <LoadingState variant="page" />;
  if (dashboardQuery.isError) return <ErrorState message={(dashboardQuery.error as Error).message} onRetry={() => dashboardQuery.refetch()} />;

  const metrics = dashboardQuery.data;
  if (!metrics) return <Alert severity="info">Platform metrics are not available.</Alert>;

  const items: Array<[string, number]> = [
    ["Companies", metrics.totalCompanies],
    ["Projects", metrics.totalProjects],
    ["Users", metrics.totalUsers],
    ["Tickets", metrics.totalTickets],
    ["Active Companies", metrics.activeCompanies],
    ["Suspended Companies", metrics.suspendedCompanies],
  ];

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5">Platform Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">SupportFlow tenant, subscription, and operational metrics.</Typography>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 2 }}>
        {items.map(([label, value]) => (
          <Paper key={label} sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="h4" sx={{ mt: 0.5 }}>{value}</Typography>
          </Paper>
        ))}
      </Box>
    </Stack>
  );
}
