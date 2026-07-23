// ================= ActivityHistoryDto.java =================
package com.company.projectmanagement.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityHistoryDto {

    private Long id;
    private Long taskId;
    private String activityType;
    private String oldValue;
    private String newValue;
    private Long performedBy;
    private LocalDateTime performedAt;
}
