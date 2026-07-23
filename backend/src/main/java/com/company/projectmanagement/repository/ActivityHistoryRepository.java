// ================= ActivityHistoryRepository.java =================
package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.ActivityHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityHistoryRepository extends JpaRepository<ActivityHistory, Long> {

    List<ActivityHistory> findByTaskIdOrderByPerformedAtDesc(Long taskId);
}
