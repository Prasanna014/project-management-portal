// ================= TaskDto.java =================
package com.company.projectmanagement.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDto {

    private Long id;

    @NotBlank(message = "Task number is required")
    private String taskNo;

    @NotNull(message = "Project id is required")
    private Long projectId;

    @NotBlank(message = "Issue/Action item is required")
    private String issueActionItem;

    private String description;

    private String priority;

    private String status;

    private Long priorityId;

    private Long statusId;

    private Long categoryId;

    private Long workflowStateId;

    private String categoryName;

    private String workflowStateName;

    private Long ownerId;

    private LocalDate targetDate;

    private LocalDate dateResolved;

    private Long createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private BigDecimal estimatedHours;

    private BigDecimal loggedHours;
}
