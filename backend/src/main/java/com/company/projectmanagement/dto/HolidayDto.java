package com.company.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class HolidayDto {
    private Long id;
    @NotNull
    private LocalDate holidayDate;
    @NotBlank
    private String holidayName;
    private String holidayType;
    private Long locationId;
    private String locationName;
    private Boolean recurring;
    private String description;
    private Boolean active;
}
