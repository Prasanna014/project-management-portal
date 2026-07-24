import React, { useEffect, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  TextField,
  Snackbar,
  Card,
  CardContent,
  Chip,
  Grid,
  Avatar,
  Alert
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
  const [selectedFile, setSelectedFile] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAll = async () => {
    try {
      console.log("🟡 Loading task details for ID:", resolvedTaskId);
      console.log("📍 API URL:", import.meta.env.VITE_API_BASE_URL);
      
      const taskRes = await getTaskById(resolvedTaskId);
      const commentsRes = await getComments(resolvedTaskId);
      const attachRes = await getAttachments(resolvedTaskId);
      const historyRes = await getActivity(resolvedTaskId);

      console.log("🟢 Task loaded:", taskRes);
      console.log("💬 Comments loaded:", commentsRes);
      console.log("📎 Attachments loaded:", attachRes);
      console.log("📜 Activity history loaded:", historyRes);

      setTask(taskRes);
      setComments(commentsRes || []);
      setAttachments(attachRes || []);
      setHistory(historyRes || []);

    } catch (err) {
      console.error("🔴 ERROR loading task details:", err);
      setError(`Failed to load task details: ${err.message}`);
    }
  };

  useEffect(() => {
    if (resolvedTaskId) {
      loadAll();
    }
  }, [resolvedTaskId]);

  // ✅ ADD COMMENT WITH ATTACHMENT SUPPORT
  const handleAddComment = async () => {
    if (!commentText.trim()) {
      setError("Comment cannot be empty");
      return;
    }
    try {
      console.log("Adding comment:", commentText);
      await addComment(resolvedTaskId, {
        commentText,
        commentedBy: currentUserId
      });
      
      // If file is selected, upload it after comment
      if (selectedFile) {
        console.log("Uploading attachment:", selectedFile.name);
        await uploadAttachment(resolvedTaskId, selectedFile, currentUserId);
        setSelectedFile(null);
      }
      
      setSuccess("Comment added successfully");
      setCommentText("");
      loadAll();
    } catch (err) {
      console.error("Error adding comment:", err);
      setError(`Failed to add comment: ${err.message}`);
    }
  };

  // ✅ DELETE COMMENT
  const handleDeleteComment = async (id) => {
    try {
      await deleteComment(id);
      setSuccess("Comment deleted");
      loadAll();
    } catch (err) {
      setError(`Failed to delete comment: ${err.message}`);
    }
  };

  // ✅ UPLOAD ATTACHMENT
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      console.log("Uploading file:", file.name);
      await uploadAttachment(resolvedTaskId, file, currentUserId);
      setSuccess("File uploaded successfully");
      loadAll();
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(`Failed to upload file: ${err.message}`);
    }
  };

  // ✅ DELETE ATTACHMENT
  const handleDeleteAttachment = async (id) => {
    try {
      await deleteAttachment(id);
      setSuccess("Attachment deleted");
      loadAll();
    } catch (err) {
      setError(`Failed to delete attachment: ${err.message}`);
    }
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

      {/* ✅ COMMENTS - AZURE STYLE */}
      {tab === 1 && (
        <Box mt={2}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {/* ADD COMMENT SECTION */}
          <Card sx={{ mb: 3, p: 2, backgroundColor: "#f5f5f5" }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>📝 Add a Comment</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Type your comment here..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item>
                <Button variant="contained" onClick={handleAddComment}>💬 Post Comment</Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" component="label">
                  📎 Attach File
                  <input hidden type="file" onChange={(e) => setSelectedFile(e.target.files?.[0])} />
                </Button>
                {selectedFile && <Chip label={selectedFile.name} onDelete={() => setSelectedFile(null)} sx={{ ml: 1 }} />}
              </Grid>
            </Grid>
          </Card>

          {/* COMMENTS LIST */}
          {comments.length === 0 ? (
            <Typography color="textSecondary" sx={{ py: 2 }}>No comments yet</Typography>
          ) : (
            <Box>
              {comments.map((c) => (
                <Card key={c.id} sx={{ mb: 2, border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="flex-start">
                      <Grid item>
                        <Avatar sx={{ bgcolor: "#1976D2" }}>{c.commentedBy?.toString().charAt(0) || "U"}</Avatar>
                      </Grid>
                      <Grid item xs>
                        <Grid container justifyContent="space-between">
                          <Grid item>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>User ID: {c.commentedBy}</Typography>
                            <Typography variant="caption" color="textSecondary">🕐 {c.commentedAt ? new Date(c.commentedAt).toLocaleString() : "Just now"}</Typography>
                          </Grid>
                          <Grid item>
                            <Button size="small" color="error" onClick={() => handleDeleteComment(c.id)}>🗑️ Delete</Button>
                          </Grid>
                        </Grid>
                        <Typography sx={{ mt: 1.5, whiteSpace: "pre-wrap" }}>{c.commentText}</Typography>
                        {attachments.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>📎 Attachments:</Typography>
                            <Grid container spacing={1} sx={{ mt: 0.5 }}>
                              {attachments.map((file) => (
                                <Grid item key={file.id}>
                                  <Chip icon={<span>📄</span>} label={file.fileName} variant="outlined" size="small" onDelete={() => handleDeleteAttachment(file.id)} />
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* ✅ ATTACHMENTS */}
      {tab === 2 && (
        <Box mt={2}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Card sx={{ p: 2, mb: 2, backgroundColor: "#f5f5f5" }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>📁 Upload Files</Typography>
            <Button variant="outlined" component="label">
              📤 Choose File
              <input hidden type="file" onChange={handleUpload} />
            </Button>
          </Card>

          {attachments.length === 0 ? (
            <Typography color="textSecondary">No attachments yet</Typography>
          ) : (
            <Grid container spacing={2}>
              {attachments.map(a => (
                <Grid item xs={12} sm={6} md={4} key={a.id}>
                  <Card sx={{ p: 2 }}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>📄 {a.fileName}</Typography>
                        <Typography variant="caption" color="textSecondary">🕐 {a.uploadedAt ? new Date(a.uploadedAt).toLocaleString() : "Unknown"}</Typography>
                      </Grid>
                      <Grid item>
                        <Button size="small" color="error" onClick={() => handleDeleteAttachment(a.id)}>🗑️</Button>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* ✅ HISTORY */}
      {tab === 3 && (
        <Box mt={2}>
          {history.length === 0 ? (
            <Typography color="textSecondary">No history yet</Typography>
          ) : (
            <Box>
              {history.map(h => (
                <Card key={h.id} sx={{ mb: 2, p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>📝 {h.activityType}</Typography>
                      <Typography variant="body2">Old: {h.oldValue}</Typography>
                      <Typography variant="body2">New: {h.newValue}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="caption" color="textSecondary">🕐 {h.performedAt ? new Date(h.performedAt).toLocaleString() : "Unknown"}</Typography>
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError("")}>
        <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess("")}>
        <Alert onClose={() => setSuccess("")} severity="success" sx={{ width: "100%" }}>
          {success}
        </Alert>
      </Snackbar>

    </Box>
  );
}
