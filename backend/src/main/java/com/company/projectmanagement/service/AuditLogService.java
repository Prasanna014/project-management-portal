package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.AuditLogDto;

import java.util.Map;

public interface AuditLogService {
    Map<String, Object> getAuditLogs(String entityType, Long entityId, String keyword,
                                     String sortBy, String sortDir, int page, int size);
    AuditLogDto getById(Long id);
    AuditLogDto record(String entityType, Long entityId, String action,
                       String oldValue, String newValue, Long performedBy, String notes);
}
