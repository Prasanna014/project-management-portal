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
public class KnowledgeDocumentDto {
    private Long id;
    private String title;
    private String category;
    private String audience;
    private String description;
    private String fileName;
    private String contentType;
    private String fileExtension;
    private Long fileSize;
    private Long uploadedBy;
    private String uploadedByName;
    private LocalDateTime deletedAt;
    private Long deletedBy;
    private String deletedByName;
    private LocalDateTime purgedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
