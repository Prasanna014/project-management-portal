// ================= TaskCommentService.java =================
package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.TaskCommentDto;
import com.company.projectmanagement.entity.TaskComment;
import com.company.projectmanagement.repository.TaskCommentRepository;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskCommentService {

    private final TaskCommentRepository repository;

    /* ================= GET COMMENTS BY TASK ================= */
    public List<TaskCommentDto> getCommentsByTaskId(Long taskId) {
        return repository.findByTaskIdOrderByCommentedAtDesc(taskId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /* ================= ADD COMMENT ================= */
    public TaskCommentDto addComment(Long taskId, TaskCommentDto dto) {

        TaskComment entity = TaskComment.builder()
                .taskId(taskId)
                .commentText(dto.getCommentText())
                .commentedBy(dto.getCommentedBy())
                .build();

        TaskComment saved = repository.save(entity);
        return mapToDto(saved);
    }

    /* ================= UPDATE COMMENT ================= */
    @Transactional
    public TaskCommentDto updateComment(Long commentId, TaskCommentDto dto) {
        TaskComment existing = repository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        // Only update the text — authorship (commentedBy) is intentionally preserved.
        existing.setCommentText(dto.getCommentText());
        // @PreUpdate will set updatedAt automatically on save

        TaskComment saved = repository.save(existing);
        return mapToDto(saved);
    }

    /* ================= DELETE ================= */
    public void deleteComment(Long commentId) {
        TaskComment existing = repository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found: " + commentId));

        repository.delete(existing);
    }

    /* ================= MAPPER ================= */
    private TaskCommentDto mapToDto(TaskComment entity) {
        return TaskCommentDto.builder()
                .id(entity.getId())
                .taskId(entity.getTaskId())
                .commentText(entity.getCommentText())
                .commentedBy(entity.getCommentedBy())
                .commentedAt(entity.getCommentedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
