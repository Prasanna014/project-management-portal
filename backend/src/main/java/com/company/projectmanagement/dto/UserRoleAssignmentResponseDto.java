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
public class UserRoleAssignmentResponseDto {

    private Long userId;
    private Long roleId;
    private Long assignedBy;
    private Boolean active;
    private LocalDateTime assignedAt;
}
