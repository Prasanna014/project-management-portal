// ================= ReportService.java =================
package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.ReportDto;
import com.company.projectmanagement.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TaskRepository taskRepository;

    /* ================= TASK SUMMARY ================= */
    public ReportDto getTaskSummaryReport() {

        long total = taskRepository.count();

        Map<String, Long> data = new HashMap<>();
        data.put("Open", (long) taskRepository.findByStatus("Open").size());
        data.put("In Progress", (long) taskRepository.findByStatus("In Progress").size());
        data.put("Completed", (long) taskRepository.findByStatus("Completed").size());

        return ReportDto.builder()
                .reportName("Task Summary Report")
                .totalCount(total)
                .data(data)
                .build();
    }

    /* ================= OPEN TASKS ================= */
    public ReportDto getOpenTasksReport() {

        long count = taskRepository.findByStatus("Open").size();

        Map<String, Long> data = new HashMap<>();
        data.put("Open", count);

        return ReportDto.builder()
                .reportName("Open Tasks Report")
                .totalCount(count)
                .data(data)
                .build();
    }

    /* ================= COMPLETED ================= */
    public ReportDto getCompletedTasksReport() {

        long count = taskRepository.findByStatus("Completed").size();

        Map<String, Long> data = new HashMap<>();
        data.put("Completed", count);

        return ReportDto.builder()
                .reportName("Completed Tasks Report")
                .totalCount(count)
                .data(data)
                .build();
    }

    /* ================= PRIORITY ================= */
    public ReportDto getPriorityReport() {

        Map<String, Long> data = new HashMap<>();
        data.put("High", (long) taskRepository.findByPriority("High").size());
        data.put("Medium", (long) taskRepository.findByPriority("Medium").size());
        data.put("Low", (long) taskRepository.findByPriority("Low").size());

        return ReportDto.builder()
                .reportName("Priority Report")
                .totalCount((long) (data.get("High") + data.get("Medium") + data.get("Low")))
                .data(data)
                .build();
    }

    /* ================= OWNER WORKLOAD ================= */
    public ReportDto getOwnerWorkloadReport() {

        Map<String, Long> data = new HashMap<>();

        taskRepository.findAll().forEach(task -> {
            String key = "Owner-" + task.getOwnerId();
            data.put(key, data.getOrDefault(key, 0L) + 1);
        });

        return ReportDto.builder()
                .reportName("Owner Workload Report")
                .totalCount((long) data.values().stream().mapToLong(Long::longValue).sum())
                .data(data)
                .build();
    }
}

