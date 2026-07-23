import API from "./api";

/* ================= GET TASK HISTORY ================= */
export const getTaskHistory = async (taskId) => {
  try {
    const response = await API.get(`/activity/task/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching activity history for task ${taskId}:`, error);
    throw error;
  }
};

/* ================= CREATE ACTIVITY ================= */
export const createActivity = async (activity) => {
  try {
    const response = await API.post("/activity", activity);
    return response.data;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
};

export const getActivity = getTaskHistory;

