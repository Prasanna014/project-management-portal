package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByDepartmentCode(String departmentCode);

    Optional<Department> findByDepartmentName(String departmentName);

    List<Department> findByDepartmentNameContainingIgnoreCase(String departmentName);

    List<Department> findByActive(Boolean active);
}
