package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.DepartmentRequestDto;
import com.company.projectmanagement.dto.DepartmentResponseDto;
import com.company.projectmanagement.dto.ProjectDepartmentAssignmentRequestDto;
import com.company.projectmanagement.dto.ProjectDepartmentAssignmentResponseDto;
import com.company.projectmanagement.service.DepartmentAdminService;
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
@RequestMapping("/api/admin/departments")
@RequiredArgsConstructor
@Validated
public class DepartmentAdminController {

    private final DepartmentAdminService service;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDepartments(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active
    ) {
        List<DepartmentResponseDto> all = service.getAllDepartments();
        Map<String, Object> body = ApiListQueryHelper.filterSortPaginate(
                all,
                keyword,
                active,
                sortBy,
                sortDir,
                page,
                size,
                d -> d.getDepartmentCode() + " " + d.getDepartmentName(),
                DepartmentResponseDto::getActive
        );
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponseDto> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getDepartmentById(id));
    }

    @PostMapping
    public ResponseEntity<DepartmentResponseDto> createDepartment(@Valid @RequestBody DepartmentRequestDto request) {
        return ResponseEntity.ok(service.createDepartment(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DepartmentResponseDto> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequestDto request
    ) {
        return ResponseEntity.ok(service.updateDepartment(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        service.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/assignments/projects")
    public ResponseEntity<ProjectDepartmentAssignmentResponseDto> assignProjectToDepartment(
            @Valid @RequestBody ProjectDepartmentAssignmentRequestDto request
    ) {
        return ResponseEntity.ok(service.assignProjectToDepartment(request));
    }

    @DeleteMapping("/assignments/projects/{projectId}/departments/{departmentId}")
    public ResponseEntity<Void> removeProjectFromDepartment(
            @PathVariable Long projectId,
            @PathVariable Long departmentId
    ) {
        service.removeProjectFromDepartment(projectId, departmentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/assignments/projects/{projectId}")
    public ResponseEntity<List<ProjectDepartmentAssignmentResponseDto>> getProjectDepartments(@PathVariable Long projectId) {
        return ResponseEntity.ok(service.getProjectDepartments(projectId));
    }

    @GetMapping("/assignments/departments/{departmentId}")
    public ResponseEntity<List<ProjectDepartmentAssignmentResponseDto>> getDepartmentProjects(@PathVariable Long departmentId) {
        return ResponseEntity.ok(service.getDepartmentProjects(departmentId));
    }
}
