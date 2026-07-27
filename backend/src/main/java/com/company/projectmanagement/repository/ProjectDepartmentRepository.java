package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.ProjectDepartment;
import com.company.projectmanagement.entity.id.ProjectDepartmentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectDepartmentRepository extends JpaRepository<ProjectDepartment, ProjectDepartmentId> {

    List<ProjectDepartment> findByProjectId(Long projectId);

    List<ProjectDepartment> findByDepartmentId(Long departmentId);
}
