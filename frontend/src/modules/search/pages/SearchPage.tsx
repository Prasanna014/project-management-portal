import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TopicRoundedIcon from "@mui/icons-material/TopicRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import TaskRoundedIcon from "@mui/icons-material/TaskRounded";
import { EmptyState } from "@shared/ui/states/EmptyState";
import { ErrorState } from "@shared/ui/states/ErrorState";
import { usePreferences } from "@shared/preferences/PreferencesContext";
import { globalSearch, type SearchCommentResult } from "@modules/search/services/searchApi";
import type { ProjectDto } from "@modules/projects/services/projectsApi";
import type { TaskDto } from "@modules/tasks/services/tasksApi";

type SearchEntityType = "all" | "tasks" | "projects" | "comments";

type SearchResultItem =
  | { entityType: "tasks"; id: number; primary: string; secondary: string; meta: string; to: string }
  | { entityType: "projects"; id: number; primary: string; secondary: string; meta: string; to: string }
  | { entityType: "comments"; id: number; primary: string; secondary: string; meta: string; to: string };

function buildTaskResult(task: TaskDto): SearchResultItem {
  return {
    entityType: "tasks",
    id: task.id,
    primary: task.issueActionItem ?? task.taskNo ?? `Task #${task.id}`,
    secondary: task.description ?? "Task result",
    meta: [task.taskNo, task.priority, task.status].filter(Boolean).join(" • "),
    to: `/task/${task.id}`,
  };
}

function buildProjectResult(project: ProjectDto): SearchResultItem {
  return {
    entityType: "projects",
    id: project.id,
    primary: project.projectName,
    secondary: project.description ?? "Project result",
    meta: [project.projectCode, project.active ? "Active" : "Inactive"].filter(Boolean).join(" • "),
    to: `/projects?q=${encodeURIComponent(project.projectCode || project.projectName)}&projectId=${project.id}`,
  };
}

