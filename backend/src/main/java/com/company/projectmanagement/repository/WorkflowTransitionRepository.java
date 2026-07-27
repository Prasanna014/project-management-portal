package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.WorkflowTransition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowTransitionRepository extends JpaRepository<WorkflowTransition, Long> {

    List<WorkflowTransition> findByWorkflowIdAndActive(Long workflowId, Boolean active);

    List<WorkflowTransition> findByWorkflowIdAndFromStateIdAndActive(Long workflowId, Long fromStateId, Boolean active);

    Optional<WorkflowTransition> findByWorkflowIdAndTransitionKey(Long workflowId, String transitionKey);
}
