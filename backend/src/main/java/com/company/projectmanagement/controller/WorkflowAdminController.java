package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.WorkflowDefinitionRequestDto;
import com.company.projectmanagement.dto.WorkflowDefinitionResponseDto;
import com.company.projectmanagement.dto.WorkflowStateRequestDto;
import com.company.projectmanagement.dto.WorkflowStateResponseDto;
import com.company.projectmanagement.dto.WorkflowTransitionRequestDto;
import com.company.projectmanagement.dto.WorkflowTransitionResponseDto;
import com.company.projectmanagement.dto.WorkflowTransitionRoleAssignmentRequestDto;
import com.company.projectmanagement.dto.WorkflowTransitionRoleAssignmentResponseDto;
import com.company.projectmanagement.service.WorkflowAdminService;
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
@RequestMapping("/api/admin/workflows")
@RequiredArgsConstructor
@Validated
public class WorkflowAdminController {

    private final WorkflowAdminService service;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWorkflows(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Boolean active
    ) {
        List<WorkflowDefinitionResponseDto> all = (entityType != null && !entityType.isBlank())
                ? service.getActiveWorkflowsByEntityType(entityType)
                : service.getAllWorkflows();

        Map<String, Object> body = ApiListQueryHelper.filterSortPaginate(
                all,
                keyword,
                active,
                sortBy,
                sortDir,
                page,
                size,
                w -> w.getWorkflowKey() + " " + w.getWorkflowName() + " " + w.getEntityType(),
                WorkflowDefinitionResponseDto::getActive
        );
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkflowDefinitionResponseDto> getWorkflowById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getWorkflowById(id));
    }

    @PostMapping
    public ResponseEntity<WorkflowDefinitionResponseDto> createWorkflow(
            @Valid @RequestBody WorkflowDefinitionRequestDto request
    ) {
        return ResponseEntity.ok(service.createWorkflow(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkflowDefinitionResponseDto> updateWorkflow(
            @PathVariable Long id,
            @Valid @RequestBody WorkflowDefinitionRequestDto request
    ) {
        return ResponseEntity.ok(service.updateWorkflow(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable Long id) {
        service.deleteWorkflow(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{workflowId}/states")
    public ResponseEntity<Map<String, Object>> getWorkflowStates(
            @PathVariable Long workflowId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active
    ) {
        List<WorkflowStateResponseDto> all = service.getWorkflowStates(workflowId);
        Map<String, Object> body = ApiListQueryHelper.filterSortPaginate(
                all,
                keyword,
                active,
                sortBy,
                sortDir,
                page,
                size,
                s -> s.getStateKey() + " " + s.getStateName(),
                WorkflowStateResponseDto::getActive
        );
        return ResponseEntity.ok(body);
    }

    @PostMapping("/states")
    public ResponseEntity<WorkflowStateResponseDto> createState(@Valid @RequestBody WorkflowStateRequestDto request) {
        return ResponseEntity.ok(service.createState(request));
    }

    @PutMapping("/states/{id}")
    public ResponseEntity<WorkflowStateResponseDto> updateState(
            @PathVariable Long id,
            @Valid @RequestBody WorkflowStateRequestDto request
    ) {
        return ResponseEntity.ok(service.updateState(id, request));
    }

    @GetMapping("/{workflowId}/transitions")
    public ResponseEntity<Map<String, Object>> getWorkflowTransitions(
            @PathVariable Long workflowId,
            @RequestParam(required = false) Long fromStateId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active
    ) {
        List<WorkflowTransitionResponseDto> all = service.getWorkflowTransitions(workflowId, fromStateId);
        Map<String, Object> body = ApiListQueryHelper.filterSortPaginate(
                all,
                keyword,
                active,
                sortBy,
                sortDir,
                page,
                size,
                t -> t.getTransitionKey() + " " + t.getTransitionName(),
                WorkflowTransitionResponseDto::getActive
        );
        return ResponseEntity.ok(body);
    }

    @PostMapping("/transitions")
    public ResponseEntity<WorkflowTransitionResponseDto> createTransition(
            @Valid @RequestBody WorkflowTransitionRequestDto request
    ) {
        return ResponseEntity.ok(service.createTransition(request));
    }

    @PutMapping("/transitions/{id}")
    public ResponseEntity<WorkflowTransitionResponseDto> updateTransition(
            @PathVariable Long id,
            @Valid @RequestBody WorkflowTransitionRequestDto request
    ) {
        return ResponseEntity.ok(service.updateTransition(id, request));
    }

    @PostMapping("/transitions/roles")
    public ResponseEntity<WorkflowTransitionRoleAssignmentResponseDto> assignRoleToTransition(
            @Valid @RequestBody WorkflowTransitionRoleAssignmentRequestDto request
    ) {
        return ResponseEntity.ok(service.assignRoleToTransition(request));
    }

    @DeleteMapping("/transitions/roles/{transitionId}/{roleId}")
    public ResponseEntity<Void> removeRoleFromTransition(
            @PathVariable Long transitionId,
            @PathVariable Long roleId
    ) {
        service.removeRoleFromTransition(transitionId, roleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/transitions/{transitionId}/roles")
    public ResponseEntity<List<WorkflowTransitionRoleAssignmentResponseDto>> getTransitionRoles(
            @PathVariable Long transitionId
    ) {
        return ResponseEntity.ok(service.getTransitionRoles(transitionId));
    }
}
