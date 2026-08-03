package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId, Pageable pageable);
    Page<AuditLog> findByPerformedBy(Long performedBy, Pageable pageable);
    Page<AuditLog> findAllByOrderByPerformedAtDesc(Pageable pageable);
}
