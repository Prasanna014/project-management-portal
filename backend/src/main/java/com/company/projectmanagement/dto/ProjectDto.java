// ================= ProjectDto.java =================
package com.company.projectmanagement.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDto {

    private Long id;

    private Long companyId;

    private String projectSlug;

    @NotBlank(message = "Project code is required")
    private String projectCode;

    @NotBlank(message = "Project name is required")
    private String projectName;

    private String description;

    private Boolean active;

    private Long workflowId;

    private String workflowName;

    private List<DeptSummary> departments;

    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DeptSummary {
        private Long id;
        private String departmentName;
    }
}
