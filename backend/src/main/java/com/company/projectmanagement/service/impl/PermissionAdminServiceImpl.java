package com.company.projectmanagement.service.impl;

import com.company.projectmanagement.dto.PermissionRequestDto;
import com.company.projectmanagement.dto.PermissionResponseDto;
import com.company.projectmanagement.entity.Permission;
import com.company.projectmanagement.exception.BadRequestException;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import com.company.projectmanagement.repository.PermissionRepository;
import com.company.projectmanagement.repository.RolePermissionRepository;
import com.company.projectmanagement.service.PermissionAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PermissionAdminServiceImpl implements PermissionAdminService {

    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Override
    @Transactional
    public PermissionResponseDto createPermission(PermissionRequestDto request) {
        permissionRepository.findByPermissionKey(request.getPermissionKey())
                .ifPresent(p -> { throw new BadRequestException("Permission key already exists"); });

        permissionRepository.findByPermissionName(request.getPermissionName())
                .ifPresent(p -> { throw new BadRequestException("Permission name already exists"); });

        Permission saved = permissionRepository.save(mapToEntity(request, null));
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public PermissionResponseDto updatePermission(Long id, PermissionRequestDto request) {
        Permission existing = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + id));

        permissionRepository.findByPermissionKey(request.getPermissionKey())
                .filter(p -> !p.getId().equals(id))
                .ifPresent(p -> { throw new BadRequestException("Permission key already exists"); });

        permissionRepository.findByPermissionName(request.getPermissionName())
                .filter(p -> !p.getId().equals(id))
                .ifPresent(p -> { throw new BadRequestException("Permission name already exists"); });

        existing.setPermissionKey(request.getPermissionKey());
        existing.setPermissionName(request.getPermissionName());
        existing.setModuleName(request.getModuleName());
        existing.setDescription(request.getDescription());
        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }

        return mapToResponse(permissionRepository.save(existing));
    }

    @Override
    public PermissionResponseDto getPermissionById(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + id));
        return mapToResponse(permission);
    }

    @Override
    public List<PermissionResponseDto> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PermissionResponseDto> getPermissionsByModule(String moduleName) {
        return permissionRepository.findByModuleName(moduleName).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PermissionResponseDto> getActivePermissions() {
        return permissionRepository.findByActive(true).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deletePermission(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + id));

        if (!rolePermissionRepository.findByPermissionId(id).isEmpty()) {
            throw new BadRequestException("Permission is assigned to roles and cannot be deleted");
        }

        permissionRepository.delete(permission);
    }

    private Permission mapToEntity(PermissionRequestDto request, Long id) {
        return Permission.builder()
                .id(id)
                .permissionKey(request.getPermissionKey())
                .permissionName(request.getPermissionName())
                .moduleName(request.getModuleName())
                .description(request.getDescription())
                .active(request.getActive())
                .build();
    }

    private PermissionResponseDto mapToResponse(Permission entity) {
        return PermissionResponseDto.builder()
                .id(entity.getId())
                .permissionKey(entity.getPermissionKey())
                .permissionName(entity.getPermissionName())
                .moduleName(entity.getModuleName())
                .description(entity.getDescription())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
