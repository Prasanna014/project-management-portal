package com.company.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchCommentResultDto {

    private Long id;
    private Long taskId;
    private String taskNo;
    private String taskTitle;
    private String commentText;
    private Long commentedBy;
    private String commentedByName;
    private LocalDateTime commentedAt;
}
