import { createTheme, type PaletteMode } from "@mui/material/styles";

export function createAppTheme(mode: PaletteMode = "light") {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: { main: "#005CBB" },
      secondary: { main: "#2D7D46" },
      background: {
        default: isDark ? "#0f172a" : "#F4F6F8",
        paper: isDark ? "#111827" : "#FFFFFF",
      },
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
    },
  });
}

const theme = createAppTheme();

export default theme;
