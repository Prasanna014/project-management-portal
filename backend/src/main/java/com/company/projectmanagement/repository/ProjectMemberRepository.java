package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.ProjectMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByProjectId(Long projectId);
    List<ProjectMember> findByUserId(Long userId);
    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);
    boolean existsByProjectIdAndUserId(Long projectId, Long userId);
    boolean existsByProjectIdAndUserIdAndActiveTrue(Long projectId, Long userId);
    Page<ProjectMember> findByProjectId(Long projectId, Pageable pageable);
}
