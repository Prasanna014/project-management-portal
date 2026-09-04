// ================= TaskRepository.java =================
package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    Optional<Task> findByIdAndCompanyId(Long id, Long companyId);

    List<Task> findByCompanyId(Long companyId);

    List<Task> findByStatus(String status);

    List<Task> findByProjectIdAndStatus(Long projectId, String status);

    List<Task> findByPriority(String priority);

    List<Task> findByProjectIdAndPriority(Long projectId, String priority);

    List<Task> findByProjectId(Long projectId);

    long countByProjectId(Long projectId);

    List<Task> findByOwnerId(Long ownerId);

    Task findByTaskNo(String taskNo);
}
