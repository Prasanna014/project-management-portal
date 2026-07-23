// ================= src/data/dashboardData.js =================

export const dashboardStats = [
  { label: "Total Tasks", value: 120 },
  { label: "Open", value: 25 },
  { label: "Waiting", value: 10 },
  { label: "In Progress", value: 30 },
  { label: "Blocked", value: 5 },
  { label: "Completed", value: 35 },
  { label: "Scheduled", value: 10 },
  { label: "Overdue", value: 5 },
];

export const statusChartData = [
  { name: "Open", value: 25 },
  { name: "In Progress", value: 30 },
  { name: "Completed", value: 35 },
  { name: "Blocked", value: 5 },
  { name: "Waiting", value: 10 },
];

export const priorityChartData = [
  { name: "Critical", value: 10 },
  { name: "High", value: 30 },
  { name: "Medium", value: 50 },
  { name: "Low", value: 30 },
];

export const ownerWorkloadData = [
  { name: "Prasanna", tasks: 20 },
  { name: "Ajay", tasks: 25 },
  { name: "John", tasks: 30 },
  { name: "Mike", tasks: 15 },
];

export const recentTasks = [
  {
    id: 1,
    title: "Fix Login Issue",
    owner: "Prasanna",
    status: "Open",
    priority: "High",
    date: "2026-06-07",
  },
  {
    id: 2,
    title: "Update API",
    owner: "Ajay",
    status: "In Progress",
    priority: "Medium",
    date: "2026-06-06",
  },
];

export const recentActivity = [
  { text: "Task CTS-101 created", date: "2026-06-07" },
  { text: "Comment added to CTS-100", date: "2026-06-07" },
  { text: "Task marked Completed", date: "2026-06-06" },
];

