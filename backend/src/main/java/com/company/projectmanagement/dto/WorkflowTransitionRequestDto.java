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
public class WorkflowTransitionRequestDto {

    @NotNull(message = "Workflow id is required")
    private Long workflowId;

    @NotNull(message = "From state id is required")
    private Long fromStateId;

    @NotNull(message = "To state id is required")
    private Long toStateId;

    @NotBlank(message = "Transition key is required")
    @Size(max = 100, message = "Transition key must be at most 100 characters")
    private String transitionKey;

    @NotBlank(message = "Transition name is required")
    @Size(max = 255, message = "Transition name must be at most 255 characters")
    private String transitionName;

    private Boolean requiresComment;
    private Boolean active;
}
