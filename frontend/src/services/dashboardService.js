import axios from "axios";

// ✅ CLEAN CORRECT URL (NO HTML, NO <a>, NO extra text)
const BASE_URL = "http://57.154.241.153:8080/api/dashboard";
// OR if using local backend:
// const BASE_URL = "http://localhost:8080/api/dashboard";

/* ================= SUMMARY ================= */
export const getDashboardSummary = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw error;
  }
};

/* ================= STATUS ================= */
export const getStatusSummary = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/status`);
    return response.data;
  } catch (error) {
    console.error("Error fetching status summary:", error);
    throw error;
  }
};

/* ================= PRIORITY ================= */
export const getPrioritySummary = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/priority`);
    return response.data;
  } catch (error) {
    console.error("Error fetching priority summary:", error);
    throw error;
  }
};

/* ================= WORKLOAD ================= */
export const getOwnerWorkload = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/workload`);
    return response.data;
  } catch (error) {
    console.error("Error fetching owner workload:", error);
    throw error;
  }
};

