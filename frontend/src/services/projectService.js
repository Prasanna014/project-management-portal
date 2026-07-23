// ================= src/services/projectService.js =================
import axios from "axios";

const BASE_URL = "http://57.154.241.153:8080/api/projects";

/* ================= GET ALL ================= */
export const getAllProjects = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching all projects:", error);
    throw error;
  }
};

/* ================= GET BY ID ================= */
export const getProjectById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project with id ${id}:`, error);
    throw error;
  }
};

/* ================= CREATE ================= */
export const createProject = async (project) => {
  try {
    const response = await axios.post(BASE_URL, project);
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

/* ================= UPDATE ================= */
export const updateProject = async (id, project) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, project);
    return response.data;
  } catch (error) {
    console.error(`Error updating project with id ${id}:`, error);
    throw error;
  }
};

/* ================= DELETE ================= */
export const deleteProject = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting project with id ${id}:`, error);
    throw error;
  }
};

/* ================= SEARCH ================= */
export const searchProjects = async (projectName) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: { projectName },
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
    const response = await axios.get(BASE_URL, {
      params: { active: true },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching active projects:", error);
    throw error;
  }
};
