import { USE_TASK_DETAILS_MOCK_MODE } from "../config/devFlags";
import { createTaskDetailsMockBundle } from "../data/taskDetailsMockData";
import { getTaskById, updateTask } from "./taskService";
import { getComments, addComment, deleteComment, updateComment } from "./taskCommentService";
import { getAttachments, uploadAttachment, deleteAttachment } from "./attachmentService";
import { getActivity } from "./activityService";
import { getUsers } from "./userServices";

const mockStoreByTaskId = new Map();

const deepClone = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const getMockStore = (taskId, currentUserId) => {
  const key = String(taskId);
  if (!mockStoreByTaskId.has(key)) {
    mockStoreByTaskId.set(key, createTaskDetailsMockBundle(taskId, currentUserId));
  }
  return mockStoreByTaskId.get(key);
};

const getNextId = (items, base = 1) => {
  if (!items.length) return base;
  return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;
};

const toDataUrlBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const payload = typeof reader.result === "string" ? reader.result : "";
      const [, base64 = ""] = payload.split(",");
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const pushHistoryEntry = (store, payload) => {
  const entry = {
    id: getNextId(store.history, 9000),
    taskId: store.task.id,
    timestamp: new Date().toISOString(),
    ...payload
  };
  store.history.unshift(entry);
};

export const isTaskDetailsMockMode = USE_TASK_DETAILS_MOCK_MODE;

export const loadTaskDetailsPageData = async (taskId, currentUserId) => {
  if (isTaskDetailsMockMode) {
    const store = getMockStore(taskId, currentUserId);
    return deepClone(store);
  }

  const [taskRes, commentsRes, attachRes, historyRes, usersRes] = await Promise.all([
    getTaskById(taskId),
    getComments(taskId),
    getAttachments(taskId),
    getActivity(taskId),
    getUsers()
  ]);

  return {
    task: taskRes,
    comments: commentsRes || [],
    attachments: attachRes || [],
    history: historyRes || [],
    users: usersRes || []
  };
};

export const updateTaskDetails = async (taskId, nextTask, currentUserId) => {
  if (!isTaskDetailsMockMode) {
    return updateTask(taskId, nextTask);
  }

  const store = getMockStore(taskId, currentUserId);
  const previous = store.task;
  store.task = {
    ...previous,
    ...nextTask,
    id: previous.id
  };

  const changes = [];
  if (previous.status !== store.task.status) {
    changes.push(`status changed from ${previous.status} to ${store.task.status}`);
  }
  if (previous.priority !== store.task.priority) {
    changes.push(`priority changed from ${previous.priority} to ${store.task.priority}`);
  }
  if (previous.ownerId !== store.task.ownerId) {
    changes.push("ownership reassigned");
  }

  if (changes.length) {
    pushHistoryEntry(store, {
      performedBy: currentUserId,
      action: "Task updated",
      description: changes.join(", ")
    });
  }

  return deepClone(store.task);
};

export const addTaskDetailsComment = async (
  taskId,
  payload,
  selectedFile,
  currentUserId
) => {
  if (!isTaskDetailsMockMode) {
    const response = await addComment(taskId, payload);
    if (selectedFile) {
      await uploadAttachment(taskId, selectedFile, payload.commentedBy);
    }
    return response;
  }

  const store = getMockStore(taskId, currentUserId);
  const createdAt = new Date().toISOString();
  const comment = {
    id: getNextId(store.comments, 7000),
    taskId: Number(taskId),
    commentText: payload.commentText,
    commentedBy: payload.commentedBy,
    createdAt
  };

  store.comments.unshift(comment);

  pushHistoryEntry(store, {
    performedBy: payload.commentedBy,
    action: "Comment added",
    description: `Added comment: ${payload.commentText.slice(0, 80)}`
  });

  if (selectedFile) {
    const fileData = await toDataUrlBase64(selectedFile);
    const attachment = {
      id: getNextId(store.attachments, 8100),
      taskId: Number(taskId),
      fileName: selectedFile.name,
      uploadedBy: payload.commentedBy,
      uploadedAt: createdAt,
      fileData
    };
    store.attachments.unshift(attachment);

    pushHistoryEntry(store, {
      performedBy: payload.commentedBy,
      action: "Attachment added",
      description: `Uploaded ${selectedFile.name}`
    });
  }

  return deepClone(comment);
};

export const deleteTaskDetailsComment = async (taskId, commentId, currentUserId) => {
  if (!isTaskDetailsMockMode) {
    await deleteComment(commentId);
    return;
  }

  const store = getMockStore(taskId, currentUserId);
  const index = store.comments.findIndex((comment) => Number(comment.id) === Number(commentId));
  if (index === -1) return;

  const [removedComment] = store.comments.splice(index, 1);
  pushHistoryEntry(store, {
    performedBy: currentUserId,
    action: "Comment deleted",
    description: `Deleted comment: ${removedComment.commentText.slice(0, 80)}`
  });
};

export const editTaskDetailsComment = async (taskId, commentId, commentText, currentUserId) => {
  if (!isTaskDetailsMockMode) {
    return updateComment(commentId, {
      commentText,
      commentedBy: currentUserId,
    });
  }

  const store = getMockStore(taskId, currentUserId);
  const existing = store.comments.find((comment) => Number(comment.id) === Number(commentId));
  if (!existing) {
    throw new Error(`Comment not found: ${commentId}`);
  }

  existing.commentText = commentText;
  existing.updatedAt = new Date().toISOString();
  existing.createdAt = existing.createdAt || new Date().toISOString();

  pushHistoryEntry(store, {
    performedBy: currentUserId,
    action: "Comment updated",
    description: `Updated comment: ${commentText.slice(0, 80)}`,
  });

  return deepClone(existing);
};

export const deleteTaskDetailsAttachment = async (taskId, attachmentId, currentUserId) => {
  if (!isTaskDetailsMockMode) {
    await deleteAttachment(attachmentId);
    return;
  }

  const store = getMockStore(taskId, currentUserId);
  const index = store.attachments.findIndex(
    (attachment) => Number(attachment.id) === Number(attachmentId)
  );
  if (index === -1) return;

  const [removedAttachment] = store.attachments.splice(index, 1);
  pushHistoryEntry(store, {
    performedBy: currentUserId,
    action: "Attachment deleted",
    description: `Deleted attachment ${removedAttachment.fileName}`
  });
};
