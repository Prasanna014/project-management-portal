package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.ProjectMemberRequestDto;
import com.company.projectmanagement.dto.ProjectMemberResponseDto;
import com.company.projectmanagement.service.ProjectMemberService;
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
@RequestMapping("/api/admin/project-members")
@RequiredArgsConstructor
@Validated
public class ProjectMemberController {

    private final ProjectMemberService service;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getMembers(
            @RequestParam(required = false) Long projectId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active
    ) {
        Map<String, Object> body = service.getProjectMembers(projectId, keyword, active, sortBy, sortDir, page, size);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ProjectMemberResponseDto>> getMembersByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(service.getMembersByProject(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectMemberResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getMembersByProject(id).stream()
                .findFirst()
                .orElseThrow(() -> new com.company.projectmanagement.exception.ResourceNotFoundException("Not found")));
    }

    @PostMapping
    public ResponseEntity<ProjectMemberResponseDto> addMember(@Valid @RequestBody ProjectMemberRequestDto request) {
        return ResponseEntity.ok(service.addProjectMember(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectMemberResponseDto> updateMember(
            @PathVariable Long id,
            @Valid @RequestBody ProjectMemberRequestDto request
    ) {
        return ResponseEntity.ok(service.updateProjectMember(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeMember(@PathVariable Long id) {
        service.removeProjectMember(id);
        return ResponseEntity.noContent().build();
    }
}
