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
public class ResetPasswordWithTokenRequestDto {

    @NotBlank(message = "Reset token is required")
    private String token;

    @NotBlank(message = "Password is required")
    private String newPassword;
}
