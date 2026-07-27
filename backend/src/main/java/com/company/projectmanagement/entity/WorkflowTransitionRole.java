package com.company.projectmanagement.entity;

import com.company.projectmanagement.entity.id.WorkflowTransitionRoleId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "workflow_transition_roles", schema = "tracker")
@IdClass(WorkflowTransitionRoleId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowTransitionRole {

    @Id
    @Column(name = "transition_id", nullable = false)
    private Long transitionId;

    @Id
    @Column(name = "role_id", nullable = false)
    private Long roleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transition_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "workflow_transition_roles_transition_fk"))
    private WorkflowTransition transition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "workflow_transition_roles_role_fk"))
    private Role role;
}
