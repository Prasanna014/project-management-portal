package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.UserRole;
import com.company.projectmanagement.entity.id.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    List<UserRole> findByUserIdAndActive(Long userId, Boolean active);

    List<UserRole> findByRoleIdAndActive(Long roleId, Boolean active);
}
