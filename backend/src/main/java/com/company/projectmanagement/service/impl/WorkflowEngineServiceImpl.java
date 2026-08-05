package com.company.projectmanagement.service.impl;

import com.company.projectmanagement.dto.WorkflowTransitionAvailableDto;
import com.company.projectmanagement.entity.ActivityHistory;
import com.company.projectmanagement.entity.Task;
import com.company.projectmanagement.entity.TaskComment;
import com.company.projectmanagement.entity.WorkflowState;
import com.company.projectmanagement.entity.WorkflowTransition;
import com.company.projectmanagement.exception.BadRequestException;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import com.company.projectmanagement.repository.ActivityHistoryRepository;
import com.company.projectmanagement.repository.TaskCommentRepository;
import com.company.projectmanagement.repository.TaskRepository;
import com.company.projectmanagement.repository.TaskStatusRepository;
import com.company.projectmanagement.repository.WorkflowStateRepository;
import com.company.projectmanagement.repository.WorkflowTransitionRepository;
import com.company.projectmanagement.service.WorkflowEngineService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkflowEngineServiceImpl implements WorkflowEngineService {

    private final TaskRepository taskRepository;
    private final TaskStatusRepository taskStatusRepository;
    private final WorkflowStateRepository workflowStateRepository;
    private final WorkflowTransitionRepository workflowTransitionRepository;
    private final ActivityHistoryRepository activityHistoryRepository;
    private final TaskCommentRepository taskCommentRepository;

    @Override
    public List<WorkflowTransitionAvailableDto> getAvailableTransitions(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        if (task.getWorkflowStateId() == null) {
            return List.of();
        }

        WorkflowState currentState = workflowStateRepository.findById(task.getWorkflowStateId())
                .orElse(null);
        if (currentState == null) {
            return List.of();
        }

        return workflowTransitionRepository
                .findByWorkflowIdAndFromStateIdAndActive(currentState.getWorkflowId(), currentState.getId(), true)
                .stream()
                .map(t -> {
                    String toStateName = workflowStateRepository.findById(t.getToStateId())
                            .map(WorkflowState::getStateName)
                            .orElse(null);
                    return WorkflowTransitionAvailableDto.builder()
                            .id(t.getId())
                            .transitionKey(t.getTransitionKey())
                            .transitionName(t.getTransitionName())
                            .toStateId(t.getToStateId())
                            .toStateName(toStateName)
                            .requiresComment(t.getRequiresComment())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void executeTransition(Long taskId, Long transitionId, String comment, Long performedBy) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        WorkflowTransition transition = workflowTransitionRepository.findById(transitionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transition not found: " + transitionId));

        if (!Boolean.TRUE.equals(transition.getActive())) {
            throw new BadRequestException("Transition is not active");
        }

        if (!transition.getFromStateId().equals(task.getWorkflowStateId())) {
            throw new BadRequestException("Transition is not valid for the current task state");
        }

        if (Boolean.TRUE.equals(transition.getRequiresComment()) && (comment == null || comment.isBlank())) {
            throw new BadRequestException("A comment is required to execute this transition");
        }

        String fromStateName = workflowStateRepository.findById(transition.getFromStateId())
                .map(WorkflowState::getStateName)
                .orElse(String.valueOf(transition.getFromStateId()));

        WorkflowState toState = workflowStateRepository.findById(transition.getToStateId())
                .orElseThrow(() -> new ResourceNotFoundException("Target state not found: " + transition.getToStateId()));

        task.setWorkflowStateId(toState.getId());
        task.setStatus(toState.getStateName());
        // keep statusId in sync so mapToDto() returns the correct status name
        taskStatusRepository.findByStatusName(toState.getStateName())
                .ifPresent(ts -> task.setStatusId(ts.getId()));
        taskRepository.save(task);

        activityHistoryRepository.save(ActivityHistory.builder()
                .taskId(taskId)
                .activityType("WORKFLOW_TRANSITION")
                .oldValue(fromStateName)
                .newValue(toState.getStateName() + " (via " + transition.getTransitionName() + ")")
                .performedBy(performedBy)
                .build());

        if (comment != null && !comment.isBlank()) {
            taskCommentRepository.save(TaskComment.builder()
                    .taskId(taskId)
                    .commentText("[" + transition.getTransitionName() + "] " + comment)
                    .commentedBy(performedBy)
                    .build());
        }
    }
}
