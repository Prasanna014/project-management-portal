// ================= DashboardSummaryDto.java =================
package com.company.projectmanagement.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDto {

    private Long totalTasks;
    private Long openTasks;
    private Long waitingTasks;
    private Long inProgressTasks;
    private Long blockedTasks;
    private Long completedTasks;
    private Long scheduledTasks;
    private Long overdueTasks;

    private Long highPriorityTasks;
    private Long mediumPriorityTasks;
    private Long lowPriorityTasks;
}
