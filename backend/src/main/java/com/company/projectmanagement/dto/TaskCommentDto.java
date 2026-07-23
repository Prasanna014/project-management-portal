// ================= TaskCommentDto.java =================
package com.company.projectmanagement.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskCommentDto {

    private Long id;

    private Long taskId;

    private String commentText;

    private Long commentedBy;

    private LocalDateTime commentedAt;
}
