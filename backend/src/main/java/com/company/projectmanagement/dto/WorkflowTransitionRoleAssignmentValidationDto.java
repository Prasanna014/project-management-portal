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
public class WorkflowTransitionRoleAssignmentValidationDto {

    @NotNull(message = "Transition id is required")
    private Long transitionId;

    @NotNull(message = "Role id is required")
    private Long roleId;
}
