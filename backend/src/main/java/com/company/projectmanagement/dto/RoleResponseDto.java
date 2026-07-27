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
public class RoleResponseDto {

    private Long id;
    private String roleKey;
    private String roleName;
    private String description;
    private Boolean active;
    private Boolean systemRole;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
