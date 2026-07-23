import API from "./api";

/* ================= GET ALL USERS ================= */
export const getUsers = async () => {
  try {
    const response = await API.get("/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/* ================= GET USER BY ID ================= */
export const getUserById = async (id) => {
  try {
    const response = await API.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    throw error;
  }
};

/* ================= CREATE USER ================= */
export const createUser = async (user) => {
  try {
    const response = await API.post("/users", user);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/* ================= UPDATE USER ================= */
export const updateUser = async (id, user) => {
  try {
    const response = await API.put(`/users/${id}`, user);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with id ${id}:`, error);
    throw error;
  }
};

/* ================= DELETE USER ================= */
export const deleteUser = async (id) => {
  try {
    await API.delete(`/users/${id}`);
  } catch (error) {
    console.error(`Error deleting user with id ${id}:`, error);
    throw error;
  }
};

/* ================= GET ACTIVE USERS ================= */
export const getActiveUsers = async () => {
  try {
    const response = await API.get("/users/active");
    return response.data;
  } catch (error) {
    console.error("Error fetching active users:", error);
    throw error;
  }
};

export const getAllUsers = getUsers;
