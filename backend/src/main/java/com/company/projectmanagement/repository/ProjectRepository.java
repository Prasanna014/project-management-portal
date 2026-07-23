// ================= ProjectRepository.java =================
package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findByProjectCode(String projectCode);

    List<Project> findByProjectNameContainingIgnoreCase(String projectName);

    List<Project> findByActive(Boolean active);
}
