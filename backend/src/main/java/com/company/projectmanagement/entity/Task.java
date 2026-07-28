// ================= Task.java =================
package com.company.projectmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks", schema = "tracker")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_no", nullable = false, unique = true)
    @NotBlank
    @Size(max = 255)
    private String taskNo;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "issue_action_item", nullable = false)
    @NotBlank
    @Size(max = 255)
    private String issueActionItem;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "priority")
    @Size(max = 50)
    private String priority;

    @Column(name = "status")
        @Size(max = 50)
    private String status;

        @Column(name = "status_id")
        private Long statusId;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "status_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "tasks_status_fk"))
        private TaskStatus taskStatus;

        @Column(name = "priority_id")
        private Long priorityId;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "priority_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "tasks_priority_fk"))
        private TaskPriority taskPriority;

        @Column(name = "category_id")
        private Long categoryId;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "category_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "tasks_category_fk"))
        private TaskCategory taskCategory;

        @Column(name = "workflow_state_id")
        private Long workflowStateId;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "workflow_state_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "tasks_workflow_state_fk"))
        private WorkflowState workflowState;

    @Column(name = "owner_id")
    private Long ownerId;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "date_resolved")
    private LocalDate dateResolved;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "estimated_hours", precision = 6, scale = 2)
    private BigDecimal estimatedHours;

    @Column(name = "logged_hours", precision = 6, scale = 2)
    private BigDecimal loggedHours;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
