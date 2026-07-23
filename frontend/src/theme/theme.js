// ================= src/theme/theme.js =================
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976D2" },
    background: { default: "#F4F5F7" },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          padding: 24,
          boxShadow: "0px 1px 3px rgba(0,0,0,0.08)",
        },
      },
    },
  },
});

export default theme;
