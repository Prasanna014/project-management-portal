package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.DashboardSummaryDto;
import com.company.projectmanagement.repository.TaskRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TaskRepository taskRepository;

    private List<com.company.projectmanagement.entity.Task> loadTasks(Long projectId) {
        return projectId == null ? taskRepository.findAll() : taskRepository.findByProjectId(projectId);
    }

    private String resolveStatus(com.company.projectmanagement.entity.Task task) {
        if (task.getTaskStatus() != null && task.getTaskStatus().getStatusName() != null) {
            return task.getTaskStatus().getStatusName();
        }
        return task.getStatus();
    }

    private String resolvePriority(com.company.projectmanagement.entity.Task task) {
        if (task.getTaskPriority() != null && task.getTaskPriority().getPriorityName() != null) {
            return task.getTaskPriority().getPriorityName();
        }
        return task.getPriority();
    }

    private long countByStatus(List<com.company.projectmanagement.entity.Task> tasks, String status) {
        return tasks.stream()
                .map(this::resolveStatus)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> statusMatches(value, status))
                .count();
    }

    private String normalizeStatus(String value) {
        return value == null
                ? ""
                : value.trim().toLowerCase(Locale.ROOT).replace('_', ' ');
    }

    private boolean statusMatches(String actualStatus, String requestedStatus) {
        String actual = normalizeStatus(actualStatus);
        String requested = normalizeStatus(requestedStatus);

        return switch (requested) {
            case "open" -> actual.equals("open") || actual.equals("to do") || actual.equals("todo");
            case "completed" -> actual.equals("completed") || actual.equals("done");
            case "in progress" -> actual.equals("in progress");
            case "waiting" -> actual.equals("waiting");
            case "blocked" -> actual.equals("blocked");
            case "scheduled" -> actual.equals("scheduled");
            case "overdue" -> actual.equals("overdue");
            default -> actual.equals(requested);
        };
    }

    private long countByPriority(List<com.company.projectmanagement.entity.Task> tasks, String priority) {
        return tasks.stream()
                .map(this::resolvePriority)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> value.equalsIgnoreCase(priority))
                .count();
    }

    /* ================= SUMMARY ================= */
    public DashboardSummaryDto getDashboardSummary(Long projectId) {
        List<com.company.projectmanagement.entity.Task> tasks = loadTasks(projectId);
        long total = tasks.size();

        return DashboardSummaryDto.builder()
                .totalTasks(total)
                .openTasks(countByStatus(tasks, "Open"))
                .waitingTasks(countByStatus(tasks, "Waiting"))
                .inProgressTasks(countByStatus(tasks, "In Progress"))
                .blockedTasks(countByStatus(tasks, "Blocked"))
                .completedTasks(countByStatus(tasks, "Completed"))
                .scheduledTasks(countByStatus(tasks, "Scheduled"))
                .overdueTasks(countByStatus(tasks, "Overdue"))
                .highPriorityTasks(countByPriority(tasks, "High"))
                .mediumPriorityTasks(countByPriority(tasks, "Medium"))
                .lowPriorityTasks(countByPriority(tasks, "Low"))
                .build();
    }

    /* ================= STATUS SUMMARY ================= */
    public Map<String, Long> getStatusSummary(Long projectId) {
        List<com.company.projectmanagement.entity.Task> tasks = loadTasks(projectId);
        Map<String, Long> map = new HashMap<>();

        map.put("Open", countByStatus(tasks, "Open"));
        map.put("Waiting", countByStatus(tasks, "Waiting"));
        map.put("In Progress", countByStatus(tasks, "In Progress"));
        map.put("Blocked", countByStatus(tasks, "Blocked"));
        map.put("Completed", countByStatus(tasks, "Completed"));
        map.put("Scheduled", countByStatus(tasks, "Scheduled"));
        map.put("Overdue", countByStatus(tasks, "Overdue"));

        return map;
    }

    /* ================= PRIORITY SUMMARY ================= */
    public Map<String, Long> getPrioritySummary(Long projectId) {
        List<com.company.projectmanagement.entity.Task> tasks = loadTasks(projectId);
        Map<String, Long> map = new HashMap<>();

        map.put("High", countByPriority(tasks, "High"));
        map.put("Medium", countByPriority(tasks, "Medium"));
        map.put("Low", countByPriority(tasks, "Low"));

        return map;
    }

    /* ================= OWNER WORKLOAD ================= */
    public Map<Long, Long> getOwnerWorkload(Long projectId) {
        Map<Long, Long> map = new HashMap<>();

        var tasks = projectId == null ? taskRepository.findAll() : taskRepository.findByProjectId(projectId);
        tasks.forEach(task -> {
            Long ownerId = task.getOwnerId();
            map.put(ownerId, map.getOrDefault(ownerId, 0L) + 1L);
        });

        return map;
    }
}
