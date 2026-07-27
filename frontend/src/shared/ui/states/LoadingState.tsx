import { Box, Grid, Skeleton, Stack } from "@mui/material";

type LoadingStateProps = {
  variant?: "cards" | "table";
  rows?: number;
};

export function LoadingState({ variant = "table", rows = 6 }: LoadingStateProps) {
  if (variant === "cards") {
    return (
      <Grid container spacing={2}>
        {[0, 1, 2, 3].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Skeleton variant="rounded" height={96} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box sx={{ py: 1 }}>
      <Stack spacing={1.2}>
        {[...Array(rows)].map((_, index) => (
          <Skeleton key={index} variant="rounded" height={42} />
        ))}
      </Stack>
    </Box>
  );
}
