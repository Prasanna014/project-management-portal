import API from "./api";

/* ================= GET ALL ================= */
export const getAllProjects = async () => {
  try {
    const response = await API.get("/projects");
    return response.data;
  } catch (error) {
    console.error("Error fetching all projects:", error);
    throw error;
  }
};

/* ================= GET BY ID ================= */
export const getProjectById = async (id) => {
  try {
    const response = await API.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project with id ${id}:`, error);
    throw error;
  }
};

/* ================= CREATE ================= */
export const createProject = async (project) => {
  try {
    const response = await API.post("/projects", project);
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

/* ================= UPDATE ================= */
export const updateProject = async (id, project) => {
  try {
    const response = await API.put(`/projects/${id}`, project);
    return response.data;
  } catch (error) {
    console.error(`Error updating project with id ${id}:`, error);
    throw error;
  }
};

/* ================= DELETE ================= */
export const deleteProject = async (id) => {
  try {
    await API.delete(`/projects/${id}`);
  } catch (error) {
    console.error(`Error deleting project with id ${id}:`, error);
    throw error;
  }
};

/* ================= SEARCH ================= */
export const searchProjects = async (keyword) => {
  try {
    const response = await API.get("/search/projects", {
      params: { keyword },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching projects:", error);
    throw error;
  }
};

/* ================= GET ACTIVE ================= */
export const getActiveProjects = async () => {
  try {
    const projects = await getAllProjects();
    return (projects || []).filter((p) => p.active);
  } catch (error) {
    console.error("Error fetching active projects:", error);
    throw error;
  }
};
