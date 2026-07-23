package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.DashboardSummaryDto;
import com.company.projectmanagement.repository.TaskRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TaskRepository taskRepository;

    /* ================= SUMMARY ================= */
    public DashboardSummaryDto getDashboardSummary() {

        long total = taskRepository.count();

        return DashboardSummaryDto.builder()
                .totalTasks(total)
                .openTasks((long) taskRepository.findByStatus("Open").size())
                .waitingTasks((long) taskRepository.findByStatus("Waiting").size())
                .inProgressTasks((long) taskRepository.findByStatus("In Progress").size())
                .blockedTasks((long) taskRepository.findByStatus("Blocked").size())
                .completedTasks((long) taskRepository.findByStatus("Completed").size())
                .scheduledTasks((long) taskRepository.findByStatus("Scheduled").size())
                .overdueTasks((long) taskRepository.findByStatus("Overdue").size())
                .highPriorityTasks((long) taskRepository.findByPriority("High").size())
                .mediumPriorityTasks((long) taskRepository.findByPriority("Medium").size())
                .lowPriorityTasks((long) taskRepository.findByPriority("Low").size())
                .build();
    }

    /* ================= STATUS SUMMARY ================= */
    public Map<String, Long> getStatusSummary() {
        Map<String, Long> map = new HashMap<>();

        map.put("Open", (long) taskRepository.findByStatus("Open").size());
        map.put("Waiting", (long) taskRepository.findByStatus("Waiting").size());
        map.put("In Progress", (long) taskRepository.findByStatus("In Progress").size());
        map.put("Blocked", (long) taskRepository.findByStatus("Blocked").size());
        map.put("Completed", (long) taskRepository.findByStatus("Completed").size());
        map.put("Scheduled", (long) taskRepository.findByStatus("Scheduled").size());
        map.put("Overdue", (long) taskRepository.findByStatus("Overdue").size());

        return map;
    }

    /* ================= PRIORITY SUMMARY ================= */
    public Map<String, Long> getPrioritySummary() {
        Map<String, Long> map = new HashMap<>();

        map.put("High", (long) taskRepository.findByPriority("High").size());
        map.put("Medium", (long) taskRepository.findByPriority("Medium").size());
        map.put("Low", (long) taskRepository.findByPriority("Low").size());

        return map;
    }

    /* ================= OWNER WORKLOAD ================= */
    public Map<Long, Long> getOwnerWorkload() {
        Map<Long, Long> map = new HashMap<>();

        taskRepository.findAll().forEach(task -> {
            Long ownerId = task.getOwnerId();
            map.put(ownerId, map.getOrDefault(ownerId, 0L) + 1L);
        });

        return map;
    }
}
