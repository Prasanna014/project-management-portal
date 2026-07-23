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
