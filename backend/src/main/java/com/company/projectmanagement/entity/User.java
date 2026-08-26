package com.company.projectmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "users",
        schema = "tracker",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email"),
                @UniqueConstraint(columnNames = "employee_id")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false, unique = true)
    @NotBlank
    @Size(max = 255)
    private String employeeId;

    @Column(name = "full_name", nullable = false)
    @NotBlank
    @Size(max = 255)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true)
    @NotBlank
    @Email
    @Size(max = 255)
    private String email;

    @Column(name = "role")
        @Size(max = 100)
    private String role;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "password_change_required")
    private Boolean passwordChangeRequired;

    @Column(name = "account_status", length = 50)
    private String accountStatus;

    @Column(name = "invitation_token", length = 120)
    private String invitationToken;

    @Column(name = "invitation_expires_at")
    private LocalDateTime invitationExpiresAt;

    @Column(name = "password_reset_token", length = 120)
    private String passwordResetToken;

    @Column(name = "password_reset_expires_at")
    private LocalDateTime passwordResetExpiresAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "department_id")
    private Long departmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "users_department_fk"))
    private Department department;

    @Column(name = "designation", length = 255)
    private String designation;

    @Column(name = "reporting_manager_id")
    private Long reportingManagerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporting_manager_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "users_reporting_manager_fk"))
    private User reportingManager;

    @Column(name = "active")
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
        if (this.passwordChangeRequired == null) {
            this.passwordChangeRequired = true;
        }
        if (this.accountStatus == null || this.accountStatus.isBlank()) {
            this.accountStatus = "INVITED";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
