// ================= TaskService.java =================
package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.TaskDto;
import com.company.projectmanagement.entity.Task;
import com.company.projectmanagement.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    /* ================= GET ALL ================= */
    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /* ================= GET BY ID ================= */
    public TaskDto getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        return mapToDto(task);
    }

    /* ================= CREATE ================= */
    public TaskDto createTask(TaskDto dto) {
        Task task = mapToEntity(dto);
        Task saved = taskRepository.save(task);
        return mapToDto(saved);
    }

    /* ================= UPDATE ================= */
    public TaskDto updateTask(Long id, TaskDto dto) {
        Task existing = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        existing.setTaskNo(dto.getTaskNo());
        existing.setProjectId(dto.getProjectId());
        existing.setIssueActionItem(dto.getIssueActionItem());
        existing.setDescription(dto.getDescription());
        existing.setPriority(dto.getPriority());
        existing.setStatus(dto.getStatus());
        existing.setOwnerId(dto.getOwnerId());
        existing.setTargetDate(dto.getTargetDate());
        existing.setDateResolved(dto.getDateResolved());
        existing.setCreatedBy(dto.getCreatedBy());

        Task updated = taskRepository.save(existing);
        return mapToDto(updated);
    }

    /* ================= DELETE ================= */
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        taskRepository.delete(task);
    }

    /* ================= MAPPER ================= */
    private TaskDto mapToDto(Task task) {
        return TaskDto.builder()
                .id(task.getId())
                .taskNo(task.getTaskNo())
                .projectId(task.getProjectId())
                .issueActionItem(task.getIssueActionItem())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .ownerId(task.getOwnerId())
                .targetDate(task.getTargetDate())
                .dateResolved(task.getDateResolved())
                .createdBy(task.getCreatedBy())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    private Task mapToEntity(TaskDto dto) {
        return Task.builder()
                .id(dto.getId())
                .taskNo(dto.getTaskNo())
                .projectId(dto.getProjectId())
                .issueActionItem(dto.getIssueActionItem())
                .description(dto.getDescription())
                .priority(dto.getPriority())
                .status(dto.getStatus())
                .ownerId(dto.getOwnerId())
                .targetDate(dto.getTargetDate())
                .dateResolved(dto.getDateResolved())
                .createdBy(dto.getCreatedBy())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }
}
