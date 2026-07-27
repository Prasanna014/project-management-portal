import { Paper, Typography } from "@mui/material";

type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Paper sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h6">{title}</Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      ) : null}
    </Paper>
  );
}
