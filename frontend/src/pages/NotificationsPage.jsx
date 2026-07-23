import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Snackbar
} from "@mui/material";

import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from "../services/notificationService";

export default function NotificationsPage() {

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ LOAD NOTIFICATIONS
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      setNotifications(res.data);
    } catch {
      setError("Failed to load notifications");
    } finally {
      setLoading### ✅ MODULE 6 — NOTIFICATIONS (FULL BACKEND INTEGRATION)

---

### ✅ `src/pages/NotificationsPage.jsx`

```jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Snackbar
} from "@mui/material";

import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from "../services/notificationService";

export default function NotificationsPage() {

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ LOAD NOTIFICATIONS
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      setNotifications(res.data);
    } catch {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // ✅ MARK SINGLE AS READ
  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setSuccess("Notification marked as read");
      loadNotifications();
    } catch {
      setError("Failed to update notification");
    }
  };

  // ✅ MARK ALL AS READ
  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setSuccess("All notifications marked as read");
      loadNotifications();
    } catch {
      setError("Failed to update notifications");
    }
  };

  return (
    <Box sx={{ p: 3 }}>

      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Notifications</Typography>

        <Button variant="contained" onClick={handleMarkAll}>
          Mark All Read
        </Button>
      </Box>

      {/* ✅ LIST UI PRESERVED */}
      <List>
        {notifications.map((n) => (
          <ListItem
            key={n.id}
            sx={{
              backgroundColor: n.isRead ? "#fff" : "#e3f2fd",
              mb: 1
            }}
          >
            <ListItemText
              primary={n.title}
              secondary={n.message}
            />

            {!n.isRead && (
              <Button onClick={() => handleMarkRead(n.id)}>
                Mark Read
              </Button>
            )}
          </ListItem>
        ))}
      </List>

      {/* ✅ SNACKBARS */}
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
