import { Backdrop, CircularProgress } from "@mui/material";

export default function GlobalLoader({ open }) {
  return (
    <Backdrop sx={{ zIndex: 9999 }} open={open}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
