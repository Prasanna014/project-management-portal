package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.WorkflowDefinitionRequestDto;
import com.company.projectmanagement.dto.WorkflowDefinitionResponseDto;
import com.company.projectmanagement.dto.WorkflowStateRequestDto;
import com.company.projectmanagement.dto.WorkflowStateResponseDto;
import com.company.projectmanagement.dto.WorkflowTransitionRequestDto;
import com.company.projectmanagement.dto.WorkflowTransitionResponseDto;
import com.company.projectmanagement.dto.WorkflowTransitionRoleAssignmentRequestDto;
import com.company.projectmanagement.dto.WorkflowTransitionRoleAssignmentResponseDto;

import java.util.List;

public interface WorkflowAdminService {

    WorkflowDefinitionResponseDto createWorkflow(WorkflowDefinitionRequestDto request);

    WorkflowDefinitionResponseDto updateWorkflow(Long id, WorkflowDefinitionRequestDto request);

    WorkflowDefinitionResponseDto getWorkflowById(Long id);

    List<WorkflowDefinitionResponseDto> getAllWorkflows();

    List<WorkflowDefinitionResponseDto> getActiveWorkflowsByEntityType(String entityType);

    void deleteWorkflow(Long id);

    WorkflowStateResponseDto createState(WorkflowStateRequestDto request);

    WorkflowStateResponseDto updateState(Long id, WorkflowStateRequestDto request);

    void deleteState(Long id);

    List<WorkflowStateResponseDto> getWorkflowStates(Long workflowId);

    WorkflowTransitionResponseDto createTransition(WorkflowTransitionRequestDto request);

    WorkflowTransitionResponseDto updateTransition(Long id, WorkflowTransitionRequestDto request);

    void deleteTransition(Long id);

    List<WorkflowTransitionResponseDto> getWorkflowTransitions(Long workflowId, Long fromStateId);

    WorkflowTransitionRoleAssignmentResponseDto assignRoleToTransition(WorkflowTransitionRoleAssignmentRequestDto request);

    void removeRoleFromTransition(Long transitionId, Long roleId);

    List<WorkflowTransitionRoleAssignmentResponseDto> getTransitionRoles(Long transitionId);
}
