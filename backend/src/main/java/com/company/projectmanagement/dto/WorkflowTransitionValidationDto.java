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
public class WorkflowTransitionValidationDto {

    @NotNull(message = "Transition id is required")
    private Long id;

    @NotNull(message = "Workflow id is required")
    private Long workflowId;

    @NotBlank(message = "Transition key is required")
    @Size(max = 100, message = "Transition key must be at most 100 characters")
    private String transitionKey;
}
