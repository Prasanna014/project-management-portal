// ================= ReportController.java =================
package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.ReportDto;
import com.company.projectmanagement.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService service;

    @GetMapping("/task-summary")
    public ResponseEntity<ReportDto> getTaskSummary() {
        return ResponseEntity.ok(service.getTaskSummaryReport());
    }

    @GetMapping("/open-tasks")
    public ResponseEntity<ReportDto> getOpenTasks() {
        return ResponseEntity.ok(service.getOpenTasksReport());
    }

    @GetMapping("/completed-tasks")
    public ResponseEntity<ReportDto> getCompletedTasks() {
        return ResponseEntity.ok(service.getCompletedTasksReport());
    }

    @GetMapping("/priority")
    public ResponseEntity<ReportDto> getPriorityReport() {
        return ResponseEntity.ok(service.getPriorityReport());
    }

    @GetMapping("/owner-workload")
    public ResponseEntity<ReportDto> getOwnerWorkload() {
        return ResponseEntity.ok(service.getOwnerWorkloadReport());
    }
}
