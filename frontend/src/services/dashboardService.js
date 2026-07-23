import API from "./api";

/* ================= SUMMARY ================= */
export const getDashboardSummary = async () => {
  try {
    const response = await API.get("/dashboard/summary");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw error;
  }
};

/* ================= STATUS ================= */
export const getStatusSummary = async () => {
  try {
    const response = await API.get("/dashboard/status");
    return response.data;
  } catch (error) {
    console.error("Error fetching status summary:", error);
    throw error;
  }
};

/* ================= PRIORITY ================= */
export const getPrioritySummary = async () => {
  try {
    const response = await API.get("/dashboard/priority");
    return response.data;
  } catch (error) {
    console.error("Error fetching priority summary:", error);
    throw error;
  }
};

/* ================= WORKLOAD ================= */
export const getOwnerWorkload = async () => {
  try {
    const response = await API.get("/dashboard/workload");
    return response.data;
  } catch (error) {
    console.error("Error fetching owner workload:", error);
    throw error;
  }
};

