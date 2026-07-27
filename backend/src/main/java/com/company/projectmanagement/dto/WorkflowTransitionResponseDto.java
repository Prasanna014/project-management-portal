package com.company.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowTransitionResponseDto {

    private Long id;
    private Long workflowId;
    private Long fromStateId;
    private Long toStateId;
    private String transitionKey;
    private String transitionName;
    private Boolean requiresComment;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
