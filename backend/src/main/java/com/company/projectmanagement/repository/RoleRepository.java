package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByRoleKey(String roleKey);

    Optional<Role> findByRoleName(String roleName);

    List<Role> findByActive(Boolean active);
}
