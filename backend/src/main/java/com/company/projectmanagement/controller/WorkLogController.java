package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.WorkLogRequestDto;
import com.company.projectmanagement.dto.WorkLogResponseDto;
import com.company.projectmanagement.service.WorkLogService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/work-logs")
@RequiredArgsConstructor
@Validated
public class WorkLogController {

    private final WorkLogService service;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWorkLogs(
            @RequestParam(required = false) Long taskId,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword
    ) {
        Map<String, Object> body = service.getWorkLogs(taskId, userId, keyword, sortBy, sortDir, page, size);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkLogResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<WorkLogResponseDto> create(@Valid @RequestBody WorkLogRequestDto request) {
        return ResponseEntity.ok(service.createWorkLog(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkLogResponseDto> update(
            @PathVariable Long id,
            @Valid @RequestBody WorkLogRequestDto request
    ) {
        return ResponseEntity.ok(service.updateWorkLog(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteWorkLog(id);
        return ResponseEntity.noContent().build();
    }
}
