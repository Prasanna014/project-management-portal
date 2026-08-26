// ================= NotificationDto.java =================
package com.company.projectmanagement.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {

    private Long id;

    @NotNull(message = "User id is required")
    private Long userId;

    private Long taskId;
    private Long projectId;

    @NotBlank(message = "Notification title is required")
    private String title;

    private String message;

    private String notificationType;

    private Boolean isRead;

    private LocalDateTime createdAt;
}
