package com.company.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreatePersonalAccessTokenRequestDto {

    @NotBlank(message = "Token name is required")
    @Size(max = 120, message = "Token name must be at most 120 characters")
    private String tokenName;

    private List<String> scopes;

    private LocalDateTime expiresAt;
}
