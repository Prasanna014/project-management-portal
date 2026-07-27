package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.TaskPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskPriorityRepository extends JpaRepository<TaskPriority, Long> {

    Optional<TaskPriority> findByPriorityKey(String priorityKey);

    Optional<TaskPriority> findByPriorityName(String priorityName);

    List<TaskPriority> findByActiveOrderByDisplayOrderAsc(Boolean active);
}
