package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.DepartmentRequestDto;
import com.company.projectmanagement.dto.DepartmentResponseDto;
import com.company.projectmanagement.dto.ProjectDepartmentAssignmentRequestDto;
import com.company.projectmanagement.dto.ProjectDepartmentAssignmentResponseDto;

import java.util.List;

public interface DepartmentAdminService {

    DepartmentResponseDto createDepartment(DepartmentRequestDto request);

    DepartmentResponseDto updateDepartment(Long id, DepartmentRequestDto request);

    DepartmentResponseDto getDepartmentById(Long id);

    List<DepartmentResponseDto> getAllDepartments();

    List<DepartmentResponseDto> getActiveDepartments();

    void deleteDepartment(Long id);

    ProjectDepartmentAssignmentResponseDto assignProjectToDepartment(ProjectDepartmentAssignmentRequestDto request);

    void removeProjectFromDepartment(Long projectId, Long departmentId);

    List<ProjectDepartmentAssignmentResponseDto> getProjectDepartments(Long projectId);

    List<ProjectDepartmentAssignmentResponseDto> getDepartmentProjects(Long departmentId);
}
