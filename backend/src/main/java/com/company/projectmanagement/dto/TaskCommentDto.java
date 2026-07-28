// ================= TaskCommentDto.java =================
package com.company.projectmanagement.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskCommentDto {

    private Long id;

    private Long taskId;

    @NotBlank(message = "Comment text is required")
    private String commentText;

    @NotNull(message = "Commented by user id is required")
    private Long commentedBy;

    private LocalDateTime commentedAt;

    private LocalDateTime updatedAt;
}
