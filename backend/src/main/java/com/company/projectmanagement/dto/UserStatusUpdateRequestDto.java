package com.company.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatusUpdateRequestDto {

    @NotBlank(message = "Account status is required")
    private String accountStatus;
}
