// ================= TaskAttachmentDto.java =================
package com.company.projectmanagement.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskAttachmentDto {

    private Long id;
    private Long taskId;
    private String fileName;
    private String fileType;
    private String filePath;
    private Long uploadedBy;
    private LocalDateTime uploadedAt;
}
