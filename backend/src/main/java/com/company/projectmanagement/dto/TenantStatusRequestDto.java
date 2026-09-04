package com.company.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TenantStatusRequestDto {
    @NotBlank private String status;
}