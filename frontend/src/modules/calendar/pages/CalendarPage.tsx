import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs, { type Dayjs } from "dayjs";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import type { TaskDto } from "@modules/tasks/services/tasksApi";
import { fetchCalendarHolidays, fetchCalendarTasks, type HolidayRecord } from "@modules/calendar/services/calendarApi";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { EmptyState } from "@shared/ui/states/EmptyState";
import { usePreferences } from "@shared/preferences/PreferencesContext";

type CalendarViewMode = "month" | "week" | "day";

type CalendarEvent = {
  id: number;
  task: TaskDto;
  dateKey: string;
  startMinute: number;
  endMinute: number;
  column: number;
  columns: number;
};

const HOURS = Array.from({ length: 24 }, (_, index) => index);

function normalizeStatus(value?: string) {
  return (value ?? "").trim().toLowerCase().replace(/_/g, " ");
}

function isCompletedStatus(value?: string) {
  const normalized = normalizeStatus(value);
  return normalized.includes("done") || normalized.includes("complete") || normalized.includes("closed");
}

function isOverdue(task: TaskDto) {
  if (!task.targetDate || isCompletedStatus(task.status)) {
    return false;
  }
  return dayjs(task.targetDate).endOf("day").isBefore(dayjs());
}

function getPriorityPalette(priority?: string) {
  switch ((priority ?? "").toLowerCase()) {
    case "low":
      return { color: "#059669", background: "#ecfdf5", border: "#10b981" };
    case "medium":
      return { color: "#d97706", background: "#fffbeb", border: "#f59e0b" };
    case "high":
      return { color: "#dc2626", background: "#fef2f2", border: "#ef4444" };
    case "critical":
      return { color: "#9a3412", background: "#fff7ed", border: "#f97316" };
    default:
      return { color: "#334155", background: "#f8fafc", border: "#cbd5e1" };
  }
}

function getStatusAccent(status?: string) {
  const normalized = normalizeStatus(status);
  if (normalized.includes("progress")) return "#d97706";
  if (normalized.includes("block")) return "#dc2626";
  if (normalized.includes("hold")) return "#7c3aed";
  if (normalized.includes("open")) return "#2563eb";
  if (normalized.includes("done") || normalized.includes("complete") || normalized.includes("closed")) return "#059669";
  return "#64748b";
}

function getEventStyle(task: TaskDto) {
  if (isOverdue(task)) {
    return {
      color: "#991b1b",
      background: "#fee2e2",
      border: "#ef4444",
    };
  }

  const priorityPalette = getPriorityPalette(task.priority);
  return {
    color: priorityPalette.color,
    background: priorityPalette.background,
    border: getStatusAccent(task.status) || priorityPalette.border,
  };
}

function buildEvents(tasks: TaskDto[], dayStartHour: number, dayEndHour: number): CalendarEvent[] {
  const grouped = tasks
    .filter((task): task is TaskDto & { targetDate: string } => Boolean(task.targetDate))
    .reduce<Record<string, TaskDto[]>>((acc, task) => {
      const key = dayjs(task.targetDate).format("YYYY-MM-DD");
      acc[key] = acc[key] ?? [];
      acc[key].push(task);
      return acc;
    }, {});

  return Object.entries(grouped).flatMap(([dateKey, dayTasks]) => {
    const sorted = [...dayTasks].sort((left, right) => {
      const leftHours = Number(left.estimatedHours ?? 1);
      const rightHours = Number(right.estimatedHours ?? 1);
      return rightHours - leftHours;
    });
    const activeColumns: number[] = [];

    return sorted.map((task, index) => {
      const durationMinutes = Math.max(45, Math.min(Number(task.estimatedHours ?? 1) * 60, (dayEndHour - dayStartHour) * 60));
      const baseStartMinute = dayStartHour * 60 + (index % Math.max(1, dayEndHour - dayStartHour)) * 45;
      const startMinute = Math.min(baseStartMinute, dayEndHour * 60 - durationMinutes);
      const endMinute = Math.min(startMinute + durationMinutes, dayEndHour * 60);

      let column = 0;
      while (activeColumns[column] && activeColumns[column] > startMinute) {
        column += 1;
      }
      activeColumns[column] = endMinute;

      return {
        id: task.id,
        task,
        dateKey,
        startMinute,
        endMinute,
        column,
        columns: Math.max(column + 1, activeColumns.length),
      };
    });
  });
}

