import API from "./api";

const pid = (projectId) => projectId ? { params: { projectId } } : {};

export const getDashboardSummary = async (projectId) => {
  const response = await API.get("/dashboard/summary", pid(projectId));
  return response.data;
};

export const getStatusSummary = async (projectId) => {
  const response = await API.get("/dashboard/status", pid(projectId));
  return response.data;
};

export const getPrioritySummary = async (projectId) => {
  const response = await API.get("/dashboard/priority", pid(projectId));
  return response.data;
};

export const getOwnerWorkload = async (projectId) => {
  const response = await API.get("/dashboard/workload", pid(projectId));
  return response.data;
};

