package com.company.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AppTimeZoneDto {
    private Long id;
    @NotBlank
    private String timezoneCode;
    @NotBlank
    private String timezoneName;
    @NotBlank
    private String utcOffset;
    private Boolean active;
}
