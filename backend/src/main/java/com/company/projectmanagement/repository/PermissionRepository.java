package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    Optional<Permission> findByPermissionKey(String permissionKey);

    Optional<Permission> findByPermissionName(String permissionName);

    List<Permission> findByModuleName(String moduleName);

    List<Permission> findByActive(Boolean active);
}
