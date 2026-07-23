// ================= src/services/reportService.js =================
import axios from "axios";

const BASE_URL = "http://57.154.241.153:8080/api/reports";

/* ================= TASK SUMMARY ================= */
export const getTaskSummaryReport = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/task-summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching task summary report:", error);
    throw error;
  }
};

/* ================= OPEN TASKS ================= */
export const getOpenTasksReport = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/open-tasks`);
    return response.data;
  } catch (error) {
    console.error("Error fetching open tasks report:", error);
    throw error;
  }
};

/* ================= COMPLETED TASKS ================= */
export const getCompletedTasksReport = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/completed-tasks`);
    return response.data;
  } catch (error) {
    console.error("Error fetching completed tasks report:", error);
    throw error;
  }
};

/* ================= PRIORITY REPORT ================= */
export const getPriorityReport = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/priority`);
    return response.data;
  } catch (error) {
    console.error("Error fetching priority report:", error);
    throw error;
  }
};

/* ================= OWNER WORKLOAD ================= */
export const getOwnerWorkloadReport = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/owner-workload`);
    return response.data;
  } catch (error) {
    console.error("Error fetching owner workload report:", error);
    throw error;
  }
};
