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
    public ResponseEntity<DashboardSummaryDto> getSummary() {
        return ResponseEntity.ok(service.getDashboardSummary());
    }

    /* ================= STATUS ================= */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Long>> getStatus() {
        return ResponseEntity.ok(service.getStatusSummary());
    }

    /* ================= PRIORITY ================= */
    @GetMapping("/priority")
    public ResponseEntity<Map<String, Long>> getPriority() {
        return ResponseEntity.ok(service.getPrioritySummary());
    }

    /* ================= WORKLOAD ================= */
    @GetMapping("/workload")
    public ResponseEntity<Map<Long, Long>> getWorkload() {
        return ResponseEntity.ok(service.getOwnerWorkload());
    }
}
