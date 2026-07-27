package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.WorkflowState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowStateRepository extends JpaRepository<WorkflowState, Long> {

    List<WorkflowState> findByWorkflowIdAndActiveOrderByDisplayOrderAsc(Long workflowId, Boolean active);

    Optional<WorkflowState> findByWorkflowIdAndStateKey(Long workflowId, String stateKey);

    Optional<WorkflowState> findByWorkflowIdAndInitialTrue(Long workflowId);
}
