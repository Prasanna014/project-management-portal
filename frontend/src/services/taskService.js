// ================= src/services/taskService.js =================
import axios from "axios";

const BASE_URL = "http://57.154.241.153:8080/api/tasks";

// ✅ GET ALL
export const getAllTasks = () => {
  return axios.get(BASE_URL);
};

// ✅ GET BY ID
export const getTaskById = (id) => {
  return axios.get(`${BASE_URL}/${id}`);
};

// ✅ CREATE
export const createTask = (task) => {
  return axios.post(BASE_URL, task);
};

// ✅ UPDATE
export const updateTask = (id, task) => {
  return axios.put(`${BASE_URL}/${id}`, task);
};

// ✅ DELETE
export const deleteTask = (id) => {
  return axios.delete(`${BASE_URL}/${id}`);
};
