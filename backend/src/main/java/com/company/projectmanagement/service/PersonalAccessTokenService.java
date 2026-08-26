package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.CreatePersonalAccessTokenRequestDto;
import com.company.projectmanagement.dto.PersonalAccessTokenDto;
import com.company.projectmanagement.entity.PersonalAccessToken;
import com.company.projectmanagement.repository.PersonalAccessTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PersonalAccessTokenService {

    private static final String AUDIT_ENTITY_TYPE = "PERSONAL_ACCESS_TOKEN";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final PersonalAccessTokenRepository personalAccessTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public List<PersonalAccessTokenDto> listTokensForUser(Long userId) {
        return personalAccessTokenRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(token -> toDto(token, null))
                .collect(Collectors.toList());
    }

    @Transactional
    public PersonalAccessTokenDto createToken(Long userId, CreatePersonalAccessTokenRequestDto request) {
        if (request.getExpiresAt() != null && request.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expiry must be in the future");
        }

        String plainTextToken = generateTokenValue();
        String tokenPrefix = plainTextToken.substring(0, Math.min(12, plainTextToken.length()));

        PersonalAccessToken saved = personalAccessTokenRepository.save(PersonalAccessToken.builder()
                .userId(userId)
                .tokenName(request.getTokenName().trim())
                .tokenPrefix(tokenPrefix)
                .tokenHash(passwordEncoder.encode(plainTextToken))
                .scopeCsv(toScopeCsv(request.getScopes()))
                .expiresAt(request.getExpiresAt())
                .build());

        auditLogService.record(AUDIT_ENTITY_TYPE, saved.getId(), "PAT_CREATED", null, describe(saved), userId,
                "Personal access token created by user.");

        return toDto(saved, plainTextToken);
    }

    @Transactional
    public void revokeToken(Long userId, Long tokenId) {
        PersonalAccessToken token = personalAccessTokenRepository.findByIdAndUserId(tokenId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Personal access token not found"));

        if (token.getRevokedAt() != null) {
            return;
        }

        String previousState = describe(token);
        token.setRevokedAt(LocalDateTime.now());
        PersonalAccessToken saved = personalAccessTokenRepository.save(token);

        auditLogService.record(AUDIT_ENTITY_TYPE, saved.getId(), "PAT_REVOKED", previousState, describe(saved), userId,
                "Personal access token revoked by user.");
    }

    private PersonalAccessTokenDto toDto(PersonalAccessToken token, String plainTextToken) {
        boolean active = token.getRevokedAt() == null
                && (token.getExpiresAt() == null || token.getExpiresAt().isAfter(LocalDateTime.now()));

        return PersonalAccessTokenDto.builder()
                .id(token.getId())
                .tokenName(token.getTokenName())
                .tokenPrefix(token.getTokenPrefix())
                .tokenMaskedValue(token.getTokenPrefix() + "..." + String.format("%04d", token.getId()))
                .scopes(parseScopes(token.getScopeCsv()))
                .plainTextToken(plainTextToken)
                .expiresAt(token.getExpiresAt())
                .lastUsedAt(token.getLastUsedAt())
                .revokedAt(token.getRevokedAt())
                .createdAt(token.getCreatedAt())
                .active(active)
                .build();
    }

    private String toScopeCsv(List<String> scopes) {
        if (scopes == null || scopes.isEmpty()) {
            return "";
        }
        return scopes.stream()
                .map(scope -> scope == null ? "" : scope.trim())
                .filter(scope -> !scope.isBlank())
                .map(scope -> scope.toUpperCase(Locale.ROOT))
                .distinct()
                .collect(Collectors.joining(","));
    }

    private List<String> parseScopes(String scopeCsv) {
        if (scopeCsv == null || scopeCsv.isBlank()) {
            return List.of();
        }
        return Arrays.stream(scopeCsv.split(","))
                .map(String::trim)
                .filter(scope -> !scope.isBlank())
                .toList();
    }

    private String generateTokenValue() {
        byte[] bytes = new byte[24];
        SECURE_RANDOM.nextBytes(bytes);
        return "sf_pat_" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String describe(PersonalAccessToken token) {
        return token.getTokenName() + "|" + token.getTokenPrefix() + "|" + (token.getRevokedAt() == null ? "ACTIVE" : "REVOKED");
    }
}
