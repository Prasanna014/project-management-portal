package com.company.projectmanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LabelResponseDto {

    private Long id;
    private String labelKey;
    private String labelName;
    private String colorCode;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}