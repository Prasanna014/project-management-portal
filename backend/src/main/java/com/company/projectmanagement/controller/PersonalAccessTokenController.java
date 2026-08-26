package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.CreatePersonalAccessTokenRequestDto;
import com.company.projectmanagement.dto.PersonalAccessTokenDto;
import com.company.projectmanagement.security.SecurityUserPrincipal;
import com.company.projectmanagement.service.PersonalAccessTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/settings/personal-access-tokens")
@RequiredArgsConstructor
public class PersonalAccessTokenController {

    private final PersonalAccessTokenService service;

    @GetMapping
    public ResponseEntity<List<PersonalAccessTokenDto>> listTokens() {
        return ResponseEntity.ok(service.listTokensForUser(requireCurrentUserId()));
    }

    @PostMapping
    public ResponseEntity<PersonalAccessTokenDto> createToken(@Valid @RequestBody CreatePersonalAccessTokenRequestDto request) {
        return ResponseEntity.ok(service.createToken(requireCurrentUserId(), request));
    }

    @DeleteMapping("/{tokenId}")
    public ResponseEntity<Void> revokeToken(@PathVariable Long tokenId) {
        service.revokeToken(requireCurrentUserId(), tokenId);
        return ResponseEntity.noContent().build();
    }

    private Long requireCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof SecurityUserPrincipal principal) {
            return principal.userId();
        }
        throw new ResponseStatusException(UNAUTHORIZED, "Authenticated user not found");
    }
}
