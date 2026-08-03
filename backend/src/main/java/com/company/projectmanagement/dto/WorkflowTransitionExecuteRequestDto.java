package com.company.projectmanagement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTransitionExecuteRequestDto {

    @NotNull(message = "transitionId is required")
    private Long transitionId;

    private String comment;
}
