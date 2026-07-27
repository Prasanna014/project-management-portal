import { Paper, Typography } from "@mui/material";

type ModulePlaceholderProps = {
  title: string;
  note?: string;
};

export function ModulePlaceholder({ title, note }: ModulePlaceholderProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {note ?? "Module scaffold only. Implementation starts in the next approved step."}
      </Typography>
    </Paper>
  );
}
