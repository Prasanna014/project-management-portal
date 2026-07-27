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
public class ProjectDepartmentAssignmentRequestDto {

    @NotNull(message = "Project id is required")
    private Long projectId;

    @NotNull(message = "Department id is required")
    private Long departmentId;
}
