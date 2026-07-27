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
        name = "workflow_states",
        schema = "tracker",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"workflow_id", "state_key"}),
                @UniqueConstraint(columnNames = {"workflow_id", "display_order"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "workflow_id", nullable = false)
    private Long workflowId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "workflow_states_workflow_fk"))
    private WorkflowDefinition workflow;

    @NotBlank
    @Size(max = 100)
    @Column(name = "state_key", nullable = false)
    private String stateKey;

    @NotBlank
    @Size(max = 255)
    @Column(name = "state_name", nullable = false)
    private String stateName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "is_initial", nullable = false)
    private Boolean initial;

    @Column(name = "is_terminal", nullable = false)
    private Boolean terminal;

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
        if (this.initial == null) {
            this.initial = false;
        }
        if (this.terminal == null) {
            this.terminal = false;
        }
        if (this.displayOrder == null) {
            this.displayOrder = 0;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
