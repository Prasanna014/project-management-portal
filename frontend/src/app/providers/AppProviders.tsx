import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@features/auth/context/AuthContext";
import { queryClient } from "@app/providers/queryClient";
import theme from "@theme/theme";
import type { ReactNode } from "react";
import { ProjectScopeProvider } from "@shared/context/ProjectScopeContext";

export function AppProviders({ children }: { children: ReactNode }) {
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
