package com.company.projectmanagement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SubscriptionRequestDto {
    @NotNull private Long companyId;
    @NotNull private Long planId;
    @NotNull private LocalDate startDate;
    @NotNull private LocalDate endDate;
    private String status = "ACTIVE";
}