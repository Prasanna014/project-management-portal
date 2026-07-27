const now = Date.now();

const toIso = (offsetMs) => new Date(now - offsetMs).toISOString();

export const createTaskDetailsMockBundle = (taskId, currentUserId = 1) => {
  const numericTaskId = Number(taskId) || 1001;
  const ownerId = 3;

  const users = [
    { id: 1, fullName: "Aarav Menon" },
    { id: 2, fullName: "Nisha Patel" },
    { id: 3, fullName: "Diego Romero" },
    { id: 4, fullName: "Lena Schmidt" },
    { id: 5, fullName: "Marta Nowak" }
  ];

  const task = {
    id: numericTaskId,
    taskNo: `TASK-${String(numericTaskId).padStart(4, "0")}`,
    projectId: 42,
    issueActionItem: "Improve release pipeline observability",
    description:
      "Add end-to-end visibility for build, deploy, and rollback steps. Include stage-level duration metrics, alert routing for failed deployments, and a troubleshooting runbook link for on-call engineers.",
    status: "In Progress",
    priority: "High",
    ownerId,
    createdBy: 2,
    targetDate: toIso(-(6 * 24 * 60 * 60 * 1000)),
    createdAt: toIso(12 * 24 * 60 * 60 * 1000)
  };

  const comments = [
    {
      id: 7001,
      taskId: numericTaskId,
      commentText:
        "I validated the webhook payloads in staging. We still need one metric per retry attempt so the dashboard shows noisy integrations.",
      commentedBy: 4,
      createdAt: toIso(2 * 60 * 60 * 1000)
    },
    {
      id: 7002,
      taskId: numericTaskId,
      commentText:
        "Runbook draft is up. I added screenshots for rollback flow and linked the incident channel checklist.",
      commentedBy: ownerId,
      createdAt: toIso(70 * 60 * 1000)
    },
    {
      id: 7003,
      taskId: numericTaskId,
      commentText:
        "Can we include deployment ring in the log context? That will help triage region-specific failures.",
      commentedBy: currentUserId,
      createdAt: toIso(25 * 60 * 1000)
    }
  ];

  const attachments = [
    {
      id: 8101,
      taskId: numericTaskId,
      fileName: "pipeline-observability-plan.pdf",
      uploadedBy: 2,
      uploadedAt: toIso(3 * 24 * 60 * 60 * 1000),
      fileData: "VGhpcyBpcyBhIG1vY2sgUERGIGNvbnRlbnQgZm9yIHBpcGVsaW5lIG9ic2VydmFiaWxpdHkgcGxhbi4="
    },
    {
      id: 8102,
      taskId: numericTaskId,
      fileName: "rollback-runbook.txt",
      uploadedBy: 3,
      uploadedAt: toIso(26 * 60 * 60 * 1000),
      fileData: "Um9sbGJhY2sgcnVuYm9vayBtb2NrIGZpbGUgd2l0aCBzdGVwLWJ5LXN0ZXAgaW5zdHJ1Y3Rpb25zLg=="
    },
    {
      id: 8103,
      taskId: numericTaskId,
      fileName: "alert-flow-diagram.png",
      uploadedBy: 4,
      uploadedAt: toIso(4 * 60 * 60 * 1000),
      fileData: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7+M3sAAAAASUVORK5CYII="
    }
  ];

  const history = [
    {
      id: 9001,
      taskId: numericTaskId,
      performedBy: 2,
      action: "Task created",
      description: "Task opened with initial scope for deployment observability",
      timestamp: toIso(12 * 24 * 60 * 60 * 1000)
    },
    {
      id: 9002,
      taskId: numericTaskId,
      performedBy: 3,
      action: "Owner changed",
      description: "Task reassigned to Diego Romero",
      timestamp: toIso(9 * 24 * 60 * 60 * 1000)
    },
    {
      id: 9003,
      taskId: numericTaskId,
      performedBy: 3,
      action: "Priority updated",
      description: "Priority raised from Medium to High after release blockers",
      timestamp: toIso(4 * 24 * 60 * 60 * 1000)
    },
    {
      id: 9004,
      taskId: numericTaskId,
      performedBy: 4,
      action: "Status updated",
      description: "Status moved from Open to In Progress",
      timestamp: toIso(2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 9005,
      taskId: numericTaskId,
      performedBy: ownerId,
      action: "Attachment added",
      description: "Uploaded alert-flow-diagram.png",
      timestamp: toIso(4 * 60 * 60 * 1000)
    }
  ];

  return {
    task,
    comments,
    attachments,
    history,
    users
  };
};
