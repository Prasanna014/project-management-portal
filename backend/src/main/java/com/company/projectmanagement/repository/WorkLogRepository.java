package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.WorkLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkLogRepository extends JpaRepository<WorkLog, Long> {
    Page<WorkLog> findByTaskId(Long taskId, Pageable pageable);
    Page<WorkLog> findByUserId(Long userId, Pageable pageable);
}
