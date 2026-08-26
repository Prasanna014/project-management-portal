import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@features/auth/context/AuthContext";
import { queryClient } from "@app/providers/queryClient";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { ProjectScopeProvider } from "@shared/context/ProjectScopeContext";
import { PreferencesProvider, usePreferences } from "@shared/preferences/PreferencesContext";
import { createAppTheme } from "@theme/theme";

function ThemedProviders({ children }: { children: ReactNode }) {
  const { preferences } = usePreferences();
  const theme = useMemo(() => createAppTheme(preferences.themeMode), [preferences.themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProjectScopeProvider>
            <BrowserRouter>{children}</BrowserRouter>
          </ProjectScopeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PreferencesProvider>
      <ThemedProviders>{children}</ThemedProviders>
    </PreferencesProvider>
  );
}
