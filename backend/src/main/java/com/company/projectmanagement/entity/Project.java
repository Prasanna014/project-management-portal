// ================= Project.java =================
package com.company.projectmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "projects", schema = "tracker",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = "project_code"),
           @UniqueConstraint(columnNames = "project_name")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id")
    private Long companyId;

    @Column(name = "project_slug", length = 150)
    private String projectSlug;

    @Column(name = "project_code", nullable = false, unique = true)
    @NotBlank
    @Size(max = 255)
    private String projectCode;

    @Column(name = "project_name", nullable = false, unique = true)
    @NotBlank
    @Size(max = 255)
    private String projectName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

        @Column(name = "workflow_id")
        private Long workflowId;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "workflow_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "projects_workflow_fk"))
        private WorkflowDefinition workflow;

    @Column(name = "active")
    private Boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.active == null) {
            this.active = true;
        }
    }
}
