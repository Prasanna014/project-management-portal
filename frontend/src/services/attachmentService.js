import API from "./api";

/* ================= GET ATTACHMENTS ================= */
export const getAttachments = async (taskId) => {
  try {
    const response = await API.get(`/attachments/task/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching attachments for task ${taskId}:`, error);
    throw error;
  }
};

/* ================= UPLOAD ATTACHMENT ================= */
export const uploadAttachment = async (taskId, file, uploadedBy) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    if (uploadedBy !== null && uploadedBy !== undefined) {
      formData.append("uploadedBy", String(uploadedBy));
    }

    const response = await API.post(
      `/attachments/task/${taskId}`,
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
    const response = await API.get(
      `/attachments/${attachmentId}/download`,
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
    await API.delete(`/attachments/${attachmentId}`);
  } catch (error) {
    console.error(
      `Error deleting attachment with id ${attachmentId}:`,
      error
    );
    throw error;
  }
};
