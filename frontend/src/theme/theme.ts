import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#005CBB" },
    secondary: { main: "#2D7D46" },
    background: { default: "#F4F6F8", paper: "#FFFFFF" },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
  },
});

export default theme;
