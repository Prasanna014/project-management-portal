package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.RolePermissionAssignmentRequestDto;
import com.company.projectmanagement.dto.RolePermissionAssignmentResponseDto;
import com.company.projectmanagement.dto.RoleRequestDto;
import com.company.projectmanagement.dto.RoleResponseDto;
import com.company.projectmanagement.dto.UserRoleAssignmentRequestDto;
import com.company.projectmanagement.dto.UserRoleAssignmentResponseDto;

import java.util.List;

public interface RoleAdminService {

    RoleResponseDto createRole(RoleRequestDto request);

    RoleResponseDto updateRole(Long id, RoleRequestDto request);

    RoleResponseDto getRoleById(Long id);

    List<RoleResponseDto> getAllRoles();

    List<RoleResponseDto> getActiveRoles();

    void deleteRole(Long id);

    UserRoleAssignmentResponseDto assignRoleToUser(UserRoleAssignmentRequestDto request);

    void removeRoleFromUser(Long userId, Long roleId);

    List<UserRoleAssignmentResponseDto> getUserRoles(Long userId);

    RolePermissionAssignmentResponseDto assignPermissionToRole(RolePermissionAssignmentRequestDto request);

    void removePermissionFromRole(Long roleId, Long permissionId);

    List<RolePermissionAssignmentResponseDto> getRolePermissions(Long roleId);
}
