package com.company.projectmanagement.service.impl;

import com.company.projectmanagement.dto.DepartmentRequestDto;
import com.company.projectmanagement.dto.DepartmentResponseDto;
import com.company.projectmanagement.dto.ProjectDepartmentAssignmentRequestDto;
import com.company.projectmanagement.dto.ProjectDepartmentAssignmentResponseDto;
import com.company.projectmanagement.entity.Department;
import com.company.projectmanagement.entity.ProjectDepartment;
import com.company.projectmanagement.entity.id.ProjectDepartmentId;
import com.company.projectmanagement.exception.BadRequestException;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import com.company.projectmanagement.repository.DepartmentRepository;
import com.company.projectmanagement.repository.ProjectDepartmentRepository;
import com.company.projectmanagement.repository.ProjectRepository;
import com.company.projectmanagement.service.DepartmentAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentAdminServiceImpl implements DepartmentAdminService {

    private final DepartmentRepository departmentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectDepartmentRepository projectDepartmentRepository;

    @Override
    @Transactional
    public DepartmentResponseDto createDepartment(DepartmentRequestDto request) {
        departmentRepository.findByDepartmentCode(request.getDepartmentCode())
                .ifPresent(d -> { throw new BadRequestException("Department code already exists"); });

        departmentRepository.findByDepartmentName(request.getDepartmentName())
                .ifPresent(d -> { throw new BadRequestException("Department name already exists"); });

        Department saved = departmentRepository.save(mapToEntity(request, null));
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public DepartmentResponseDto updateDepartment(Long id, DepartmentRequestDto request) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));

        departmentRepository.findByDepartmentCode(request.getDepartmentCode())
                .filter(d -> !d.getId().equals(id))
                .ifPresent(d -> { throw new BadRequestException("Department code already exists"); });

        departmentRepository.findByDepartmentName(request.getDepartmentName())
                .filter(d -> !d.getId().equals(id))
                .ifPresent(d -> { throw new BadRequestException("Department name already exists"); });

        existing.setDepartmentCode(request.getDepartmentCode());
        existing.setDepartmentName(request.getDepartmentName());
        existing.setDescription(request.getDescription());
        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }

        return mapToResponse(departmentRepository.save(existing));
    }

    @Override
    public DepartmentResponseDto getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
        return mapToResponse(department);
    }

    @Override
    public List<DepartmentResponseDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DepartmentResponseDto> getActiveDepartments() {
        return departmentRepository.findByActive(true).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));

        if (!projectDepartmentRepository.findByDepartmentId(id).isEmpty()) {
            throw new BadRequestException("Department is mapped to projects and cannot be deleted");
        }

        departmentRepository.delete(department);
    }

    @Override
    @Transactional
    public ProjectDepartmentAssignmentResponseDto assignProjectToDepartment(ProjectDepartmentAssignmentRequestDto request) {
        if (!projectRepository.existsById(request.getProjectId())) {
            throw new ResourceNotFoundException("Project not found: " + request.getProjectId());
        }
        if (!departmentRepository.existsById(request.getDepartmentId())) {
            throw new ResourceNotFoundException("Department not found: " + request.getDepartmentId());
        }

        ProjectDepartmentId id = new ProjectDepartmentId(request.getProjectId(), request.getDepartmentId());
        if (projectDepartmentRepository.existsById(id)) {
            throw new BadRequestException("Project is already assigned to department");
        }

        ProjectDepartment assignment = ProjectDepartment.builder()
                .projectId(request.getProjectId())
                .departmentId(request.getDepartmentId())
                .build();

        ProjectDepartment saved = projectDepartmentRepository.save(assignment);
        return ProjectDepartmentAssignmentResponseDto.builder()
                .projectId(saved.getProjectId())
                .departmentId(saved.getDepartmentId())
                .build();
    }

    @Override
    @Transactional
    public void removeProjectFromDepartment(Long projectId, Long departmentId) {
        ProjectDepartmentId id = new ProjectDepartmentId(projectId, departmentId);
        ProjectDepartment assignment = projectDepartmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project-department mapping not found"));
        projectDepartmentRepository.delete(assignment);
    }

    @Override
    public List<ProjectDepartmentAssignmentResponseDto> getProjectDepartments(Long projectId) {
        return projectDepartmentRepository.findByProjectId(projectId).stream()
                .map(this::mapProjectDepartmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProjectDepartmentAssignmentResponseDto> getDepartmentProjects(Long departmentId) {
        return projectDepartmentRepository.findByDepartmentId(departmentId).stream()
                .map(this::mapProjectDepartmentResponse)
                .collect(Collectors.toList());
    }

    private Department mapToEntity(DepartmentRequestDto request, Long id) {
        return Department.builder()
                .id(id)
                .departmentCode(request.getDepartmentCode())
                .departmentName(request.getDepartmentName())
                .description(request.getDescription())
                .active(request.getActive())
                .build();
    }

    private DepartmentResponseDto mapToResponse(Department entity) {
        return DepartmentResponseDto.builder()
                .id(entity.getId())
                .departmentCode(entity.getDepartmentCode())
                .departmentName(entity.getDepartmentName())
                .description(entity.getDescription())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private ProjectDepartmentAssignmentResponseDto mapProjectDepartmentResponse(ProjectDepartment entity) {
        return ProjectDepartmentAssignmentResponseDto.builder()
                .projectId(entity.getProjectId())
                .departmentId(entity.getDepartmentId())
                .build();
    }
}
