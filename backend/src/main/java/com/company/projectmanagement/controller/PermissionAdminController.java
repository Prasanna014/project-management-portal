package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.PermissionRequestDto;
import com.company.projectmanagement.dto.PermissionResponseDto;
import com.company.projectmanagement.service.PermissionAdminService;
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
@RequestMapping("/api/admin/permissions")
@RequiredArgsConstructor
@Validated
public class PermissionAdminController {

    private final PermissionAdminService service;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPermissions(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) Boolean active
    ) {
        List<PermissionResponseDto> all = module == null || module.isBlank()
                ? service.getAllPermissions()
                : service.getPermissionsByModule(module);

        Map<String, Object> body = ApiListQueryHelper.filterSortPaginate(
                all,
                keyword,
                active,
                sortBy,
                sortDir,
                page,
                size,
                p -> p.getPermissionKey() + " " + p.getPermissionName() + " " + p.getModuleName(),
                PermissionResponseDto::getActive
        );
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PermissionResponseDto> getPermissionById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getPermissionById(id));
    }

    @PostMapping
    public ResponseEntity<PermissionResponseDto> createPermission(@Valid @RequestBody PermissionRequestDto request) {
        return ResponseEntity.ok(service.createPermission(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PermissionResponseDto> updatePermission(
            @PathVariable Long id,
            @Valid @RequestBody PermissionRequestDto request
    ) {
        return ResponseEntity.ok(service.updatePermission(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePermission(@PathVariable Long id) {
        service.deletePermission(id);
        return ResponseEntity.noContent().build();
    }
}
