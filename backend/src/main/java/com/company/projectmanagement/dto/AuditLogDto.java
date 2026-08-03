package com.company.projectmanagement.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AuditLogDto {
    private Long id;
    private String entityType;
    private Long entityId;
    private String action;
    private String oldValue;
    private String newValue;
    private Long performedBy;
    private String performedByName;
    private LocalDateTime performedAt;
    private String ipAddress;
    private String notes;
}