function buildCommentResult(comment: SearchCommentResult): SearchResultItem {
  const preview = (comment.commentText ?? "").trim();
  return {
    entityType: "comments",
    id: comment.id,
    primary: comment.taskTitle || comment.taskNo || `Comment #${comment.id}`,
    secondary: preview.length > 180 ? `${preview.slice(0, 177)}...` : preview,
    meta: [comment.taskNo, comment.commentedByName, comment.commentedAt ? new Date(comment.commentedAt).toLocaleString() : ""]
      .filter(Boolean)
      .join(" • "),
    to: comment.taskId ? `/task/${comment.taskId}?commentId=${comment.id}` : "/tasks",
  };
}

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { preferences, addRecentSearch, clearRecentSearches } = usePreferences();
  const [inputValue, setInputValue] = useState(searchParams.get("q") ?? "");

  const activeType = (searchParams.get("type") as SearchEntityType | null) ?? "all";
  const submittedQuery = (searchParams.get("q") ?? "").trim();

  const searchQuery = useQuery({
    queryKey: ["global-search", submittedQuery],
    queryFn: () => globalSearch(submittedQuery),
    enabled: submittedQuery.length >= 2,
  });

  const results = useMemo<SearchResultItem[]>(() => {
    if (!searchQuery.data) {
      return [];
    }

    const flattened = [
      ...searchQuery.data.tasks.map(buildTaskResult),
      ...searchQuery.data.projects.map(buildProjectResult),
      ...searchQuery.data.comments.map(buildCommentResult),
    ];

    if (activeType === "all") {
      return flattened;
    }

    return flattened.filter((item) => item.entityType === activeType);
  }, [activeType, searchQuery.data]);

  const queryParam = searchParams.get("q") ?? "";

  useEffect(() => {
    setInputValue(queryParam);
  }, [queryParam]);

  const handleSearch = () => {
    const nextQuery = inputValue.trim();
    const nextParams = new URLSearchParams(searchParams);
    if (nextQuery) {
      nextParams.set("q", nextQuery);
      addRecentSearch(nextQuery);
    } else {
      nextParams.delete("q");
    }
    if (activeType !== "all") {
      nextParams.set("type", activeType);
    } else {
      nextParams.delete("type");
    }
    setSearchParams(nextParams);
  };

  const handleEntityTypeChange = (_event: React.MouseEvent<HTMLElement>, value: SearchEntityType | null) => {
    const nextType = value ?? "all";
    const nextParams = new URLSearchParams(searchParams);
    if (nextType === "all") {
      nextParams.delete("type");
    } else {
      nextParams.set("type", nextType);
    }
    setSearchParams(nextParams);
  };

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 5,
          background: "linear-gradient(135deg, #eff6ff 0%, #eef2ff 48%, #f8fafc 100%)",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2.25}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Enterprise Search
                </Typography>
                <Typography color="text.secondary">
                  Search across tickets, projects, and discussion comments from one workspace.
                </Typography>
              </Box>
              <Chip icon={<TopicRoundedIcon />} label="Ctrl+K quick launcher available" sx={{ fontWeight: 700, bgcolor: "#dbeafe", color: "#1d4ed8" }} />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
              <TextField
                fullWidth
                label="Search tasks, projects, comments"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <Button variant="contained" startIcon={<SearchRoundedIcon />} onClick={handleSearch} sx={{ minWidth: 140 }}>
                Search
              </Button>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between">
              <ToggleButtonGroup exclusive value={activeType} onChange={handleEntityTypeChange} size="small" color="primary">
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="tasks">Tasks</ToggleButton>
                <ToggleButton value="projects">Projects</ToggleButton>
                <ToggleButton value="comments">Comments</ToggleButton>
              </ToggleButtonGroup>

              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="body2" color="text.secondary">
                  Recent:
                </Typography>
                {preferences.recentSearches.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No recent searches yet
                  </Typography>
                ) : (
                  preferences.recentSearches.map((entry) => (
                    <Chip
                      key={entry}
                      label={entry}
                      onClick={() => {
                        setInputValue(entry);
                        const nextParams = new URLSearchParams(searchParams);
                        nextParams.set("q", entry);
                        setSearchParams(nextParams);
                      }}
                    />
                  ))
                )}
                {preferences.recentSearches.length > 0 ? (
                  <Button size="small" onClick={clearRecentSearches}>
                    Clear
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {submittedQuery.length > 0 && submittedQuery.length < 2 ? (
        <Alert severity="info">Enter at least 2 characters to search across the workspace.</Alert>
      ) : null}

      {searchQuery.isError ? <ErrorState message="Unable to load search results." onRetry={() => searchQuery.refetch()} /> : null}

      {!submittedQuery ? (
        <EmptyState title="Start searching" description="Use the search box above or Ctrl+K to open the global command-style search overlay." />
      ) : null}

      {submittedQuery.length >= 2 && searchQuery.isSuccess && results.length === 0 ? (
        <EmptyState title="No results found" description={`No task, project, or comment matched "${submittedQuery}".`} />
      ) : null}

      {searchQuery.isSuccess && results.length > 0 ? (
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Results ({results.length})
              </Typography>
              {results.map((item, index) => (
                <Box key={`${item.entityType}-${item.id}`}>
                  {index > 0 ? <Divider sx={{ mb: 1.5 }} /> : null}
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1.25}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                  >
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {item.entityType === "tasks" ? <TaskRoundedIcon color="primary" fontSize="small" /> : null}
                        {item.entityType === "projects" ? <FolderRoundedIcon color="primary" fontSize="small" /> : null}
                        {item.entityType === "comments" ? <CommentRoundedIcon color="primary" fontSize="small" /> : null}
                        <Typography sx={{ fontWeight: 700 }}>{item.primary}</Typography>
                        <Chip label={item.entityType} size="small" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {item.secondary}
                      </Typography>
                      {item.meta ? (
                        <Typography variant="caption" color="text.secondary">
                          {item.meta}
                        </Typography>
                      ) : null}
                    </Stack>
                    <Button onClick={() => navigate(item.to)}>Open</Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
}
