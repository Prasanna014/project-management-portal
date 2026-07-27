package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.PermissionRequestDto;
import com.company.projectmanagement.dto.PermissionResponseDto;

import java.util.List;

public interface PermissionAdminService {

    PermissionResponseDto createPermission(PermissionRequestDto request);

    PermissionResponseDto updatePermission(Long id, PermissionRequestDto request);

    PermissionResponseDto getPermissionById(Long id);

    List<PermissionResponseDto> getAllPermissions();

    List<PermissionResponseDto> getPermissionsByModule(String moduleName);

    List<PermissionResponseDto> getActivePermissions();

    void deletePermission(Long id);
}
