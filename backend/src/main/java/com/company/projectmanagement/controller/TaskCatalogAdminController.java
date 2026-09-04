package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.TaskCategoryRequestDto;
import com.company.projectmanagement.dto.TaskCategoryResponseDto;
import com.company.projectmanagement.dto.LabelRequestDto;
import com.company.projectmanagement.dto.LabelResponseDto;
import com.company.projectmanagement.dto.TaskPriorityRequestDto;
import com.company.projectmanagement.dto.TaskPriorityResponseDto;
import com.company.projectmanagement.dto.TaskStatusRequestDto;
import com.company.projectmanagement.dto.TaskStatusResponseDto;
import com.company.projectmanagement.service.TaskCatalogAdminService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/task-catalog")
@RequiredArgsConstructor
@Validated
public class TaskCatalogAdminController {

    private final TaskCatalogAdminService service;

    @GetMapping("/statuses")
    public ResponseEntity<Map<String, Object>> getStatuses(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active
    ) {
        List<TaskStatusResponseDto> all = service.getAllStatuses();
        Map<String, Object> body = ApiListQueryHelper.filterSortPaginate(
                all,
                keyword,
                active,
                sortBy,
                sortDir,
                page,
                size,
                s -> s.getStatusKey() + " " + s.getStatusName(),
                TaskStatusResponseDto::getActive
        );
        return ResponseEntity.ok(body);
    }

    @GetMapping("/statuses/{id}")
    public ResponseEntity<TaskStatusResponseDto> getStatusById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getStatusById(id));
    }

    @PostMapping("/statuses")
    public ResponseEntity<TaskStatusResponseDto> createStatus(@Valid @RequestBody TaskStatusRequestDto request) {
        return ResponseEntity.ok(service.createStatus(request));
    }

    @PutMapping("/statuses/{id}")
    public ResponseEntity<TaskStatusResponseDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TaskStatusRequestDto request
    ) {
        return ResponseEntity.ok(service.updateStatus(id, request));
    }

    @DeleteMapping("/statuses/{id}")
    public ResponseEntity<Void> deleteStatus(@PathVariable Long id) {
        service.deleteStatus(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/priorities")
    public ResponseEntity<Map<String, Object>> getPriorities(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active
    ) {
        List<TaskPriorityResponseDto> all = service.getAllPriorities();
        Map<String, Object> body = ApiListQueryHelper.filterSortPaginate(
                all,
                keyword,
                active,
                sortBy,
                sortDir,
                page,
                size,
                p -> p.getPriorityKey() + " " + p.getPriorityName(),
                TaskPriorityResponseDto::getActive
        );
        return ResponseEntity.ok(body);
    }

    @GetMapping("/priorities/{id}")
    public ResponseEntity<TaskPriorityResponseDto> getPriorityById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getPriorityById(id));
    }

    @PostMapping("/priorities")
    public ResponseEntity<TaskPriorityResponseDto> createPriority(@Valid @RequestBody TaskPriorityRequestDto request) {
        return ResponseEntity.ok(service.createPriority(request));
    }

    @PutMapping("/priorities/{id}")
    public ResponseEntity<TaskPriorityResponseDto> updatePriority(
            @PathVariable Long id,
            @Valid @RequestBody TaskPriorityRequestDto request
    ) {
        return ResponseEntity.ok(service.updatePriority(id, request));
    }

    @DeleteMapping("/priorities/{id}")
    public ResponseEntity<Void> deletePriority(@PathVariable Long id) {
        service.deletePriority(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategories(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active
    ) {
        List<TaskCategoryResponseDto> all = service.getAllCategories();
        Map<String, Object> body = ApiListQueryHelper.filterSortPaginate(
                all,
                keyword,
                active,
                sortBy,
                sortDir,
                page,
                size,
                c -> c.getCategoryKey() + " " + c.getCategoryName(),
                TaskCategoryResponseDto::getActive
        );
        return ResponseEntity.ok(body);
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<TaskCategoryResponseDto> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getCategoryById(id));
    }

    @PostMapping("/categories")
    public ResponseEntity<TaskCategoryResponseDto> createCategory(@Valid @RequestBody TaskCategoryRequestDto request) {
        return ResponseEntity.ok(service.createCategory(request));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<TaskCategoryResponseDto> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody TaskCategoryRequestDto request
    ) {
        return ResponseEntity.ok(service.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        service.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/labels")
    public ResponseEntity<Map<String, Object>> getLabels(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active
    ) {
        List<LabelResponseDto> all = service.getAllLabels();
        Map<String, Object> body = ApiListQueryHelper.filterSortPaginate(
                all, keyword, active, sortBy, sortDir, page, size,
                label -> label.getLabelKey() + " " + label.getLabelName(),
                LabelResponseDto::getActive
        );
        return ResponseEntity.ok(body);
    }

    @GetMapping("/labels/{id}")
    public ResponseEntity<LabelResponseDto> getLabelById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getLabelById(id));
    }

    @PostMapping("/labels")
    public ResponseEntity<LabelResponseDto> createLabel(@Valid @RequestBody LabelRequestDto request) {
        return ResponseEntity.ok(service.createLabel(request));
    }

    @PutMapping("/labels/{id}")
    public ResponseEntity<LabelResponseDto> updateLabel(@PathVariable Long id, @Valid @RequestBody LabelRequestDto request) {
        return ResponseEntity.ok(service.updateLabel(id, request));
    }

    @DeleteMapping("/labels/{id}")
    public ResponseEntity<Void> deleteLabel(@PathVariable Long id) {
        service.deleteLabel(id);
        return ResponseEntity.noContent().build();
    }
}
