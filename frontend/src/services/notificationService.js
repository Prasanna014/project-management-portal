// ================= src/services/notificationService.js =================// ================= src/servicesREAD ================= */
export const getUnreadNotifications = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/user/${userId}/unread`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching unread notifications for user ${userId}:`, error);
    throw error;
  }
};

/* ================= MARK ONE ================= */
export const markAsRead = async (notificationId) => {
  try {
    await axios.put(`${BASE_URL}/${notificationId}/read`);
  } catch (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error);
    throw error;
  }
};

/* ================= MARK ALL ================= */
export const markAllAsRead = async (userId) => {
  try {
    await axios.put(`${BASE_URL}/user/${userId}/read-all`);
  } catch (error) {
    console.error(`Error marking all notifications as read for user ${userId}:`, error);
    throw error;
  }
};

/* ================= CREATE ================= */
export const createNotification = async (notification) => {
  try {
    const response = await axios.post(BASE_URL, notification);
    return response.data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};
import axios from "axios";

const BASE_URL = "http://57.154.241.153:8080/api/notifications";

/* ================= GET ALL ================= */
export const getNotifications = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching notifications for user ${userId}:`, error);
    throw error;
  }
};


