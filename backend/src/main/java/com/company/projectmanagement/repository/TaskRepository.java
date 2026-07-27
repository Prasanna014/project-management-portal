// ================= TaskRepository.java =================
package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatus(String status);

    List<Task> findByProjectIdAndStatus(Long projectId, String status);

    List<Task> findByPriority(String priority);

    List<Task> findByProjectIdAndPriority(Long projectId, String priority);

    List<Task> findByProjectId(Long projectId);

    long countByProjectId(Long projectId);

    List<Task> findByOwnerId(Long ownerId);

    Task findByTaskNo(String taskNo);
}
