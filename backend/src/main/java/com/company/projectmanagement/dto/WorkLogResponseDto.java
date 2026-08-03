package com.company.projectmanagement.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class WorkLogResponseDto {
    private Long id;
    private Long taskId;
    private String taskNo;
    private Long userId;
    private String userName;
    private BigDecimal hoursLogged;
    private LocalDate logDate;
    private String notes;
    private LocalDateTime createdAt;
}
