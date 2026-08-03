// ================= ProjectService.java =================
package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.ProjectDto;
import com.company.projectmanagement.entity.Department;
import com.company.projectmanagement.entity.Project;
import com.company.projectmanagement.entity.WorkflowDefinition;
import com.company.projectmanagement.repository.DepartmentRepository;
import com.company.projectmanagement.repository.ProjectDepartmentRepository;
import com.company.projectmanagement.repository.ProjectRepository;
import com.company.projectmanagement.repository.WorkflowDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository repository;
    private final ProjectDepartmentRepository projectDepartmentRepository;
    private final DepartmentRepository departmentRepository;
    private final WorkflowDefinitionRepository workflowDefinitionRepository;

    /* ================= GET ALL ================= */
    public List<ProjectDto> getAllProjects() {
        return repository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /* ================= GET BY ID ================= */
    public ProjectDto getProjectById(Long id) {
        Project project = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));
        return mapToDto(project);
    }

    /* ================= CREATE ================= */
    public ProjectDto createProject(ProjectDto dto) {

        repository.findByProjectCode(dto.getProjectCode())
                .ifPresent(p -> { throw new RuntimeException("Project code already exists"); });

        repository.findByProjectNameContainingIgnoreCase(dto.getProjectName())
                .stream()
                .filter(p -> p.getProjectName().equalsIgnoreCase(dto.getProjectName()))
                .findAny()
                .ifPresent(p -> { throw new RuntimeException("Project name already exists"); });

        Project entity = mapToEntity(dto);
        Project saved = repository.save(entity);

        return mapToDto(saved);
    }

    /* ================= UPDATE ================= */
    public ProjectDto updateProject(Long id, ProjectDto dto) {

        Project existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));

        existing.setProjectCode(dto.getProjectCode());
        existing.setProjectName(dto.getProjectName());
        existing.setDescription(dto.getDescription());
        existing.setActive(dto.getActive());
        existing.setWorkflowId(dto.getWorkflowId());

        Project updated = repository.save(existing);
        return mapToDto(updated);
    }

    /* ================= DELETE ================= */
    public void deleteProject(Long id) {
        Project project = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));

        repository.delete(project);
    }

    /* ================= MAPPER ================= */
    private ProjectDto mapToDto(Project p) {
        String workflowName = null;
        if (p.getWorkflowId() != null) {
            workflowName = workflowDefinitionRepository.findById(p.getWorkflowId())
                    .map(WorkflowDefinition::getWorkflowName)
                    .orElse(null);
        }

        List<ProjectDto.DeptSummary> departments = buildDeptSummaries(p.getId());

        return ProjectDto.builder()
                .id(p.getId())
                .projectCode(p.getProjectCode())
                .projectName(p.getProjectName())
                .description(p.getDescription())
                .active(p.getActive())
                .workflowId(p.getWorkflowId())
                .workflowName(workflowName)
                .departments(departments)
                .createdAt(p.getCreatedAt())
                .build();
    }

    private List<ProjectDto.DeptSummary> buildDeptSummaries(Long projectId) {
        if (projectId == null) {
            return List.of();
        }
        Set<Long> deptIds = projectDepartmentRepository.findByProjectId(projectId)
                .stream()
                .map(pd -> pd.getDepartmentId())
                .collect(Collectors.toSet());
        if (deptIds.isEmpty()) {
            return List.of();
        }
        return departmentRepository.findAllById(deptIds)
                .stream()
                .map(d -> ProjectDto.DeptSummary.builder()
                        .id(d.getId())
                        .departmentName(d.getDepartmentName())
                        .build())
                .collect(Collectors.toList());
    }

    private Project mapToEntity(ProjectDto dto) {
        return Project.builder()
                .projectCode(dto.getProjectCode())
                .projectName(dto.getProjectName())
                .description(dto.getDescription())
                .active(dto.getActive())
                .workflowId(dto.getWorkflowId())
                .build();
    }
}
