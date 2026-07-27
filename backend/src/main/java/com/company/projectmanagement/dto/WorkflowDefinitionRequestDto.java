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
public class WorkflowDefinitionRequestDto {

    @NotBlank(message = "Workflow key is required")
    @Size(max = 100, message = "Workflow key must be at most 100 characters")
    private String workflowKey;

    @NotBlank(message = "Workflow name is required")
    @Size(max = 255, message = "Workflow name must be at most 255 characters")
    private String workflowName;

    @NotBlank(message = "Entity type is required")
    @Size(max = 100, message = "Entity type must be at most 100 characters")
    private String entityType;

    private String description;

    private Boolean active;
}
