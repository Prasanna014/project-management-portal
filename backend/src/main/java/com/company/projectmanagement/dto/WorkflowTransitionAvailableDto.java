package com.company.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowTransitionAvailableDto {

    private Long id;
    private String transitionKey;
    private String transitionName;
    private Long toStateId;
    private String toStateName;
    private Boolean requiresComment;
}
