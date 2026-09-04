package com.company.projectmanagement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies", schema = "tracker")
@Data
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code", nullable = false, unique = true, length = 100)
    private String companyCode;

    @Column(name = "company_name", nullable = false, unique = true, length = 255)
    private String companyName;

    @Column(name = "company_slug", nullable = false, unique = true, length = 100)
    private String companySlug;

    @Column(nullable = false)
    private Boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void beforeCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
        if (active == null) active = true;
    }

    @PreUpdate
    void beforeUpdate() {
        updatedAt = LocalDateTime.now();
    }
}