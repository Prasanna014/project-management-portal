package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.WorkflowDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowDefinitionRepository extends JpaRepository<WorkflowDefinition, Long> {

    Optional<WorkflowDefinition> findByWorkflowKey(String workflowKey);

    List<WorkflowDefinition> findByEntityTypeAndActive(String entityType, Boolean active);
}
