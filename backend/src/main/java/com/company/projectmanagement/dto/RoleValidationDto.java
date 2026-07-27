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
public class RoleValidationDto {

    @NotNull(message = "Role id is required")
    private Long id;

    @NotBlank(message = "Role key is required")
    @Size(max = 100, message = "Role key must be at most 100 characters")
    private String roleKey;

    @NotBlank(message = "Role name is required")
    @Size(max = 255, message = "Role name must be at most 255 characters")
    private String roleName;
}
