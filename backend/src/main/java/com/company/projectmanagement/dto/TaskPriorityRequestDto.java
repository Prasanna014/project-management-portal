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
public class TaskPriorityRequestDto {

    @NotBlank(message = "Priority key is required")
    @Size(max = 100, message = "Priority key must be at most 100 characters")
    private String priorityKey;

    @NotBlank(message = "Priority name is required")
    @Size(max = 255, message = "Priority name must be at most 255 characters")
    private String priorityName;

    private String description;
    private Integer displayOrder;
    private String colorCode;
    private Boolean active;
}
