package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.WorkflowTransitionRole;
import com.company.projectmanagement.entity.id.WorkflowTransitionRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowTransitionRoleRepository extends JpaRepository<WorkflowTransitionRole, WorkflowTransitionRoleId> {

    List<WorkflowTransitionRole> findByTransitionId(Long transitionId);

    List<WorkflowTransitionRole> findByRoleId(Long roleId);
}
