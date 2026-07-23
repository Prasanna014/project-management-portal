// ================= src/services/activityService.js =================
import axios from "axios";

const BASE_URL = "http://57.154.241.153:8080/api/activity";

/* ================= GET TASK HISTORY ================= */
export const getTaskHistory = async (taskId) => {
  try {
    const response = await axios.get(`${BASE_URL}/task/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching activity history for task ${taskId}:`, error);
    throw error;
  }
};

/* ================= CREATE ACTIVITY ================= */
export const createActivity = async (activity) => {
  try {
    const response = await axios.post(BASE_URL, activity);
    return response.data;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
};

