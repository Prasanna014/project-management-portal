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
public class TaskCategoryValidationDto {

    @NotNull(message = "Category id is required")
    private Long id;

    @NotBlank(message = "Category key is required")
    @Size(max = 100, message = "Category key must be at most 100 characters")
    private String categoryKey;

    @NotBlank(message = "Category name is required")
    @Size(max = 255, message = "Category name must be at most 255 characters")
    private String categoryName;
}
