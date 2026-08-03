package com.company.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BusinessUnitDto {
    private Long id;
    @NotBlank
    private String unitCode;
    @NotBlank
    private String unitName;
    private String description;
    private Long departmentId;
    private String departmentName;
    private Boolean active;
}
