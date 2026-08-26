import { httpClient } from "@shared/api/httpClient";

export type NotificationRecord = {
  id: number;
  userId: number;
  taskId?: number | null;
  projectId?: number | null;
  title: string;
  message?: string | null;
  notificationType?: string | null;
  isRead: boolean;
  createdAt?: string | null;
};

export async function fetchNotifications(userId: number): Promise<NotificationRecord[]> {
  const response = await httpClient.get<NotificationRecord[]>(`/notifications/user/${userId}`);
  return response.data;
}

export async function fetchUnreadNotifications(userId: number): Promise<NotificationRecord[]> {
  const response = await httpClient.get<NotificationRecord[]>(`/notifications/user/${userId}/unread`);
  return response.data;
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  await httpClient.put(`/notifications/${notificationId}/read`);
}

export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  await httpClient.put(`/notifications/user/${userId}/read-all`);
}
