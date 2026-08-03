package com.company.projectmanagement.service.impl;

import com.company.projectmanagement.controller.ApiListQueryHelper;
import com.company.projectmanagement.dto.AuditLogDto;
import com.company.projectmanagement.entity.AuditLog;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import com.company.projectmanagement.repository.AuditLogRepository;
import com.company.projectmanagement.repository.UserRepository;
import com.company.projectmanagement.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Override
    public Map<String, Object> getAuditLogs(String entityType, Long entityId, String keyword,
                                             String sortBy, String sortDir, int page, int size) {
        List<AuditLog> source;
        if (entityType != null && entityId != null) {
            source = auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId,
                    PageRequest.of(0, Integer.MAX_VALUE, Sort.by(Sort.Direction.DESC, "performedAt"))).getContent();
        } else {
            source = auditLogRepository.findAllByOrderByPerformedAtDesc(
                    PageRequest.of(0, Integer.MAX_VALUE)).getContent();
        }
        List<AuditLogDto> dtos = source.stream().map(this::toDto).collect(Collectors.toList());
        return ApiListQueryHelper.filterSortPaginate(dtos, keyword, null, sortBy, sortDir, page, size,
                d -> (d.getEntityType() != null ? d.getEntityType() : "") + " " + (d.getAction() != null ? d.getAction() : ""),
                dto -> true);
    }

    @Override
    public AuditLogDto getById(Long id) {
        return toDto(auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log not found: " + id)));
    }

    @Override
    @Transactional
    public AuditLogDto record(String entityType, Long entityId, String action,
                               String oldValue, String newValue, Long performedBy, String notes) {
        AuditLog log = AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .oldValue(oldValue)
                .newValue(newValue)
                .performedBy(performedBy)
                .performedAt(LocalDateTime.now())
                .notes(notes)
                .build();
        return toDto(auditLogRepository.save(log));
    }

    private AuditLogDto toDto(AuditLog log) {
        AuditLogDto dto = new AuditLogDto();
        dto.setId(log.getId());
        dto.setEntityType(log.getEntityType());
        dto.setEntityId(log.getEntityId());
        dto.setAction(log.getAction());
        dto.setOldValue(log.getOldValue());
        dto.setNewValue(log.getNewValue());
        dto.setPerformedBy(log.getPerformedBy());
        dto.setPerformedAt(log.getPerformedAt());
        dto.setIpAddress(log.getIpAddress());
        dto.setNotes(log.getNotes());
        if (log.getPerformedBy() != null) {
            userRepository.findById(log.getPerformedBy())
                    .ifPresent(u -> dto.setPerformedByName(u.getFullName()));
        }
        return dto;
    }
}
