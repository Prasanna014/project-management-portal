package com.company.projectmanagement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "workflow_transitions",
        schema = "tracker",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"workflow_id", "transition_key"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowTransition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "workflow_id", nullable = false)
    private Long workflowId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "workflow_transitions_workflow_fk"))
    private WorkflowDefinition workflow;

    @NotNull
    @Column(name = "from_state_id", nullable = false)
    private Long fromStateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_state_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "workflow_transitions_from_state_fk"))
    private WorkflowState fromState;

    @NotNull
    @Column(name = "to_state_id", nullable = false)
    private Long toStateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_state_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "workflow_transitions_to_state_fk"))
    private WorkflowState toState;

    @NotBlank
    @Size(max = 100)
    @Column(name = "transition_key", nullable = false)
    private String transitionKey;

    @NotBlank
    @Size(max = 255)
    @Column(name = "transition_name", nullable = false)
    private String transitionName;

    @Column(name = "requires_comment", nullable = false)
    private Boolean requiresComment;

    @Column(name = "active", nullable = false)
    private Boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.active == null) {
            this.active = true;
        }
        if (this.requiresComment == null) {
            this.requiresComment = false;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
