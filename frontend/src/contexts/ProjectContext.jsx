import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getAllProjects } from "../services/projectService";

const ProjectContext = createContext({
  projects: [],
  selectedProjectId: "",
  setSelectedProjectId: () => {},
  loading: false,
});

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loading, setLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllProjects();
      setProjects(data || []);
    } catch {
      // silently fail — header will show empty dropdown
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <ProjectContext.Provider value={{ projects, selectedProjectId, setSelectedProjectId, loading }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => useContext(ProjectContext);
