package com.company.projectmanagement.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class WorkLogRequestDto {
    @NotNull
    private Long taskId;
    @NotNull
    private Long userId;
    @NotNull
    @DecimalMin("0.1")
    private BigDecimal hoursLogged;
    @NotNull
    private LocalDate logDate;
    private String notes;
}
