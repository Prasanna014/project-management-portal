import API from "./api";

export const getNotifications = async (userId) => {
  const response = await API.get(`/notifications/user/${userId}`);
  return response.data;
};

export const getUnreadNotifications = async (userId) => {
  const response = await API.get(`/notifications/user/${userId}/unread`);
  return response.data;
};

export const markAsRead = async (notificationId) => {
  await API.put(`/notifications/${notificationId}/read`);
};

export const markAllAsRead = async (userId) => {
  await API.put(`/notifications/user/${userId}/read-all`);
};

export const createNotification = async (notification) => {
  const response = await API.post("/notifications", notification);
  return response.data;
};
