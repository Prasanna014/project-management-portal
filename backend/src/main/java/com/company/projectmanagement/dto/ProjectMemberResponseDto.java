package com.company.projectmanagement.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProjectMemberResponseDto {
    private Long id;
    private Long projectId;
    private String projectName;
    private Long userId;
    private String userName;
    private String memberRole;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
