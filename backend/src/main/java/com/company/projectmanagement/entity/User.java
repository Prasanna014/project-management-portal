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

        @Column(name = "department_id")
        private Long departmentId;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "department_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "users_department_fk"))
        private Department department;

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
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
