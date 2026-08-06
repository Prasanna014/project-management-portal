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
public class WorkflowStateResponseDto {

    private Long id;
    private Long workflowId;
    private String stateKey;
    private String stateName;
    private String description;
    private String color;
    private Integer displayOrder;
    private Boolean initial;
    private Boolean terminal;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