function formatViewLabel(view: CalendarViewMode, currentDate: Dayjs) {
  if (view === "month") {
    return currentDate.format("MMMM YYYY");
  }

  function buildCreateTaskLink(dateKey: string, defaultProjectId: number | null) {
    return `/create-task?targetDate=${dateKey}${defaultProjectId ? `&projectId=${defaultProjectId}` : ""}`;
  }
  if (view === "week") {
    const weekStart = currentDate.startOf("week");
    const weekEnd = currentDate.endOf("week");
    return `${weekStart.format("DD MMM")} - ${weekEnd.format("DD MMM YYYY")}`;
  }
  return currentDate.format("DD MMMM YYYY");
}

function getVisibleDates(currentDate: Dayjs, view: CalendarViewMode) {
  if (view === "day") {
    return [currentDate.startOf("day")];
  }
  if (view === "week") {
    const start = currentDate.startOf("week");
    return Array.from({ length: 7 }, (_, index) => start.add(index, "day"));
  }

  const start = currentDate.startOf("month").startOf("week");
  const end = currentDate.endOf("month").endOf("week");
  const dates: Dayjs[] = [];
  let cursor = start;
  while (cursor.isBefore(end) || cursor.isSame(end, "day")) {
    dates.push(cursor);
    cursor = cursor.add(1, "day");
  }
  return dates;
}

