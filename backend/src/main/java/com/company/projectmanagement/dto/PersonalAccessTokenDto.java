package com.company.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalAccessTokenDto {

    private Long id;
    private String tokenName;
    private String tokenPrefix;
    private String tokenMaskedValue;
    private List<String> scopes;
    private String plainTextToken;
    private LocalDateTime expiresAt;
    private LocalDateTime lastUsedAt;
    private LocalDateTime revokedAt;
    private LocalDateTime createdAt;
    private Boolean active;
}
