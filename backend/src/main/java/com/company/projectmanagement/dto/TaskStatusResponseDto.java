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
public class TaskStatusResponseDto {

    private Long id;
    private String statusKey;
    private String statusName;
    private String description;
    private Integer displayOrder;
    private String colorCode;
    private Boolean terminal;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