export function CalendarPage() {
  const navigate = useNavigate();
  const { preferences } = usePreferences();
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [currentDate, setCurrentDate] = useState(dayjs());

  const tasksQuery = useQuery({
    queryKey: ["calendar-tasks"],
    queryFn: fetchCalendarTasks,
  });

  const holidaysQuery = useQuery({
    queryKey: ["calendar-holidays"],
    queryFn: fetchCalendarHolidays,
  });

  const tasks = tasksQuery.data ?? [];
  const holidays = holidaysQuery.data ?? [];

  const visibleDates = useMemo(() => getVisibleDates(currentDate, viewMode), [currentDate, viewMode]);
  const events = useMemo(
    () => buildEvents(tasks, preferences.calendar.dayStartHour, preferences.calendar.dayEndHour),
    [preferences.calendar.dayEndHour, preferences.calendar.dayStartHour, tasks]
  );
  const eventsByDate = useMemo(
    () =>
      events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
        acc[event.dateKey] = acc[event.dateKey] ?? [];
        acc[event.dateKey].push(event);
        return acc;
      }, {}),
    [events]
  );
  const holidaysByDate = useMemo(
    () =>
      holidays.reduce<Record<string, HolidayRecord[]>>((acc, holiday) => {
        const key = dayjs(holiday.holidayDate).format("YYYY-MM-DD");
        acc[key] = acc[key] ?? [];
        acc[key].push(holiday);
        return acc;
      }, {}),
    [holidays]
  );

  if (tasksQuery.isError || holidaysQuery.isError) {
    return <ErrorState message="Unable to load calendar data." onRetry={() => {
      tasksQuery.refetch();
      holidaysQuery.refetch();
    }} />;
  }

  const hasCalendarData = tasks.some((task) => task.targetDate) || holidays.length > 0;

  const shiftPeriod = (direction: "previous" | "next") => {
    const amount = direction === "previous" ? -1 : 1;
    if (viewMode === "month") {
      setCurrentDate((value) => value.add(amount, "month"));
      return;
    }
    if (viewMode === "week") {
      setCurrentDate((value) => value.add(amount, "week"));
      return;
    }
    setCurrentDate((value) => value.add(amount, "day"));
  };

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 5,
          background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #ecfeff 100%)",
          border: "1px solid rgba(148, 163, 184, 0.18)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", lg: "row" }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Delivery Calendar
                </Typography>
                <Typography color="text.secondary">
                  Plan task deadlines, holiday impact, and workload visibility across month, week, and day views.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`Work hours ${preferences.calendar.dayStartHour}:00-${preferences.calendar.dayEndHour}:00`} />
                <Chip icon={<EventBusyRoundedIcon />} label="Overdue tickets stay highlighted" sx={{ bgcolor: "#fee2e2", color: "#991b1b" }} />
              </Stack>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ md: "center" }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton onClick={() => shiftPeriod("previous")}>
                  <ChevronLeftRoundedIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 220 }}>
                  {formatViewLabel(viewMode, currentDate)}
                </Typography>
                <IconButton onClick={() => shiftPeriod("next")}>
                  <ChevronRightRoundedIcon />
                </IconButton>
                <Button onClick={() => setCurrentDate(dayjs())}>Today</Button>
              </Stack>

              <ToggleButtonGroup value={viewMode} exclusive size="small" onChange={(_event, value: CalendarViewMode | null) => value && setViewMode(value)}>
                <ToggleButton value="month">Month</ToggleButton>
                <ToggleButton value="week">Week</ToggleButton>
                <ToggleButton value="day">Day</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {!hasCalendarData ? (
        <EmptyState title="Calendar is empty" description="Add target dates to tasks or configure holidays to populate the calendar." />
      ) : null}

      {viewMode === "month" ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: 1.25,
          }}
        >
          {visibleDates.map((date) => {
            const dateKey = date.format("YYYY-MM-DD");
            const dateEvents = eventsByDate[dateKey] ?? [];
            const dateHolidays = holidaysByDate[dateKey] ?? [];
            const isCurrentMonth = date.month() === currentDate.month();
            return (
              <Card key={dateKey} sx={{ minHeight: 190, borderRadius: 3, bgcolor: isCurrentMonth ? "background.paper" : "#f8fafc" }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isCurrentMonth ? "#0f172a" : "#94a3b8" }}>
                          {date.format("ddd")}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: isCurrentMonth ? "#0f172a" : "#94a3b8" }}>
                          {date.format("DD")}
                        </Typography>
                      </Box>
                      <Tooltip title="Create ticket for this date">
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(buildCreateTaskLink(dateKey, preferences.defaultProjectId))
                          }
                          sx={{ bgcolor: "#eff6ff" }}
                        >
                          <AddRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    {dateHolidays.map((holiday) => (
                      <Chip key={`holiday-${holiday.id}`} label={holiday.holidayName} size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", justifyContent: "flex-start" }} />
                    ))}

                    <Stack spacing={0.75}>
                      {dateEvents.slice(0, 4).map((event) => {
                        const style = getEventStyle(event.task);
                        return (
                          <Tooltip
                            key={event.id}
                            title={`${event.task.issueActionItem ?? event.task.taskNo}\nPriority: ${event.task.priority ?? "-"}\nStatus: ${event.task.status ?? "-"}\nDue: ${event.task.targetDate ?? "-"}\nAssignee: ${event.task.ownerId ?? "-"}`}
                          >
                            <Button
                              fullWidth
                              variant="text"
                              onClick={() => navigate(`/task/${event.task.id}`)}
                              sx={{
                                justifyContent: "flex-start",
                                textTransform: "none",
                                px: 1,
                                py: 0.75,
                                borderRadius: 2,
                                color: style.color,
                                backgroundColor: style.background,
                                borderLeft: `4px solid ${style.border}`,
                              }}
                            >
                              <Box sx={{ textAlign: "left", overflow: "hidden" }}>
                                <Typography variant="caption" sx={{ display: "block", fontWeight: 700 }}>
                                  {event.task.taskNo}
                                </Typography>
                                <Typography variant="caption" sx={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {event.task.issueActionItem}
                                </Typography>
                              </Box>
                            </Button>
                          </Tooltip>
                        );
                      })}
                      {dateEvents.length > 4 ? (
                        <Typography variant="caption" color="text.secondary">
                          +{dateEvents.length - 4} more tickets
                        </Typography>
                      ) : null}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : null}

      {viewMode !== "month" ? (
        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ overflowX: "auto" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: `80px repeat(${visibleDates.length}, minmax(260px, 1fr))`, minWidth: 360 }}>
              <Box sx={{ borderBottom: "1px solid #e2e8f0", p: 1.5 }} />
              {visibleDates.map((date) => (
                <Box key={date.toString()} sx={{ borderBottom: "1px solid #e2e8f0", p: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {date.format("ddd")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {date.format("DD MMM")}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => navigate(buildCreateTaskLink(date.format("YYYY-MM-DD"), preferences.defaultProjectId))}>
                      <AddRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  {(holidaysByDate[date.format("YYYY-MM-DD")] ?? []).map((holiday) => (
                    <Chip key={holiday.id} size="small" label={holiday.holidayName} sx={{ mt: 1, bgcolor: "#fef3c7", color: "#92400e" }} />
                  ))}
                </Box>
              ))}

              {HOURS.slice(preferences.calendar.dayStartHour, preferences.calendar.dayEndHour).map((hour) => (
                <Box key={`hour-row-${hour}`} sx={{ display: "contents" }}>
                  <Box key={`label-${hour}`} sx={{ p: 1.5, borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>
                    <Typography variant="caption">{`${hour.toString().padStart(2, "0")}:00`}</Typography>
                  </Box>
                  {visibleDates.map((date) => (
                    <Box key={`${date.format("YYYY-MM-DD")}-${hour}`} sx={{ minHeight: 64, borderBottom: "1px solid #f1f5f9", borderLeft: "1px solid #f8fafc" }} />
                  ))}
                </Box>
              ))}

              <Box sx={{ gridColumn: `2 / span ${visibleDates.length}`, gridRow: `2 / span ${preferences.calendar.dayEndHour - preferences.calendar.dayStartHour}`, position: "relative", pointerEvents: "none" }}>
                {visibleDates.map((date, dateIndex) => {
                  const dateKey = date.format("YYYY-MM-DD");
                  const dateEvents = eventsByDate[dateKey] ?? [];
                  return dateEvents.map((event) => {
                    const style = getEventStyle(event.task);
                    const totalMinutes = (preferences.calendar.dayEndHour - preferences.calendar.dayStartHour) * 60;
                    const top = ((event.startMinute - preferences.calendar.dayStartHour * 60) / totalMinutes) * 100;
                    const height = ((event.endMinute - event.startMinute) / totalMinutes) * 100;
                    const width = `calc(${100 / visibleDates.length}% - 16px)`;
                    const dayOffset = `calc(${(100 / visibleDates.length) * dateIndex}% + 8px)`;
                    const overlapWidth = `calc(${width} / ${Math.max(event.columns, 1)})`;
                    const overlapOffset = `calc(${dayOffset} + (${event.column} * (${width} / ${Math.max(event.columns, 1)})))`;

                    return (
                      <Tooltip
                        key={`${dateKey}-${event.id}`}
                        title={`${event.task.issueActionItem ?? event.task.taskNo}\nPriority: ${event.task.priority ?? "-"}\nStatus: ${event.task.status ?? "-"}\nAssignee: ${event.task.ownerId ?? "-"}\nDue: ${event.task.targetDate ?? "-"}`}
                      >
                        <Box
                          onClick={() => navigate(`/task/${event.task.id}`)}
                          sx={{
                            pointerEvents: "auto",
                            position: "absolute",
                            top: `${top}%`,
                            left: overlapOffset,
                            width: overlapWidth,
                            minHeight: 42,
                            height: `calc(${height}% - 4px)`,
                            p: 0.9,
                            borderRadius: 2,
                            overflow: "hidden",
                            cursor: "pointer",
                            color: style.color,
                            backgroundColor: style.background,
                            borderLeft: `4px solid ${style.border}`,
                            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                          }}
                        >
                          <Typography variant="caption" sx={{ display: "block", fontWeight: 800 }}>
                            {event.task.taskNo}
                          </Typography>
                          <Typography variant="caption" sx={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {event.task.issueActionItem}
                          </Typography>
                          <Typography variant="caption" sx={{ display: "block", opacity: 0.8 }}>
                            {dayjs().hour(Math.floor(event.startMinute / 60)).minute(event.startMinute % 60).format("HH:mm")} - {dayjs().hour(Math.floor(event.endMinute / 60)).minute(event.endMinute % 60).format("HH:mm")}
                          </Typography>
                        </Box>
                      </Tooltip>
                    );
                  });
                })}
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : null}

      <Divider />
      <Alert severity="info">
        Calendar colors follow ticket priority and workflow status, while overdue tickets always keep the existing overdue red emphasis.
      </Alert>
    </Stack>
  );
}
