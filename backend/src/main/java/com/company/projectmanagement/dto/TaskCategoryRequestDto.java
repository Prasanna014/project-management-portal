package com.company.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskCategoryRequestDto {

    @NotBlank(message = "Category key is required")
    @Size(max = 100, message = "Category key must be at most 100 characters")
    private String categoryKey;

    @NotBlank(message = "Category name is required")
    @Size(max = 255, message = "Category name must be at most 255 characters")
    private String categoryName;

    private String description;
    private Boolean active;
}
