package com.company.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolePermissionAssignmentResponseDto {

    private Long roleId;
    private Long permissionId;
    private Long grantedBy;
    private LocalDateTime grantedAt;
}
