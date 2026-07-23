// ================= TaskDto.java =================
package com.company.projectmanagement.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDto {

    private Long id;

    private String taskNo;

    private Long projectId;

    private String issueActionItem;

    private String description;

    private String priority;

    private String status;

    private Long ownerId;

    private LocalDate targetDate;

    private LocalDate dateResolved;

    private Long createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
