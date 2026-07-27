// ================= TaskService.java =================
package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.TaskDto;
import com.company.projectmanagement.entity.Task;
import com.company.projectmanagement.entity.TaskCategory;
import com.company.projectmanagement.entity.TaskPriority;
import com.company.projectmanagement.entity.TaskStatus;
import com.company.projectmanagement.entity.WorkflowState;
import com.company.projectmanagement.exception.BadRequestException;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import com.company.projectmanagement.repository.TaskCategoryRepository;
import com.company.projectmanagement.repository.TaskPriorityRepository;
import com.company.projectmanagement.repository.TaskRepository;
import com.company.projectmanagement.repository.TaskStatusRepository;
import com.company.projectmanagement.repository.WorkflowStateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskStatusRepository taskStatusRepository;
    private final TaskPriorityRepository taskPriorityRepository;
    private final TaskCategoryRepository taskCategoryRepository;
    private final WorkflowStateRepository workflowStateRepository;

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
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return mapToDto(task);
    }

    /* ================= CREATE ================= */
    @Transactional
    public TaskDto createTask(TaskDto dto) {
        Task task = mapToEntity(dto);
        Task saved = taskRepository.save(task);
        return mapToDto(saved);
    }

    /* ================= UPDATE ================= */
    @Transactional
    public TaskDto updateTask(Long id, TaskDto dto) {
        Task existing = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        ResolvedTaskCatalog resolved = resolveCatalogValues(dto, true);

        existing.setTaskNo(dto.getTaskNo());
        existing.setProjectId(dto.getProjectId());
        existing.setIssueActionItem(dto.getIssueActionItem());
        existing.setDescription(dto.getDescription());
        existing.setPriorityId(resolved.priorityId());
        existing.setPriority(resolved.priorityName());
        existing.setStatusId(resolved.statusId());
        existing.setStatus(resolved.statusName());
        existing.setCategoryId(resolved.categoryId());
        existing.setWorkflowStateId(resolved.workflowStateId());
        existing.setOwnerId(dto.getOwnerId());
        existing.setTargetDate(dto.getTargetDate());
        existing.setDateResolved(dto.getDateResolved());
        existing.setCreatedBy(dto.getCreatedBy());

        Task updated = taskRepository.save(existing);
        return mapToDto(updated);
    }

    /* ================= DELETE ================= */
    @Transactional
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
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
                .priority(task.getTaskPriority() != null ? task.getTaskPriority().getPriorityName() : task.getPriority())
                .status(task.getTaskStatus() != null ? task.getTaskStatus().getStatusName() : task.getStatus())
                .priorityId(task.getPriorityId())
                .statusId(task.getStatusId())
                .categoryId(task.getCategoryId())
                .workflowStateId(task.getWorkflowStateId())
                .categoryName(task.getTaskCategory() != null ? task.getTaskCategory().getCategoryName() : null)
                .workflowStateName(task.getWorkflowState() != null ? task.getWorkflowState().getStateName() : null)
                .ownerId(task.getOwnerId())
                .targetDate(task.getTargetDate())
                .dateResolved(task.getDateResolved())
                .createdBy(task.getCreatedBy())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    private Task mapToEntity(TaskDto dto) {
        ResolvedTaskCatalog resolved = resolveCatalogValues(dto, false);

        return Task.builder()
                .taskNo(dto.getTaskNo())
                .projectId(dto.getProjectId())
                .issueActionItem(dto.getIssueActionItem())
                .description(dto.getDescription())
                .priorityId(resolved.priorityId())
                .priority(resolved.priorityName())
                .statusId(resolved.statusId())
                .status(resolved.statusName())
                .categoryId(resolved.categoryId())
                .workflowStateId(resolved.workflowStateId())
                .ownerId(dto.getOwnerId())
                .targetDate(dto.getTargetDate())
                .dateResolved(dto.getDateResolved())
                .createdBy(dto.getCreatedBy())
                .build();
    }

    private ResolvedTaskCatalog resolveCatalogValues(TaskDto dto, boolean allowNullsOnUpdate) {
        TaskStatus status = resolveStatus(dto.getStatusId(), dto.getStatus(), allowNullsOnUpdate);
        TaskPriority priority = resolvePriority(dto.getPriorityId(), dto.getPriority(), allowNullsOnUpdate);
        TaskCategory category = resolveCategory(dto.getCategoryId(), dto.getCategoryName(), allowNullsOnUpdate);
        WorkflowState workflowState = resolveWorkflowState(dto.getWorkflowStateId(), allowNullsOnUpdate);

        return new ResolvedTaskCatalog(
                status == null ? null : status.getId(),
                status == null ? null : status.getStatusName(),
                priority == null ? null : priority.getId(),
                priority == null ? null : priority.getPriorityName(),
                category == null ? null : category.getId(),
                workflowState == null ? null : workflowState.getId()
        );
    }

    private TaskStatus resolveStatus(Long statusId, String statusName, boolean allowNullsOnUpdate) {
        if (statusId != null) {
            return taskStatusRepository.findById(statusId)
                    .orElseThrow(() -> new BadRequestException("Invalid statusId: " + statusId));
        }
        if (statusName != null && !statusName.isBlank()) {
            return taskStatusRepository.findByStatusName(statusName)
                    .orElseThrow(() -> new BadRequestException("Invalid status: " + statusName));
        }
        if (allowNullsOnUpdate) {
            return null;
        }
        return null;
    }

    private TaskPriority resolvePriority(Long priorityId, String priorityName, boolean allowNullsOnUpdate) {
        if (priorityId != null) {
            return taskPriorityRepository.findById(priorityId)
                    .orElseThrow(() -> new BadRequestException("Invalid priorityId: " + priorityId));
        }
        if (priorityName != null && !priorityName.isBlank()) {
            return taskPriorityRepository.findByPriorityName(priorityName)
                    .orElseThrow(() -> new BadRequestException("Invalid priority: " + priorityName));
        }
        if (allowNullsOnUpdate) {
            return null;
        }
        return null;
    }

    private TaskCategory resolveCategory(Long categoryId, String categoryName, boolean allowNullsOnUpdate) {
        if (categoryId != null) {
            return taskCategoryRepository.findById(categoryId)
                    .orElseThrow(() -> new BadRequestException("Invalid categoryId: " + categoryId));
        }
        if (categoryName != null && !categoryName.isBlank()) {
            return taskCategoryRepository.findByCategoryName(categoryName)
                    .orElseThrow(() -> new BadRequestException("Invalid category: " + categoryName));
        }
        if (allowNullsOnUpdate) {
            return null;
        }
        return null;
    }

    private WorkflowState resolveWorkflowState(Long workflowStateId, boolean allowNullsOnUpdate) {
        if (workflowStateId != null) {
            return workflowStateRepository.findById(workflowStateId)
                    .orElseThrow(() -> new BadRequestException("Invalid workflowStateId: " + workflowStateId));
        }
        if (allowNullsOnUpdate) {
            return null;
        }
        return null;
    }

    private record ResolvedTaskCatalog(
            Long statusId,
            String statusName,
            Long priorityId,
            String priorityName,
            Long categoryId,
            Long workflowStateId
    ) {
    }
}
