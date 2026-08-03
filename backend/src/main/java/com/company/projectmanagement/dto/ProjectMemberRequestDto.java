package com.company.projectmanagement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProjectMemberRequestDto {
    @NotNull
    private Long projectId;
    @NotNull
    private Long userId;
    private String memberRole;
    private Boolean active;
}
