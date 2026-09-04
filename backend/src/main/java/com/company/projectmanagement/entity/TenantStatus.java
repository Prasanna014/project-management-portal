package com.company.projectmanagement.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "tenant_status", schema = "tracker")
@Data
public class TenantStatus {
    @Id
    private Long companyId;
    private String status;
}