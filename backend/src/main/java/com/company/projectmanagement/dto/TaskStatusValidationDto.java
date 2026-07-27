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
public class TaskStatusValidationDto {

    @NotNull(message = "Status id is required")
    private Long id;

    @NotBlank(message = "Status key is required")
    @Size(max = 100, message = "Status key must be at most 100 characters")
    private String statusKey;

    @NotBlank(message = "Status name is required")
    @Size(max = 255, message = "Status name must be at most 255 characters")
    private String statusName;
}
