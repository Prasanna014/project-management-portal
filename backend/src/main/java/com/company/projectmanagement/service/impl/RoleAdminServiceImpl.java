package com.company.projectmanagement.service.impl;

import com.company.projectmanagement.dto.RolePermissionAssignmentRequestDto;
import com.company.projectmanagement.dto.RolePermissionAssignmentResponseDto;
import com.company.projectmanagement.dto.RoleRequestDto;
import com.company.projectmanagement.dto.RoleResponseDto;
import com.company.projectmanagement.dto.UserRoleAssignmentRequestDto;
import com.company.projectmanagement.dto.UserRoleAssignmentResponseDto;
import com.company.projectmanagement.entity.Role;
import com.company.projectmanagement.entity.RolePermission;
import com.company.projectmanagement.entity.UserRole;
import com.company.projectmanagement.entity.id.RolePermissionId;
import com.company.projectmanagement.entity.id.UserRoleId;
import com.company.projectmanagement.exception.BadRequestException;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import com.company.projectmanagement.repository.PermissionRepository;
import com.company.projectmanagement.repository.RolePermissionRepository;
import com.company.projectmanagement.repository.RoleRepository;
import com.company.projectmanagement.repository.UserRepository;
import com.company.projectmanagement.repository.UserRoleRepository;
import com.company.projectmanagement.repository.WorkflowTransitionRoleRepository;
import com.company.projectmanagement.service.RoleAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleAdminServiceImpl implements RoleAdminService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final WorkflowTransitionRoleRepository workflowTransitionRoleRepository;

    @Override
    @Transactional
    public RoleResponseDto createRole(RoleRequestDto request) {
        roleRepository.findByRoleKey(request.getRoleKey())
                .ifPresent(r -> { throw new BadRequestException("Role key already exists"); });

        roleRepository.findByRoleName(request.getRoleName())
                .ifPresent(r -> { throw new BadRequestException("Role name already exists"); });

        Role saved = roleRepository.save(mapToEntity(request, null));
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public RoleResponseDto updateRole(Long id, RoleRequestDto request) {
        Role existing = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));

        roleRepository.findByRoleKey(request.getRoleKey())
                .filter(r -> !r.getId().equals(id))
                .ifPresent(r -> { throw new BadRequestException("Role key already exists"); });

        roleRepository.findByRoleName(request.getRoleName())
                .filter(r -> !r.getId().equals(id))
                .ifPresent(r -> { throw new BadRequestException("Role name already exists"); });

        existing.setRoleKey(request.getRoleKey());
        existing.setRoleName(request.getRoleName());
        existing.setDescription(request.getDescription());
        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }
        if (request.getSystemRole() != null) {
            existing.setSystemRole(request.getSystemRole());
        }

        return mapToResponse(roleRepository.save(existing));
    }

    @Override
    public RoleResponseDto getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));
        return mapToResponse(role);
    }

    @Override
    public List<RoleResponseDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoleResponseDto> getActiveRoles() {
        return roleRepository.findByActive(true).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));

        if (!userRoleRepository.findByRoleIdAndActive(id, true).isEmpty()) {
            throw new BadRequestException("Role is assigned to users and cannot be deleted");
        }

        if (!rolePermissionRepository.findByRoleId(id).isEmpty()) {
            throw new BadRequestException("Role is assigned to permissions and cannot be deleted");
        }

        if (!workflowTransitionRoleRepository.findByRoleId(id).isEmpty()) {
            throw new BadRequestException("Role is used in workflow transitions and cannot be deleted");
        }

        roleRepository.delete(role);
    }

    @Override
    @Transactional
    public UserRoleAssignmentResponseDto assignRoleToUser(UserRoleAssignmentRequestDto request) {
        if (!userRepository.existsById(request.getUserId())) {
            throw new ResourceNotFoundException("User not found: " + request.getUserId());
        }
        if (!roleRepository.existsById(request.getRoleId())) {
            throw new ResourceNotFoundException("Role not found: " + request.getRoleId());
        }

        UserRoleId id = new UserRoleId(request.getUserId(), request.getRoleId());
        if (userRoleRepository.existsById(id)) {
            throw new BadRequestException("Role is already assigned to user");
        }

        UserRole saved = userRoleRepository.save(UserRole.builder()
                .userId(request.getUserId())
                .roleId(request.getRoleId())
                .assignedBy(request.getAssignedBy())
                .active(request.getActive())
                .build());

        return mapUserRoleResponse(saved);
    }

    @Override
    @Transactional
    public void removeRoleFromUser(Long userId, Long roleId) {
        UserRoleId id = new UserRoleId(userId, roleId);
        UserRole mapping = userRoleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User-role mapping not found"));
        userRoleRepository.delete(mapping);
    }

    @Override
    public List<UserRoleAssignmentResponseDto> getUserRoles(Long userId) {
        return userRoleRepository.findByUserIdAndActive(userId, true).stream()
                .map(this::mapUserRoleResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RolePermissionAssignmentResponseDto assignPermissionToRole(RolePermissionAssignmentRequestDto request) {
        if (!roleRepository.existsById(request.getRoleId())) {
            throw new ResourceNotFoundException("Role not found: " + request.getRoleId());
        }
        if (!permissionRepository.existsById(request.getPermissionId())) {
            throw new ResourceNotFoundException("Permission not found: " + request.getPermissionId());
        }

        RolePermissionId id = new RolePermissionId(request.getRoleId(), request.getPermissionId());
        if (rolePermissionRepository.existsById(id)) {
            throw new BadRequestException("Permission is already assigned to role");
        }

        RolePermission saved = rolePermissionRepository.save(RolePermission.builder()
                .roleId(request.getRoleId())
                .permissionId(request.getPermissionId())
                .grantedBy(request.getGrantedBy())
                .build());

        return mapRolePermissionResponse(saved);
    }

    @Override
    @Transactional
    public void removePermissionFromRole(Long roleId, Long permissionId) {
        RolePermissionId id = new RolePermissionId(roleId, permissionId);
        RolePermission mapping = rolePermissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role-permission mapping not found"));
        rolePermissionRepository.delete(mapping);
    }

    @Override
    public List<RolePermissionAssignmentResponseDto> getRolePermissions(Long roleId) {
        return rolePermissionRepository.findByRoleId(roleId).stream()
                .map(this::mapRolePermissionResponse)
                .collect(Collectors.toList());
    }

    private Role mapToEntity(RoleRequestDto request, Long id) {
        return Role.builder()
                .id(id)
                .roleKey(request.getRoleKey())
                .roleName(request.getRoleName())
                .description(request.getDescription())
                .active(request.getActive())
                .systemRole(request.getSystemRole())
                .build();
    }

    private RoleResponseDto mapToResponse(Role entity) {
        return RoleResponseDto.builder()
                .id(entity.getId())
                .roleKey(entity.getRoleKey())
                .roleName(entity.getRoleName())
                .description(entity.getDescription())
                .active(entity.getActive())
                .systemRole(entity.getSystemRole())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private UserRoleAssignmentResponseDto mapUserRoleResponse(UserRole entity) {
        return UserRoleAssignmentResponseDto.builder()
                .userId(entity.getUserId())
                .roleId(entity.getRoleId())
                .assignedBy(entity.getAssignedBy())
                .active(entity.getActive())
                .assignedAt(entity.getAssignedAt())
                .build();
    }

    private RolePermissionAssignmentResponseDto mapRolePermissionResponse(RolePermission entity) {
        return RolePermissionAssignmentResponseDto.builder()
                .roleId(entity.getRoleId())
                .permissionId(entity.getPermissionId())
                .grantedBy(entity.getGrantedBy())
                .grantedAt(entity.getGrantedAt())
                .build();
    }
}
