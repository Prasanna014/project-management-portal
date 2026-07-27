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
public class UserRoleAssignmentValidationDto {

    @NotNull(message = "User id is required")
    private Long userId;

    @NotNull(message = "Role id is required")
    private Long roleId;
}
