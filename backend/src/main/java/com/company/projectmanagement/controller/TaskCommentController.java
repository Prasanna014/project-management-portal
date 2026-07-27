// ================= TaskCommentController.java =================
package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.TaskCommentDto;
import com.company.projectmanagement.service.TaskCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TaskCommentController {

    private final TaskCommentService service;

    /* ================= GET COMMENTS ================= */
    @GetMapping("/api/tasks/{taskId}/comments")
    public ResponseEntity<List<TaskCommentDto>> getComments(@PathVariable Long taskId) {
        return ResponseEntity.ok(service.getCommentsByTaskId(taskId));
    }

    /* ================= ADD COMMENT ================= */
    @PostMapping("/api/tasks/{taskId}/comments")
    public ResponseEntity<TaskCommentDto> addComment(
            @PathVariable Long taskId,
            @Valid @RequestBody TaskCommentDto dto
    ) {
        return ResponseEntity.ok(service.addComment(taskId, dto));
    }

    /* ================= UPDATE COMMENT ================= */
    @PutMapping("/api/comments/{commentId}")
    public ResponseEntity<TaskCommentDto> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody TaskCommentDto dto
    ) {
        return ResponseEntity.ok(service.updateComment(commentId, dto));
    }

    /* ================= DELETE COMMENT ================= */
    @DeleteMapping("/api/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        service.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
