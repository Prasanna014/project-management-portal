// ================= ActivityController.java =================
package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.ActivityHistoryDto;
import com.company.projectmanagement.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService service;

    /* ================= GET TASK HISTORY ================= */
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<ActivityHistoryDto>> getTaskHistory(@PathVariable Long taskId) {
        return ResponseEntity.ok(service.getTaskHistory(taskId));
    }

    /* ================= CREATE ACTIVITY ================= */
    @PostMapping
    public ResponseEntity<ActivityHistoryDto> createActivity(@RequestBody ActivityHistoryDto dto) {
        return ResponseEntity.ok(service.createActivity(dto));
    }
}
