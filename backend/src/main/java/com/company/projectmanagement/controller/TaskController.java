// ================= TaskController.java =================
package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.TaskDto;
import com.company.projectmanagement.dto.WorkflowTransitionAvailableDto;
import com.company.projectmanagement.dto.WorkflowTransitionExecuteRequestDto;
import com.company.projectmanagement.security.SecurityUserPrincipal;
import com.company.projectmanagement.service.TaskService;
import com.company.projectmanagement.service.WorkflowEngineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final WorkflowEngineService workflowEngineService;

    /* ================= GET ALL ================= */
    @GetMapping
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    /* ================= GET BY ID ================= */
    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    /* ================= CREATE ================= */
    @PostMapping
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskDto taskDto) {
        return ResponseEntity.ok(taskService.createTask(taskDto));
    }

    /* ================= UPDATE ================= */
    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable Long id,
                @Valid @RequestBody TaskDto taskDto
    ) {
        return ResponseEntity.ok(taskService.updateTask(id, taskDto));
    }

    /* ================= DELETE ================= */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    /* ================= WORKFLOW: GET AVAILABLE TRANSITIONS ================= */
    @GetMapping("/{id}/workflow/transitions")
    public ResponseEntity<List<WorkflowTransitionAvailableDto>> getAvailableTransitions(@PathVariable Long id) {
        return ResponseEntity.ok(workflowEngineService.getAvailableTransitions(id));
    }

    /* ================= WORKFLOW: EXECUTE TRANSITION ================= */
    @PostMapping("/{id}/workflow/transition")
    public ResponseEntity<Void> executeTransition(
            @PathVariable Long id,
            @Valid @RequestBody WorkflowTransitionExecuteRequestDto request
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long performedBy = (auth != null && auth.getPrincipal() instanceof SecurityUserPrincipal principal)
                ? principal.userId()
                : null;
        workflowEngineService.executeTransition(id, request.getTransitionId(), request.getComment(), performedBy);
        return ResponseEntity.noContent().build();
    }
}
