package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.TaskCategoryRequestDto;
import com.company.projectmanagement.dto.TaskCategoryResponseDto;
import com.company.projectmanagement.dto.TaskPriorityRequestDto;
import com.company.projectmanagement.dto.TaskPriorityResponseDto;
import com.company.projectmanagement.dto.TaskStatusRequestDto;
import com.company.projectmanagement.dto.TaskStatusResponseDto;

import java.util.List;

public interface TaskCatalogAdminService {

    TaskStatusResponseDto createStatus(TaskStatusRequestDto request);

    TaskStatusResponseDto updateStatus(Long id, TaskStatusRequestDto request);

    TaskStatusResponseDto getStatusById(Long id);

    List<TaskStatusResponseDto> getAllStatuses();

    List<TaskStatusResponseDto> getActiveStatuses();

    void deleteStatus(Long id);

    TaskPriorityResponseDto createPriority(TaskPriorityRequestDto request);

    TaskPriorityResponseDto updatePriority(Long id, TaskPriorityRequestDto request);

    TaskPriorityResponseDto getPriorityById(Long id);

    List<TaskPriorityResponseDto> getAllPriorities();

    List<TaskPriorityResponseDto> getActivePriorities();

    void deletePriority(Long id);

    TaskCategoryResponseDto createCategory(TaskCategoryRequestDto request);

    TaskCategoryResponseDto updateCategory(Long id, TaskCategoryRequestDto request);

    TaskCategoryResponseDto getCategoryById(Long id);

    List<TaskCategoryResponseDto> getAllCategories();

    List<TaskCategoryResponseDto> getActiveCategories();

    void deleteCategory(Long id);
}
