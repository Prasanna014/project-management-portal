package com.company.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrgLocationDto {
    private Long id;
    @NotBlank
    private String locationCode;
    @NotBlank
    private String locationName;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String country;
    private Long timezoneId;
    private String timezoneName;
    private Boolean active;
}
