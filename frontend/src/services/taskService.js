import API from "./api";

// ✅ GET ALL
export const getAllTasks = () => {
  return API.get("/tasks").then((res) => res.data);
};

// ✅ GET BY ID
export const getTaskById = (id) => {
  return API.get(`/tasks/${id}`).then((res) => res.data);
};

// ✅ CREATE
export const createTask = (task) => {
  return API.post("/tasks", task).then((res) => res.data);
};

// ✅ UPDATE
export const updateTask = (id, task) => {
  return API.put(`/tasks/${id}`, task).then((res) => res.data);
};

// ✅ DELETE
export const deleteTask = (id) => {
  return API.delete(`/tasks/${id}`);
};

// ✅ WORKFLOW: get transitions valid from the task's current state
export const getAvailableTransitions = (taskId) => {
  return API.get(`/tasks/${taskId}/workflow/transitions`).then((res) => res.data);
};

// ✅ WORKFLOW: execute a transition; comment required when requiresComment=true
export const executeTransition = (taskId, transitionId, comment) => {
  return API.post(`/tasks/${taskId}/workflow/transition`, { transitionId, comment }).then((res) => res.data);
};
