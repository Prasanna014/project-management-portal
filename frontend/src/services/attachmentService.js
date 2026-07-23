// ================= src/services/attachmentService.js =================
import axios from "axios";

const BASE_URL = "http://57.154.241.153:8080/api/attachments";

/* ================= GET ATTACHMENTS ================= */
export const getAttachments = async (taskId) => {
  try {
    const response = await axios.get(`${BASE_URL}/task/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching attachments for task ${taskId}:`, error);
    throw error;
  }
};

/* ================= UPLOAD ATTACHMENT ================= */
export const uploadAttachment = async (taskId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${BASE_URL}/task/${taskId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error uploading attachment for task ${taskId}:`, error);
    throw error;
  }
};

/* ================= DOWNLOAD ATTACHMENT ================= */
export const downloadAttachment = async (attachmentId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/${attachmentId}/download`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `Error downloading attachment with id ${attachmentId}:`,
      error
    );
    throw error;
  }
};

/* ================= DELETE ATTACHMENT ================= */
export const deleteAttachment = async (attachmentId) => {
  try {
    await axios.delete(`${BASE_URL}/${attachmentId}`);
  } catch (error) {
    console.error(
      `Error deleting attachment with id ${attachmentId}:`,
      error
    );
    throw error;
  }
};
