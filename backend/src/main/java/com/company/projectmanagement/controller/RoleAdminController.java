package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.RolePermissionAssignmentRequestDto;
import com.company.projectmanagement.dto.RolePermissionAssignmentResponseDto;
import com.company.projectmanagement.dto.RoleRequestDto;
import com.company.projectmanagement.dto.RoleResponseDto;
import com.company.projectmanagement.dto.UserRoleAssignmentRequestDto;
import com.company.projectmanagement.dto.UserRoleAssignmentResponseDto;
import com.company.projectmanagement.service.RoleAdminService;
import com.company.projectmanagement.repository.RoleRepository;
import com.company.projectmanagement.repository.UserRepository;
import com.company.projectmanagement.security.TenantAccessService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@Validated
public class RoleAdminController {

    private final RoleAdminService service;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final TenantAccessService tenantAccessService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getRoles(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active
    ) {
        List<RoleResponseDto> all = service.getAllRoles();
        Map<String, Object> body = ApiListQueryHelper.filterSortPaginate(
                all,
                keyword,
                active,
                sortBy,
                sortDir,
                page,
                size,
                r -> r.getRoleKey() + " " + r.getRoleName(),
                RoleResponseDto::getActive
        );
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleResponseDto> getRoleById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getRoleById(id));
    }

    @PostMapping
    public ResponseEntity<RoleResponseDto> createRole(@Valid @RequestBody RoleRequestDto request) {
        return ResponseEntity.ok(service.createRole(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleResponseDto> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleRequestDto request
    ) {
        return ResponseEntity.ok(service.updateRole(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        service.deleteRole(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/assignments/users")
    public ResponseEntity<UserRoleAssignmentResponseDto> assignRoleToUser(
            @Valid @RequestBody UserRoleAssignmentRequestDto request
    ) {
        ensureCompanyAdminAssignmentAllowed(request.getUserId(), request.getRoleId());
        return ResponseEntity.ok(service.assignRoleToUser(request));
    }

    @DeleteMapping("/assignments/users/{userId}/roles/{roleId}")
    public ResponseEntity<Void> removeRoleFromUser(
            @PathVariable Long userId,
            @PathVariable Long roleId
    ) {
        ensureCompanyAdminAssignmentAllowed(userId, roleId);
        service.removeRoleFromUser(userId, roleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/assignments/users/{userId}")
    public ResponseEntity<List<UserRoleAssignmentResponseDto>> getUserRoles(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getUserRoles(userId));
    }

    @PostMapping("/assignments/permissions")
    public ResponseEntity<RolePermissionAssignmentResponseDto> assignPermissionToRole(
            @Valid @RequestBody RolePermissionAssignmentRequestDto request
    ) {
        return ResponseEntity.ok(service.assignPermissionToRole(request));
    }

    @DeleteMapping("/assignments/permissions/{roleId}/{permissionId}")
    public ResponseEntity<Void> removePermissionFromRole(
            @PathVariable Long roleId,
            @PathVariable Long permissionId
    ) {
        service.removePermissionFromRole(roleId, permissionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/assignments/permissions/{roleId}")
    public ResponseEntity<List<RolePermissionAssignmentResponseDto>> getRolePermissions(@PathVariable Long roleId) {
        return ResponseEntity.ok(service.getRolePermissions(roleId));
    }

    private void ensureCompanyAdminAssignmentAllowed(Long userId, Long roleId) {
        if (tenantAccessService.isPlatformAdmin()) return;
        Long companyId = tenantAccessService.currentCompanyIdOrThrow();
        boolean userIsInCompany = userRepository.findByIdAndCompanyId(userId, companyId).isPresent();
        String roleKey = roleRepository.findById(roleId).map(role -> role.getRoleKey()).orElse("");
        if (!userIsInCompany || !("PROJECT_ADMIN".equals(roleKey) || "USER".equals(roleKey))) {
            throw new org.springframework.security.access.AccessDeniedException("Company Admin may assign only Project Admin or User roles within their company");
        }
    }
}
