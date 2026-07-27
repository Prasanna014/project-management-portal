import { Alert, Snackbar } from "@mui/material";

export type SnackbarSeverity = "success" | "info" | "warning" | "error";

type PageSnackbarProps = {
  open: boolean;
  severity: SnackbarSeverity;
  message: string;
  onClose: () => void;
};

export function PageSnackbar({ open, severity, message, onClose }: PageSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3500}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert severity={severity} onClose={onClose} variant="filled" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
