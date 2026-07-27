package com.company.projectmanagement.service.impl;

import com.company.projectmanagement.dto.TaskCategoryRequestDto;
import com.company.projectmanagement.dto.TaskCategoryResponseDto;
import com.company.projectmanagement.dto.TaskPriorityRequestDto;
import com.company.projectmanagement.dto.TaskPriorityResponseDto;
import com.company.projectmanagement.dto.TaskStatusRequestDto;
import com.company.projectmanagement.dto.TaskStatusResponseDto;
import com.company.projectmanagement.entity.Task;
import com.company.projectmanagement.entity.TaskCategory;
import com.company.projectmanagement.entity.TaskPriority;
import com.company.projectmanagement.entity.TaskStatus;
import com.company.projectmanagement.exception.BadRequestException;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import com.company.projectmanagement.repository.TaskCategoryRepository;
import com.company.projectmanagement.repository.TaskPriorityRepository;
import com.company.projectmanagement.repository.TaskRepository;
import com.company.projectmanagement.repository.TaskStatusRepository;
import com.company.projectmanagement.service.TaskCatalogAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskCatalogAdminServiceImpl implements TaskCatalogAdminService {

    private final TaskStatusRepository taskStatusRepository;
    private final TaskPriorityRepository taskPriorityRepository;
    private final TaskCategoryRepository taskCategoryRepository;
    private final TaskRepository taskRepository;

    @Override
    @Transactional
    public TaskStatusResponseDto createStatus(TaskStatusRequestDto request) {
        taskStatusRepository.findByStatusKey(request.getStatusKey())
                .ifPresent(s -> { throw new BadRequestException("Status key already exists"); });

        taskStatusRepository.findByStatusName(request.getStatusName())
                .ifPresent(s -> { throw new BadRequestException("Status name already exists"); });

        return mapStatusResponse(taskStatusRepository.save(mapStatusEntity(request, null)));
    }

    @Override
    @Transactional
    public TaskStatusResponseDto updateStatus(Long id, TaskStatusRequestDto request) {
        TaskStatus existing = taskStatusRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task status not found: " + id));

        taskStatusRepository.findByStatusKey(request.getStatusKey())
                .filter(s -> !s.getId().equals(id))
                .ifPresent(s -> { throw new BadRequestException("Status key already exists"); });

        taskStatusRepository.findByStatusName(request.getStatusName())
                .filter(s -> !s.getId().equals(id))
                .ifPresent(s -> { throw new BadRequestException("Status name already exists"); });

        existing.setStatusKey(request.getStatusKey());
        existing.setStatusName(request.getStatusName());
        existing.setDescription(request.getDescription());
        if (request.getDisplayOrder() != null) {
            existing.setDisplayOrder(request.getDisplayOrder());
        }
        existing.setColorCode(request.getColorCode());
        if (request.getTerminal() != null) {
            existing.setTerminal(request.getTerminal());
        }
        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }

        return mapStatusResponse(taskStatusRepository.save(existing));
    }

    @Override
    public TaskStatusResponseDto getStatusById(Long id) {
        TaskStatus entity = taskStatusRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task status not found: " + id));
        return mapStatusResponse(entity);
    }

    @Override
    public List<TaskStatusResponseDto> getAllStatuses() {
        return taskStatusRepository.findAll().stream().map(this::mapStatusResponse).collect(Collectors.toList());
    }

    @Override
    public List<TaskStatusResponseDto> getActiveStatuses() {
        return taskStatusRepository.findByActiveOrderByDisplayOrderAsc(true)
                .stream().map(this::mapStatusResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteStatus(Long id) {
        TaskStatus entity = taskStatusRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task status not found: " + id));

        boolean inUse = taskRepository.findAll().stream()
                .map(Task::getStatusId)
                .anyMatch(statusId -> Objects.equals(statusId, id));
        if (inUse) {
            throw new BadRequestException("Task status is in use and cannot be deleted");
        }

        taskStatusRepository.delete(entity);
    }

    @Override
    @Transactional
    public TaskPriorityResponseDto createPriority(TaskPriorityRequestDto request) {
        taskPriorityRepository.findByPriorityKey(request.getPriorityKey())
                .ifPresent(p -> { throw new BadRequestException("Priority key already exists"); });

        taskPriorityRepository.findByPriorityName(request.getPriorityName())
                .ifPresent(p -> { throw new BadRequestException("Priority name already exists"); });

        return mapPriorityResponse(taskPriorityRepository.save(mapPriorityEntity(request, null)));
    }

    @Override
    @Transactional
    public TaskPriorityResponseDto updatePriority(Long id, TaskPriorityRequestDto request) {
        TaskPriority existing = taskPriorityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task priority not found: " + id));

        taskPriorityRepository.findByPriorityKey(request.getPriorityKey())
                .filter(p -> !p.getId().equals(id))
                .ifPresent(p -> { throw new BadRequestException("Priority key already exists"); });

        taskPriorityRepository.findByPriorityName(request.getPriorityName())
                .filter(p -> !p.getId().equals(id))
                .ifPresent(p -> { throw new BadRequestException("Priority name already exists"); });

        existing.setPriorityKey(request.getPriorityKey());
        existing.setPriorityName(request.getPriorityName());
        existing.setDescription(request.getDescription());
        if (request.getDisplayOrder() != null) {
            existing.setDisplayOrder(request.getDisplayOrder());
        }
        existing.setColorCode(request.getColorCode());
        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }

        return mapPriorityResponse(taskPriorityRepository.save(existing));
    }

    @Override
    public TaskPriorityResponseDto getPriorityById(Long id) {
        TaskPriority entity = taskPriorityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task priority not found: " + id));
        return mapPriorityResponse(entity);
    }

    @Override
    public List<TaskPriorityResponseDto> getAllPriorities() {
        return taskPriorityRepository.findAll().stream().map(this::mapPriorityResponse).collect(Collectors.toList());
    }

    @Override
    public List<TaskPriorityResponseDto> getActivePriorities() {
        return taskPriorityRepository.findByActiveOrderByDisplayOrderAsc(true)
                .stream().map(this::mapPriorityResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deletePriority(Long id) {
        TaskPriority entity = taskPriorityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task priority not found: " + id));

        boolean inUse = taskRepository.findAll().stream()
                .map(Task::getPriorityId)
                .anyMatch(priorityId -> Objects.equals(priorityId, id));
        if (inUse) {
            throw new BadRequestException("Task priority is in use and cannot be deleted");
        }

        taskPriorityRepository.delete(entity);
    }

    @Override
    @Transactional
    public TaskCategoryResponseDto createCategory(TaskCategoryRequestDto request) {
        taskCategoryRepository.findByCategoryKey(request.getCategoryKey())
                .ifPresent(c -> { throw new BadRequestException("Category key already exists"); });

        taskCategoryRepository.findByCategoryName(request.getCategoryName())
                .ifPresent(c -> { throw new BadRequestException("Category name already exists"); });

        return mapCategoryResponse(taskCategoryRepository.save(mapCategoryEntity(request, null)));
    }

    @Override
    @Transactional
    public TaskCategoryResponseDto updateCategory(Long id, TaskCategoryRequestDto request) {
        TaskCategory existing = taskCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task category not found: " + id));

        taskCategoryRepository.findByCategoryKey(request.getCategoryKey())
                .filter(c -> !c.getId().equals(id))
                .ifPresent(c -> { throw new BadRequestException("Category key already exists"); });

        taskCategoryRepository.findByCategoryName(request.getCategoryName())
                .filter(c -> !c.getId().equals(id))
                .ifPresent(c -> { throw new BadRequestException("Category name already exists"); });

        existing.setCategoryKey(request.getCategoryKey());
        existing.setCategoryName(request.getCategoryName());
        existing.setDescription(request.getDescription());
        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }

        return mapCategoryResponse(taskCategoryRepository.save(existing));
    }

    @Override
    public TaskCategoryResponseDto getCategoryById(Long id) {
        TaskCategory entity = taskCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task category not found: " + id));
        return mapCategoryResponse(entity);
    }

    @Override
    public List<TaskCategoryResponseDto> getAllCategories() {
        return taskCategoryRepository.findAll().stream().map(this::mapCategoryResponse).collect(Collectors.toList());
    }

    @Override
    public List<TaskCategoryResponseDto> getActiveCategories() {
        return taskCategoryRepository.findByActive(true).stream()
                .map(this::mapCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        TaskCategory entity = taskCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task category not found: " + id));

        boolean inUse = taskRepository.findAll().stream()
                .map(Task::getCategoryId)
                .anyMatch(categoryId -> Objects.equals(categoryId, id));
        if (inUse) {
            throw new BadRequestException("Task category is in use and cannot be deleted");
        }

        taskCategoryRepository.delete(entity);
    }

    private TaskStatus mapStatusEntity(TaskStatusRequestDto request, Long id) {
        return TaskStatus.builder()
                .id(id)
                .statusKey(request.getStatusKey())
                .statusName(request.getStatusName())
                .description(request.getDescription())
                .displayOrder(request.getDisplayOrder())
                .colorCode(request.getColorCode())
                .terminal(request.getTerminal())
                .active(request.getActive())
                .build();
    }

    private TaskStatusResponseDto mapStatusResponse(TaskStatus entity) {
        return TaskStatusResponseDto.builder()
                .id(entity.getId())
                .statusKey(entity.getStatusKey())
                .statusName(entity.getStatusName())
                .description(entity.getDescription())
                .displayOrder(entity.getDisplayOrder())
                .colorCode(entity.getColorCode())
                .terminal(entity.getTerminal())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private TaskPriority mapPriorityEntity(TaskPriorityRequestDto request, Long id) {
        return TaskPriority.builder()
                .id(id)
                .priorityKey(request.getPriorityKey())
                .priorityName(request.getPriorityName())
                .description(request.getDescription())
                .displayOrder(request.getDisplayOrder())
                .colorCode(request.getColorCode())
                .active(request.getActive())
                .build();
    }

    private TaskPriorityResponseDto mapPriorityResponse(TaskPriority entity) {
        return TaskPriorityResponseDto.builder()
                .id(entity.getId())
                .priorityKey(entity.getPriorityKey())
                .priorityName(entity.getPriorityName())
                .description(entity.getDescription())
                .displayOrder(entity.getDisplayOrder())
                .colorCode(entity.getColorCode())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private TaskCategory mapCategoryEntity(TaskCategoryRequestDto request, Long id) {
        return TaskCategory.builder()
                .id(id)
                .categoryKey(request.getCategoryKey())
                .categoryName(request.getCategoryName())
                .description(request.getDescription())
                .active(request.getActive())
                .build();
    }

    private TaskCategoryResponseDto mapCategoryResponse(TaskCategory entity) {
        return TaskCategoryResponseDto.builder()
                .id(entity.getId())
                .categoryKey(entity.getCategoryKey())
                .categoryName(entity.getCategoryName())
                .description(entity.getDescription())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
