// ================= TaskCommentRepository.java =================
package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.TaskComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {

    List<TaskComment> findByTaskIdOrderByCommentedAtDesc(Long taskId);
}

