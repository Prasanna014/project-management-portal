import API from "./api";

/* ================= GET COMMENTS ================= */
export const getCommentsByTaskId = async (taskId) => {
  try {
    const response = await API.get(`/tasks/${taskId}/comments`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for task ${taskId}:`, error);
    throw error;
  }
};

/* ================= ADD COMMENT ================= */
export const addComment = async (taskId, comment) => {
  try {
    const response = await API.post(
      `/tasks/${taskId}/comments`,
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
    await API.delete(`/comments/${commentId}`);
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    throw error;
  }
};

export const getComments = getCommentsByTaskId;
