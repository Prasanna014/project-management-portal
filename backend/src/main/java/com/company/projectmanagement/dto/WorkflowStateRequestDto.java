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
public class WorkflowStateRequestDto {

    @NotNull(message = "Workflow id is required")
    private Long workflowId;

    @NotBlank(message = "State key is required")
    @Size(max = 100, message = "State key must be at most 100 characters")
    private String stateKey;

    @NotBlank(message = "State name is required")
    @Size(max = 255, message = "State name must be at most 255 characters")
    private String stateName;

    private String description;
    private String color;
    private Integer displayOrder;
    private Boolean initial;
    private Boolean terminal;
    private Boolean active;
}
