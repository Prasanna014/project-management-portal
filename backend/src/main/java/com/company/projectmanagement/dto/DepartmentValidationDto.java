package com.company.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentValidationDto {

    @NotNull(message = "Department id is required")
    private Long id;

    @NotBlank(message = "Department code is required")
    @Size(max = 100, message = "Department code must be at most 100 characters")
    private String departmentCode;

    @NotBlank(message = "Department name is required")
    @Size(max = 255, message = "Department name must be at most 255 characters")
    private String departmentName;
}
