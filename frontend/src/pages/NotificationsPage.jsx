import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  TextField
} from "@mui/material";

import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from "../services/notificationService";

export default function NotificationsPage() {
  const defaultUserId = Number(import.meta.env.VITE_DEFAULT_USER_ID || 1);
  const [userId, setUserId] = useState(defaultUserId);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hasUnread = useMemo(() => notifications.some((n) => !n.isRead), [notifications]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications(userId);
      setNotifications(data || []);
    } catch {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setSuccess("Notification marked as read");
      loadNotifications();
    } catch {
      setError("Failed to update notification");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead(userId);
      setSuccess("All notifications marked as read");
      loadNotifications();
    } catch {
      setError("Failed to update notifications");
    }
  };

  return (
    <Box>
        <Box display="flex" justifyContent="space-between" gap={2} mb={2}>
          <Typography variant="h5">Notifications</Typography>
          <TextField
            size="small"
            type="number"
            label="User ID"
            value={userId}
            onChange={(e) => setUserId(Number(e.target.value || defaultUserId))}
            sx={{ width: 140 }}
          />
          <Button variant="contained" onClick={handleMarkAll} disabled={!hasUnread || loading}>
            Mark All Read
          </Button>
        </Box>

        <List>
          {notifications.map((n) => (
            <ListItem
              key={n.id}
              sx={{
                backgroundColor: n.isRead ? "#fff" : "#e3f2fd",
                mb: 1
            }}
          >
            <ListItemText primary={n.title} secondary={n.message} />

            {!n.isRead && (
              <Button onClick={() => handleMarkRead(n.id)}>
                Mark Read
              </Button>
            )}
          </ListItem>
        ))}
        </List>

        <Snackbar
          open={!!error}
          message={error}
          autoHideDuration={3000}
          onClose={() => setError("")}
        />

        <Snackbar
          open={!!success}
          message={success}
          autoHideDuration={3000}
          onClose={() => setSuccess("")}
        />
    </Box>
  );
}
