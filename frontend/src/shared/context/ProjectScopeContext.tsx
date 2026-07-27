import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ProjectScopeContextValue = {
  selectedProjectId: number | null;
  setSelectedProjectId: (projectId: number | null) => void;
};

const ProjectScopeContext = createContext<ProjectScopeContextValue | undefined>(undefined);

export function ProjectScopeProvider({ children }: { children: ReactNode }) {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const value = useMemo(
    () => ({ selectedProjectId, setSelectedProjectId }),
    [selectedProjectId]
  );

  return <ProjectScopeContext.Provider value={value}>{children}</ProjectScopeContext.Provider>;
}

export function useProjectScope() {
  const context = useContext(ProjectScopeContext);
  if (!context) {
    throw new Error("useProjectScope must be used within a ProjectScopeProvider");
  }
  return context;
}
