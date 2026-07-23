// ================= Task.java =================
package com.company.projectmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

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
    private String taskNo;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "issue_action_item", nullable = false)
    private String issueActionItem;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "priority")
    private String priority;

    @Column(name = "status")
    private String status;

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

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
