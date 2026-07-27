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
public class PermissionValidationDto {

    @NotNull(message = "Permission id is required")
    private Long id;

    @NotBlank(message = "Permission key is required")
    @Size(max = 150, message = "Permission key must be at most 150 characters")
    private String permissionKey;

    @NotBlank(message = "Permission name is required")
    @Size(max = 255, message = "Permission name must be at most 255 characters")
    private String permissionName;
}
