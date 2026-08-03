package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.WorkflowTransitionAvailableDto;

import java.util.List;

public interface WorkflowEngineService {

    List<WorkflowTransitionAvailableDto> getAvailableTransitions(Long taskId);

    void executeTransition(Long taskId, Long transitionId, String comment, Long performedBy);
}
