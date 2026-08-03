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
public class DepartmentResponseDto {

    private Long id;
    private String departmentCode;
    private String departmentName;
    private String description;
    private Long parentDepartmentId;
    private String parentDepartmentName;
    private Long departmentHeadId;
    private String departmentHeadName;
    private String costCenter;
    private String departmentEmail;
    private String departmentPhone;
    private String workingHours;
    private Long defaultWorkflowId;
    private String defaultWorkflowName;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
