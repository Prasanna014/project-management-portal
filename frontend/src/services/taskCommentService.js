// ================= src/services/taskCommentService.js =================
import axios from "axios";

const BASE_URL = "http://57.154.241.153:8080/api";

/* ================= GET COMMENTS ================= */
export const getCommentsByTaskId = async (taskId) => {
  try {
    const response = await axios.get(`${BASE_URL}/tasks/${taskId}/comments`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for task ${taskId}:`, error);
    throw error;
  }
};

/* ================= ADD COMMENT ================= */
export const addComment = async (taskId, comment) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/tasks/${taskId}/comments`,
      comment
    );
    return response.data;
  } catch (error) {
    console.error(`Error adding comment for task ${taskId}:`, error);
    throw error;
  }
};

/* ================= DELETE COMMENT ================= */
export const deleteComment = async (commentId) => {
  try {
    await axios.delete(`${BASE_URL}/comments/${commentId}`);
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    throw error;
  }
};
