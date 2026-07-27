// ================= DashboardController.java =================
package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.DashboardSummaryDto;
import com.company.projectmanagement.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService service;

    /* ================= SUMMARY ================= */
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary(@RequestParam(required = false) Long projectId) {
        return ResponseEntity.ok(service.getDashboardSummary(projectId));
    }

    /* ================= STATUS ================= */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Long>> getStatus(@RequestParam(required = false) Long projectId) {
        return ResponseEntity.ok(service.getStatusSummary(projectId));
    }

    /* ================= PRIORITY ================= */
    @GetMapping("/priority")
    public ResponseEntity<Map<String, Long>> getPriority(@RequestParam(required = false) Long projectId) {
        return ResponseEntity.ok(service.getPrioritySummary(projectId));
    }

    /* ================= WORKLOAD ================= */
    @GetMapping("/workload")
    public ResponseEntity<Map<Long, Long>> getWorkload(@RequestParam(required = false) Long projectId) {
        return ResponseEntity.ok(service.getOwnerWorkload(projectId));
    }
}
