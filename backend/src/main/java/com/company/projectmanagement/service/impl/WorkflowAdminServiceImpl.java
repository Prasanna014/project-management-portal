package com.company.projectmanagement.service.impl;

import com.company.projectmanagement.dto.WorkflowDefinitionRequestDto;
import com.company.projectmanagement.dto.WorkflowDefinitionResponseDto;
import com.company.projectmanagement.dto.WorkflowStateRequestDto;
import com.company.projectmanagement.dto.WorkflowStateResponseDto;
import com.company.projectmanagement.dto.WorkflowTransitionRequestDto;
import com.company.projectmanagement.dto.WorkflowTransitionResponseDto;
import com.company.projectmanagement.dto.WorkflowTransitionRoleAssignmentRequestDto;
import com.company.projectmanagement.dto.WorkflowTransitionRoleAssignmentResponseDto;
import com.company.projectmanagement.entity.Role;
import com.company.projectmanagement.entity.WorkflowDefinition;
import com.company.projectmanagement.entity.WorkflowState;
import com.company.projectmanagement.entity.WorkflowTransition;
import com.company.projectmanagement.entity.WorkflowTransitionRole;
import com.company.projectmanagement.entity.id.WorkflowTransitionRoleId;
import com.company.projectmanagement.exception.BadRequestException;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import com.company.projectmanagement.repository.ProjectRepository;
import com.company.projectmanagement.repository.RoleRepository;
import com.company.projectmanagement.repository.TaskRepository;
import com.company.projectmanagement.repository.WorkflowDefinitionRepository;
import com.company.projectmanagement.repository.WorkflowStateRepository;
import com.company.projectmanagement.repository.WorkflowTransitionRepository;
import com.company.projectmanagement.repository.WorkflowTransitionRoleRepository;
import com.company.projectmanagement.service.WorkflowAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkflowAdminServiceImpl implements WorkflowAdminService {

    private final WorkflowDefinitionRepository workflowDefinitionRepository;
    private final WorkflowStateRepository workflowStateRepository;
    private final WorkflowTransitionRepository workflowTransitionRepository;
    private final WorkflowTransitionRoleRepository workflowTransitionRoleRepository;
    private final RoleRepository roleRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    @Override
    @Transactional
    public WorkflowDefinitionResponseDto createWorkflow(WorkflowDefinitionRequestDto request) {
        workflowDefinitionRepository.findByWorkflowKey(request.getWorkflowKey())
                .ifPresent(w -> { throw new BadRequestException("Workflow key already exists"); });

        WorkflowDefinition saved = workflowDefinitionRepository.save(mapWorkflowEntity(request, null));
        return mapWorkflowResponse(saved);
    }

    @Override
    @Transactional
    public WorkflowDefinitionResponseDto updateWorkflow(Long id, WorkflowDefinitionRequestDto request) {
        WorkflowDefinition existing = workflowDefinitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found: " + id));

        workflowDefinitionRepository.findByWorkflowKey(request.getWorkflowKey())
                .filter(w -> !w.getId().equals(id))
                .ifPresent(w -> { throw new BadRequestException("Workflow key already exists"); });

        existing.setWorkflowKey(request.getWorkflowKey());
        existing.setWorkflowName(request.getWorkflowName());
        existing.setEntityType(request.getEntityType());
        existing.setDescription(request.getDescription());
        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }

        return mapWorkflowResponse(workflowDefinitionRepository.save(existing));
    }

    @Override
    public WorkflowDefinitionResponseDto getWorkflowById(Long id) {
        WorkflowDefinition workflow = workflowDefinitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found: " + id));
        return mapWorkflowResponse(workflow);
    }

    @Override
    public List<WorkflowDefinitionResponseDto> getAllWorkflows() {
        return workflowDefinitionRepository.findAll().stream()
                .map(this::mapWorkflowResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<WorkflowDefinitionResponseDto> getActiveWorkflowsByEntityType(String entityType) {
        return workflowDefinitionRepository.findByEntityTypeAndActive(entityType, true).stream()
                .map(this::mapWorkflowResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteWorkflow(Long id) {
        WorkflowDefinition workflow = workflowDefinitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found: " + id));

        boolean assignedToProject = projectRepository.findAll().stream()
                .map(project -> project.getWorkflowId())
                .anyMatch(workflowId -> Objects.equals(workflowId, id));

        if (assignedToProject) {
            throw new BadRequestException("Workflow is assigned to projects and cannot be deleted");
        }

        if (!workflowStateRepository.findByWorkflowIdAndActiveOrderByDisplayOrderAsc(id, true).isEmpty()) {
            throw new BadRequestException("Workflow has active states and cannot be deleted");
        }

        workflowDefinitionRepository.delete(workflow);
    }

    @Override
    @Transactional
    public void deleteState(Long id) {
        WorkflowState state = workflowStateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow state not found: " + id));
        boolean usedByTasks = taskRepository.findAll().stream()
                .anyMatch(t -> Objects.equals(t.getWorkflowStateId(), id));
        if (usedByTasks) {
            throw new BadRequestException("State is assigned to tasks and cannot be deleted");
        }
        workflowStateRepository.delete(state);
    }

    @Override
    @Transactional
    public void deleteTransition(Long id) {
        WorkflowTransition transition = workflowTransitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow transition not found: " + id));
        workflowTransitionRepository.delete(transition);
    }

    @Override
    @Transactional
    public WorkflowStateResponseDto createState(WorkflowStateRequestDto request) {
        if (!workflowDefinitionRepository.existsById(request.getWorkflowId())) {
            throw new ResourceNotFoundException("Workflow not found: " + request.getWorkflowId());
        }

        workflowStateRepository.findByWorkflowIdAndStateKey(request.getWorkflowId(), request.getStateKey())
                .ifPresent(s -> { throw new BadRequestException("State key already exists in workflow"); });

        if (Boolean.TRUE.equals(request.getInitial())) {
            workflowStateRepository.findByWorkflowIdAndInitialTrue(request.getWorkflowId())
                    .ifPresent(s -> { throw new BadRequestException("Initial state already exists for workflow"); });
        }

        WorkflowState saved = workflowStateRepository.save(mapStateEntity(request, null));
        return mapStateResponse(saved);
    }

    @Override
    @Transactional
    public WorkflowStateResponseDto updateState(Long id, WorkflowStateRequestDto request) {
        WorkflowState existing = workflowStateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow state not found: " + id));

        if (!workflowDefinitionRepository.existsById(request.getWorkflowId())) {
            throw new ResourceNotFoundException("Workflow not found: " + request.getWorkflowId());
        }

        workflowStateRepository.findByWorkflowIdAndStateKey(request.getWorkflowId(), request.getStateKey())
                .filter(s -> !s.getId().equals(id))
                .ifPresent(s -> { throw new BadRequestException("State key already exists in workflow"); });

        if (Boolean.TRUE.equals(request.getInitial())) {
            workflowStateRepository.findByWorkflowIdAndInitialTrue(request.getWorkflowId())
                    .filter(s -> !s.getId().equals(id))
                    .ifPresent(s -> { throw new BadRequestException("Initial state already exists for workflow"); });
        }

        existing.setWorkflowId(request.getWorkflowId());
        existing.setStateKey(request.getStateKey());
        existing.setStateName(request.getStateName());
        existing.setDescription(request.getDescription());
        if (request.getDisplayOrder() != null) {
            existing.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getInitial() != null) {
            existing.setInitial(request.getInitial());
        }
        if (request.getTerminal() != null) {
            existing.setTerminal(request.getTerminal());
        }
        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }

        return mapStateResponse(workflowStateRepository.save(existing));
    }

    @Override
    public List<WorkflowStateResponseDto> getWorkflowStates(Long workflowId) {
        List<WorkflowStateResponseDto> activeStates = workflowStateRepository
                .findByWorkflowIdAndActiveOrderByDisplayOrderAsc(workflowId, true)
                .stream()
                .map(this::mapStateResponse)
                .collect(Collectors.toList());

        List<WorkflowStateResponseDto> inactiveStates = workflowStateRepository.findAll().stream()
                .filter(state -> Objects.equals(state.getWorkflowId(), workflowId))
                .filter(state -> !Boolean.TRUE.equals(state.getActive()))
                .map(this::mapStateResponse)
                .collect(Collectors.toList());

        activeStates.addAll(inactiveStates);
        return activeStates;
    }

    @Override
    @Transactional
    public WorkflowTransitionResponseDto createTransition(WorkflowTransitionRequestDto request) {
        validateTransitionReferences(request.getWorkflowId(), request.getFromStateId(), request.getToStateId());

        workflowTransitionRepository.findByWorkflowIdAndTransitionKey(request.getWorkflowId(), request.getTransitionKey())
                .ifPresent(t -> { throw new BadRequestException("Transition key already exists in workflow"); });

        WorkflowTransition saved = workflowTransitionRepository.save(mapTransitionEntity(request, null));
        return mapTransitionResponse(saved);
    }

    @Override
    @Transactional
    public WorkflowTransitionResponseDto updateTransition(Long id, WorkflowTransitionRequestDto request) {
        WorkflowTransition existing = workflowTransitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow transition not found: " + id));

        validateTransitionReferences(request.getWorkflowId(), request.getFromStateId(), request.getToStateId());

        workflowTransitionRepository.findByWorkflowIdAndTransitionKey(request.getWorkflowId(), request.getTransitionKey())
                .filter(t -> !t.getId().equals(id))
                .ifPresent(t -> { throw new BadRequestException("Transition key already exists in workflow"); });

        existing.setWorkflowId(request.getWorkflowId());
        existing.setFromStateId(request.getFromStateId());
        existing.setToStateId(request.getToStateId());
        existing.setTransitionKey(request.getTransitionKey());
        existing.setTransitionName(request.getTransitionName());
        if (request.getRequiresComment() != null) {
            existing.setRequiresComment(request.getRequiresComment());
        }
        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }

        return mapTransitionResponse(workflowTransitionRepository.save(existing));
    }

    @Override
    public List<WorkflowTransitionResponseDto> getWorkflowTransitions(Long workflowId, Long fromStateId) {
        List<WorkflowTransition> transitions;
        if (fromStateId == null) {
            transitions = workflowTransitionRepository.findByWorkflowIdAndActive(workflowId, true);
        } else {
            transitions = workflowTransitionRepository.findByWorkflowIdAndFromStateIdAndActive(workflowId, fromStateId, true);
        }

        return transitions.stream().map(this::mapTransitionResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WorkflowTransitionRoleAssignmentResponseDto assignRoleToTransition(WorkflowTransitionRoleAssignmentRequestDto request) {
        if (!workflowTransitionRepository.existsById(request.getTransitionId())) {
            throw new ResourceNotFoundException("Transition not found: " + request.getTransitionId());
        }
        if (!roleRepository.existsById(request.getRoleId())) {
            throw new ResourceNotFoundException("Role not found: " + request.getRoleId());
        }

        WorkflowTransitionRoleId id = new WorkflowTransitionRoleId(request.getTransitionId(), request.getRoleId());
        if (workflowTransitionRoleRepository.existsById(id)) {
            throw new BadRequestException("Role is already assigned to transition");
        }

        WorkflowTransitionRole saved = workflowTransitionRoleRepository.save(WorkflowTransitionRole.builder()
                .transitionId(request.getTransitionId())
                .roleId(request.getRoleId())
                .build());

        return mapTransitionRoleResponse(saved);
    }

    @Override
    @Transactional
    public void removeRoleFromTransition(Long transitionId, Long roleId) {
        WorkflowTransitionRoleId id = new WorkflowTransitionRoleId(transitionId, roleId);
        WorkflowTransitionRole mapping = workflowTransitionRoleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transition-role mapping not found"));
        workflowTransitionRoleRepository.delete(mapping);
    }

    @Override
    public List<WorkflowTransitionRoleAssignmentResponseDto> getTransitionRoles(Long transitionId) {
        return workflowTransitionRoleRepository.findByTransitionId(transitionId).stream()
                .map(this::mapTransitionRoleResponse)
                .collect(Collectors.toList());
    }

    private void validateTransitionReferences(Long workflowId, Long fromStateId, Long toStateId) {
        WorkflowDefinition workflow = workflowDefinitionRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found: " + workflowId));

        WorkflowState fromState = workflowStateRepository.findById(fromStateId)
                .orElseThrow(() -> new ResourceNotFoundException("From state not found: " + fromStateId));

        WorkflowState toState = workflowStateRepository.findById(toStateId)
                .orElseThrow(() -> new ResourceNotFoundException("To state not found: " + toStateId));

        if (!Objects.equals(fromState.getWorkflowId(), workflow.getId())
                || !Objects.equals(toState.getWorkflowId(), workflow.getId())) {
            throw new BadRequestException("Transition states must belong to the same workflow");
        }
    }

    private WorkflowDefinition mapWorkflowEntity(WorkflowDefinitionRequestDto request, Long id) {
        return WorkflowDefinition.builder()
                .id(id)
                .workflowKey(request.getWorkflowKey())
                .workflowName(request.getWorkflowName())
                .entityType(request.getEntityType())
                .description(request.getDescription())
                .active(request.getActive())
                .build();
    }

    private WorkflowDefinitionResponseDto mapWorkflowResponse(WorkflowDefinition entity) {
        return WorkflowDefinitionResponseDto.builder()
                .id(entity.getId())
                .workflowKey(entity.getWorkflowKey())
                .workflowName(entity.getWorkflowName())
                .entityType(entity.getEntityType())
                .description(entity.getDescription())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private WorkflowState mapStateEntity(WorkflowStateRequestDto request, Long id) {
        return WorkflowState.builder()
                .id(id)
                .workflowId(request.getWorkflowId())
                .stateKey(request.getStateKey())
                .stateName(request.getStateName())
                .description(request.getDescription())
                .displayOrder(request.getDisplayOrder())
                .initial(request.getInitial())
                .terminal(request.getTerminal())
                .active(request.getActive())
                .build();
    }

    private WorkflowStateResponseDto mapStateResponse(WorkflowState entity) {
        return WorkflowStateResponseDto.builder()
                .id(entity.getId())
                .workflowId(entity.getWorkflowId())
                .stateKey(entity.getStateKey())
                .stateName(entity.getStateName())
                .description(entity.getDescription())
                .displayOrder(entity.getDisplayOrder())
                .initial(entity.getInitial())
                .terminal(entity.getTerminal())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private WorkflowTransition mapTransitionEntity(WorkflowTransitionRequestDto request, Long id) {
        return WorkflowTransition.builder()
                .id(id)
                .workflowId(request.getWorkflowId())
                .fromStateId(request.getFromStateId())
                .toStateId(request.getToStateId())
                .transitionKey(request.getTransitionKey())
                .transitionName(request.getTransitionName())
                .requiresComment(request.getRequiresComment())
                .active(request.getActive())
                .build();
    }

    private WorkflowTransitionResponseDto mapTransitionResponse(WorkflowTransition entity) {
        return WorkflowTransitionResponseDto.builder()
                .id(entity.getId())
                .workflowId(entity.getWorkflowId())
                .fromStateId(entity.getFromStateId())
                .toStateId(entity.getToStateId())
                .transitionKey(entity.getTransitionKey())
                .transitionName(entity.getTransitionName())
                .requiresComment(entity.getRequiresComment())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private WorkflowTransitionRoleAssignmentResponseDto mapTransitionRoleResponse(WorkflowTransitionRole entity) {
        Role role = roleRepository.findById(entity.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + entity.getRoleId()));
        return WorkflowTransitionRoleAssignmentResponseDto.builder()
                .transitionId(entity.getTransitionId())
                .roleId(role.getId())
                .build();
    }
}
