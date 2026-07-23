// ================= ActivityHistoryDto.java =================
package com.company.projectmanagement.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityHistoryDto {

    private Long id;
    @NotNull(message = "Task id is required")
    private Long taskId;
    @NotBlank(message = "Activity type is required")
    private String activityType;
    private String oldValue;
    private String newValue;
    private Long performedBy;
    private LocalDateTime performedAt;
}
