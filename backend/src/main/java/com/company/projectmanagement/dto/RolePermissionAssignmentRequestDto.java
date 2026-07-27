package com.company.projectmanagement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolePermissionAssignmentRequestDto {

    @NotNull(message = "Role id is required")
    private Long roleId;

    @NotNull(message = "Permission id is required")
    private Long permissionId;

    private Long grantedBy;
}
