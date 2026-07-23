// ================= ProjectDto.java =================
package com.company.projectmanagement.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDto {

    private Long id;

    private String projectCode;

    private String projectName;

    private String description;

    private Boolean active;

    private LocalDateTime createdAt;
}
