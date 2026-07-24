// ================= SearchService.java =================

package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.ProjectDto;
import com.company.projectmanagement.dto.TaskDto;
import com.company.projectmanagement.entity.Project;
import com.company.projectmanagement.entity.Task;
import com.company.projectmanagement.repository.ProjectRepository;
import com.company.projectmanagement.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    /* ================= TASK SEARCH ================= */
    public List<TaskDto> searchTasks(String keyword) {

        String lower = keyword.toLowerCase();

        return taskRepository.findAll().stream()
                .filter(t ->
                        (t.getTaskNo() != null && t.getTaskNo().toLowerCase().contains(lower)) ||
                        (t.getIssueActionItem() != null && t.getIssueActionItem().toLowerCase().contains(lower)) ||
                        (t.getDescription() != null && t.getDescription().toLowerCase().contains(lower)) ||
                        (t.getPriority() != null && t.getPriority().toLowerCase().contains(lower)) ||
                        (t.getStatus() != null && t.getStatus().toLowerCase().contains(lower))
                )
                .sorted((a, b) -> relevance(b, lower) - relevance(a, lower))
                .map(this::mapTaskToDto)
                .collect(Collectors.toList());
    }

    /* ================= PROJECT SEARCH ================= */
    public List<ProjectDto> searchProjects(String keyword) {

        return projectRepository
                .findByProjectNameContainingIgnoreCase(keyword)
                .stream()
                .map(this::mapProjectToDto)
                .collect(Collectors.toList());
    }

    /* ================= GLOBAL SEARCH ================= */
    public Map<String, Object> globalSearch(String keyword) {

        Map<String, Object> result = new HashMap<>();

        result.put("tasks", searchTasks(keyword));
        result.put("projects", searchProjects(keyword));

        return result;
    }

    /* ================= RELEVANCE ================= */
    private int relevance(Task t, String keyword) {
        int score = 0;

        if (t.getTaskNo() != null && t.getTaskNo().toLowerCase().contains(keyword)) score += 5;
        if (t.getIssueActionItem() != null && t.getIssueActionItem().toLowerCase().contains(keyword)) score += 4;
        if (t.getDescription() != null && t.getDescription().toLowerCase().contains(keyword)) score += 3;
        if (t.getPriority() != null && t.getPriority().toLowerCase().contains(keyword)) score += 2;
        if (t.getStatus() != null && t.getStatus().toLowerCase().contains(keyword)) score += 1;

        return score;
    }

    /* ================= MAPPER ================= */
    private TaskDto mapTaskToDto(Task t) {
        return TaskDto.builder()
                .id(t.getId())
                .taskNo(t.getTaskNo())
                .projectId(t.getProjectId())
                .issueActionItem(t.getIssueActionItem())
                .description(t.getDescription())
                .priority(t.getPriority())
                .status(t.getStatus())
                .ownerId(t.getOwnerId())
                .targetDate(t.getTargetDate())
                .dateResolved(t.getDateResolved())
                .createdBy(t.getCreatedBy())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    private ProjectDto mapProjectToDto(Project p) {
        return ProjectDto.builder()
                .id(p.getId())
                .projectCode(p.getProjectCode())
                .projectName(p.getProjectName())
                .description(p.getDescription())
                .active(p.getActive())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
