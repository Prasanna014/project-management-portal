// ================= NotificationDto.java =================
package com.company.projectmanagement.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {

    private Long id;

    private Long userId;

    private Long taskId;

    private String title;

    private String message;

    private String notificationType;

    private Boolean isRead;

    private LocalDateTime createdAt;
}
