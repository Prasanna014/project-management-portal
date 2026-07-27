package com.company.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthTokenResponseDto {

    private String accessToken;
    private String tokenType;
    private long expiresInMs;
    private Long userId;
    private String email;
    private List<String> authorities;
}
