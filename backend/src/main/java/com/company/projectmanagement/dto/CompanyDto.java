package com.company.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CompanyDto {
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String companyCode;

    @NotBlank
    @Size(max = 255)
    private String companyName;

    @NotBlank
    @Size(max = 100)
    private String companySlug;

    private Boolean active;
}