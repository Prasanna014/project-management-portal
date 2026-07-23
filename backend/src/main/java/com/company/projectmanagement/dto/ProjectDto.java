// ================= ProjectDto.java =================
package com.company.projectmanagement.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDto {

    private Long id;

    @NotBlank(message = "Project code is required")
    private String projectCode;

    @NotBlank(message = "Project name is required")
    private String projectName;

    private String description;

    private Boolean active;

    private LocalDateTime createdAt;
}
