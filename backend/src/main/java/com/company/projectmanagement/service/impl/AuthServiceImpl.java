package com.company.projectmanagement.service.impl;

import com.company.projectmanagement.dto.AuthLoginRequestDto;
import com.company.projectmanagement.dto.AuthTokenResponseDto;
import com.company.projectmanagement.dto.ChangePasswordRequestDto;
import com.company.projectmanagement.entity.User;
import com.company.projectmanagement.exception.BadRequestException;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import com.company.projectmanagement.repository.UserRepository;
import com.company.projectmanagement.security.JwtTokenProvider;
import com.company.projectmanagement.security.SecurityUserPrincipal;
import com.company.projectmanagement.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthTokenResponseDto login(AuthLoginRequestDto request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        SecurityUserPrincipal principal = (SecurityUserPrincipal) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(principal);

        List<String> authorities = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .sorted()
                .toList();

        return AuthTokenResponseDto.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresInMs(jwtTokenProvider.getExpirationMs())
                .userId(principal.userId())
                .email(principal.getUsername())
                .authorities(authorities)
                .build();
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof SecurityUserPrincipal principal)) {
            throw new BadRequestException("Authenticated user is required");
        }

        User user = userRepository.findById(principal.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String currentHash = user.getPasswordHash() == null ? "" : user.getPasswordHash();
        if (!passwordEncoder.matches(request.getCurrentPassword(), currentHash)) {
            throw new BadRequestException("Current password is invalid");
        }

        if (request.getNewPassword().length() < 8) {
            throw new BadRequestException("New password must be at least 8 characters");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
