// ================= src/services/userService.js =================
import axios from "axios";

const BASE_URL = "http://57.154.241.153:8080/api/users";

/* ================= GET ALL USERS ================= */
export const getAllUsers = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/* ================= GET USER BY ID ================= */
export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    throw error;
  }
};

/* ================= CREATE USER ================= */
export const createUser = async (user) => {
  try {
    const response = await axios.post(BASE_URL, user);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/* ================= UPDATE USER ================= */
export const updateUser = async (id, user) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, user);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with id ${id}:`, error);
    throw error;
  }
};

/* ================= DELETE USER ================= */
export const deleteUser = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting user with id ${id}:`, error);
    throw error;
  }
};

/* ================= GET ACTIVE USERS ================= */
export const getActiveUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/active`);
    return response.data;
  } catch (error) {
    console.error("Error fetching active users:", error);
    throw error;
  }
};
