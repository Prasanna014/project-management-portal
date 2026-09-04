package com.company.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LabelRequestDto {

    @NotBlank(message = "Label key is required")
    @Size(max = 100, message = "Label key must be at most 100 characters")
    private String labelKey;

    @NotBlank(message = "Label name is required")
    @Size(max = 255, message = "Label name must be at most 255 characters")
    private String labelName;

    @Size(max = 20, message = "Color code must be at most 20 characters")
    private String colorCode;

    private Boolean active;
}