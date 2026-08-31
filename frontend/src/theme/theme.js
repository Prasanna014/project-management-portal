// ================= src/theme/theme.js =================
import { createTheme } from "@mui/material/styles";

export function createAppTheme(mode = "light") {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: { main: "#4F46E5", light: "#818CF8", dark: "#3730A3", contrastText: "#fff" },
      secondary: { main: "#0EA5E9", contrastText: "#fff" },
      success: { main: "#059669" },
      warning: { main: "#D97706" },
      error: { main: "#DC2626" },
      background: { default: isDark ? "#0f172a" : "#F8FAFC", paper: isDark ? "#111827" : "#FFFFFF" },
      text: { primary: isDark ? "#e5e7eb" : "#0F172A", secondary: isDark ? "#cbd5e1" : "#64748B" },
      divider: isDark ? "#334155" : "#E2E8F0",
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: "none" },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: isDark ? "#0f172a" : "#F8FAFC" },
          "*": { boxSizing: "border-box" },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? "0 1px 3px rgba(15,23,42,0.30), 0 1px 2px rgba(15,23,42,0.24)"
              : "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
            border: `1px solid ${isDark ? "#334155" : "#E2E8F0"}`,
            transition: "box-shadow 0.2s ease, transform 0.2s ease",
            "&:hover": {
              boxShadow: isDark ? "0 6px 20px rgba(15,23,42,0.34)" : "0 6px 20px rgba(15,23,42,0.10)",
              transform: "translateY(-1px)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none", fontWeight: 600, borderRadius: "8px", letterSpacing: "0.01em" },
          containedPrimary: {
            background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
            boxShadow: "0 2px 8px rgba(79,70,229,0.28)",
            "&:hover": {
              background: "linear-gradient(135deg, #3730A3 0%, #4F46E5 100%)",
              boxShadow: "0 4px 14px rgba(79,70,229,0.38)",
            },
          },
          containedSuccess: {
            background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
            boxShadow: "0 2px 8px rgba(5,150,105,0.25)",
            "&:hover": { background: "linear-gradient(135deg, #047857 0%, #059669 100%)" },
          },
          containedError: {
            background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
            "&:hover": { background: "linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)" },
          },
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiTextField: {
        defaultProps: { size: "small" },
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "& fieldset": { borderColor: isDark ? "#475569" : "#E2E8F0" },
              "&:hover fieldset": { borderColor: isDark ? "#94A3B8" : "#94A3B8" },
              "&.Mui-focused fieldset": { borderColor: "#4F46E5" },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
    },
  });
}

const theme = createAppTheme();

export default theme;
