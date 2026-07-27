package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskStatusRepository extends JpaRepository<TaskStatus, Long> {

    Optional<TaskStatus> findByStatusKey(String statusKey);

    Optional<TaskStatus> findByStatusName(String statusName);

    List<TaskStatus> findByActiveOrderByDisplayOrderAsc(Boolean active);
}
