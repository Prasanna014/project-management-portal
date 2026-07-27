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
public class TaskPriorityResponseDto {

    private Long id;
    private String priorityKey;
    private String priorityName;
    private String description;
    private Integer displayOrder;
    private String colorCode;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
