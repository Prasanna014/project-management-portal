import React, { useEffect, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  TextField,
  Snackbar
} from "@mui/material";
import { useParams } from "react-router-dom";

import { getTaskById } from "../services/taskService";
import {
  getComments,
  addComment,
  deleteComment
} from "../services/taskCommentService";

import {
  getAttachments,
  uploadAttachment,
  deleteAttachment
} from "../services/attachmentService";

import { getActivity } from "../services/activityService";

export default function TaskDetailsPage({ taskId }) {
  const params = useParams();
  const resolvedTaskId = taskId || params.taskId;

  const currentUserId = Number(import.meta.env.VITE_DEFAULT_USER_ID || 1);

  const [tab, setTab] = useState(0);

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [history, setHistory] = useState([]);

  const [commentText, setCommentText] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAll = async () => {
    try {
      const taskRes = await getTaskById(resolvedTaskId);
      const commentsRes = await getComments(resolvedTaskId);
      const attachRes = await getAttachments(resolvedTaskId);
      const historyRes = await getActivity(resolvedTaskId);

      setTask(taskRes);
      setComments(commentsRes || []);
      setAttachments(attachRes || []);
      setHistory(historyRes || []);

    } catch {
      setError("Failed to load task details");
    }
  };

  useEffect(() => {
    if (resolvedTaskId) {
      loadAll();
    }
  }, [resolvedTaskId]);

  // ✅ ADD COMMENT
  const handleAddComment = async () => {
    try {
      await addComment(resolvedTaskId, {
        commentText,
        commentedBy: currentUserId
      });
      setSuccess("Comment added");
      setCommentText("");
      loadAll();
    } catch {
      setError("Failed to add comment");
    }
  };

  // ✅ DELETE COMMENT
  const handleDeleteComment = async (id) => {
    await deleteComment(id);
    setSuccess("Comment deleted");
    loadAll();
  };

  // ✅ UPLOAD ATTACHMENT
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    await uploadAttachment(resolvedTaskId, file, currentUserId);
    setSuccess("File uploaded");
    loadAll();
  };

  // ✅ DELETE ATTACHMENT
  const handleDeleteAttachment = async (id) => {
    await deleteAttachment(id);
    setSuccess("Attachment deleted");
    loadAll();
  };

  if (!task) return <h2>Loading...</h2>;

  return (
    <Box sx={{ p: 3 }}>

      <Typography variant="h5">{task.issueActionItem}</Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)}>
        <Tab label="Overview" />
        <Tab label="Comments" />
        <Tab label="Attachments" />
        <Tab label="History" />
      </Tabs>

      {/* ✅ OVERVIEW */}
      {tab === 0 && (
        <Box mt={2}>
          <Typography>Description: {task.description}</Typography>
          <Typography>Status: {task.status}</Typography>
          <Typography>Priority: {task.priority}</Typography>
        </Box>
      )}

      {/* ✅ COMMENTS */}
      {tab === 1 && (
        <Box mt={2}>
          <TextField
            fullWidth
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Button onClick={handleAddComment}>Add</Button>

          {comments.map(c => (
            <Box key={c.id}>
              <Typography>{c.commentText}</Typography>
              <Button onClick={() => handleDeleteComment(c.id)}>Delete</Button>
            </Box>
          ))}
        </Box>
      )}

      {/* ✅ ATTACHMENTS */}
      {tab === 2 && (
        <Box mt={2}>
          <input type="file" onChange={handleUpload} />

          {attachments.map(a => (
            <Box key={a.id}>
              <Typography>{a.fileName}</Typography>
              <Button onClick={() => handleDeleteAttachment(a.id)}>
                Delete
              </Button>
            </Box>
          ))}
        </Box>
      )}

      {/* ✅ HISTORY */}
      {tab === 3 && (
        <Box mt={2}>
          {history.map(h => (
            <Typography key={h.id}>
              {h.activityType} - {h.performedAt}
            </Typography>
          ))}
        </Box>
      )}

      <Snackbar open={!!error} message={error} onClose={() => setError("")} />
      <Snackbar open={!!success} message={success} onClose={() => setSuccess("")} />

    </Box>
  );
}
