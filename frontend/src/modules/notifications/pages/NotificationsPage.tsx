import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import { useAuth } from "@features/auth/context/AuthContext";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { EmptyState } from "@shared/ui/states/EmptyState";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationRecord,
} from "@modules/notifications/services/notificationsApi";

type FilterMode = "all" | "unread";

function getNotificationIcon(type?: string | null) {
  const normalized = (type ?? "").toLowerCase();
  if (normalized.includes("comment")) return <CommentRoundedIcon fontSize="small" />;
  if (normalized.includes("assign")) return <AssignmentTurnedInRoundedIcon fontSize="small" />;
  if (normalized.includes("mention")) return <AlternateEmailRoundedIcon fontSize="small" />;
  if (normalized.includes("project")) return <FolderRoundedIcon fontSize="small" />;
  if (normalized.includes("status")) return <AutorenewRoundedIcon fontSize="small" />;
  return <NotificationsRoundedIcon fontSize="small" />;
}

function getNotificationRoute(notification: NotificationRecord) {
  if (notification.taskId) {
    return `/task/${notification.taskId}`;
  }
  if (notification.projectId) {
    return `/projects?projectId=${notification.projectId}`;
  }
  return "/tasks";
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.userId ?? 0;
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const notificationsQuery = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => fetchNotifications(userId),
    enabled: Boolean(userId),
    refetchInterval: 30000,
  });

  const markOneMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notifications", userId] }),
        queryClient.invalidateQueries({ queryKey: ["notifications-unread", userId] }),
      ]);
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(userId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notifications", userId] }),
        queryClient.invalidateQueries({ queryKey: ["notifications-unread", userId] }),
      ]);
    },
  });

  if (!userId) {
    return <Alert severity="warning">Unable to load notifications without a signed-in user.</Alert>;
  }

  const notifications = notificationsQuery.data ?? [];
  const notificationTypes = [...new Set(notifications.map((item) => item.notificationType).filter(Boolean) as string[])];
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const filteredNotifications = notifications.filter((item) => {
    const matchesReadState = filterMode === "unread" ? !item.isRead : true;
    const matchesType = typeFilter === "all" ? true : item.notificationType === typeFilter;
    return matchesReadState && matchesType;
  });

  const metrics = [
    { label: "Total", value: notifications.length, color: "#e0f2fe", textColor: "#075985" },
    { label: "Unread", value: unreadCount, color: "#dbeafe", textColor: "#1d4ed8" },
    { label: "Read", value: notifications.length - unreadCount, color: "#dcfce7", textColor: "#166534" },
  ];

  if (notificationsQuery.isError) {
    return <ErrorState message="Unable to load notifications." onRetry={() => notificationsQuery.refetch()} />;
  }

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 5,
          background: "linear-gradient(135deg, #eff6ff 0%, #eef2ff 42%, #f8fafc 100%)",
          border: "1px solid rgba(148, 163, 184, 0.18)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", lg: "row" }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Notifications
                </Typography>
                <Typography color="text.secondary">
                  Track mentions, task assignments, comments, and workflow changes in one place.
                </Typography>
              </Box>
              <Button
                variant="contained"
                disabled={unreadCount === 0 || markAllMutation.isPending}
                onClick={() => markAllMutation.mutate()}
              >
                Mark all as read
              </Button>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
              {metrics.map((metric) => (
                <Card key={metric.label} sx={{ minWidth: 140, bgcolor: metric.color, boxShadow: "none", borderRadius: 3 }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" sx={{ color: metric.textColor, fontWeight: 700 }}>
                      {metric.label}
                    </Typography>
                    <Typography variant="h5" sx={{ color: metric.textColor, fontWeight: 800 }}>
                      {metric.value}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
        <TextField select label="Read state" value={filterMode} onChange={(event) => setFilterMode(event.target.value as FilterMode)} sx={{ minWidth: 180 }}>
          <MenuItem value="all">All notifications</MenuItem>
          <MenuItem value="unread">Unread only</MenuItem>
        </TextField>
        <TextField select label="Type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} sx={{ minWidth: 220 }}>
          <MenuItem value="all">All types</MenuItem>
          {notificationTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {notifications.length === 0 && !notificationsQuery.isLoading ? (
        <EmptyState title="No notifications yet" description="Assignment, comment, mention, and status notifications will appear here." />
      ) : null}

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={1.5}>
            {filteredNotifications.map((notification, index) => (
              <Box key={notification.id}>
                {index > 0 ? <Divider sx={{ mb: 1.5 }} /> : null}
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between">
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Badge color="error" variant="dot" invisible={notification.isRead}>
                      <Avatar sx={{ bgcolor: notification.isRead ? "#e2e8f0" : "#dbeafe", color: "#1d4ed8" }}>
                        {getNotificationIcon(notification.notificationType)}
                      </Avatar>
                    </Badge>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography sx={{ fontWeight: 700 }}>{notification.title}</Typography>
                        <Chip
                          size="small"
                          label={notification.notificationType ?? "Update"}
                          color={notification.isRead ? "default" : "primary"}
                          variant={notification.isRead ? "outlined" : "filled"}
                        />
                      </Stack>
                      {notification.message ? (
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                      ) : null}
                      <Typography variant="caption" color="text.secondary">
                        {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "Just now"}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button onClick={() => navigate(getNotificationRoute(notification))}>Open</Button>
                    {!notification.isRead ? (
                      <Button
                        variant="outlined"
                        disabled={markOneMutation.isPending}
                        onClick={() => markOneMutation.mutate(notification.id)}
                      >
                        Mark read
                      </Button>
                    ) : null}
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
