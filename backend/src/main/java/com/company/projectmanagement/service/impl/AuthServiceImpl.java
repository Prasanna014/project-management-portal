package com.company.projectmanagement.service.impl;

import com.company.projectmanagement.dto.AuthLoginRequestDto;
import com.company.projectmanagement.dto.AuthTokenResponseDto;
import com.company.projectmanagement.dto.ActivateInvitationRequestDto;
import com.company.projectmanagement.dto.ChangePasswordRequestDto;
import com.company.projectmanagement.dto.ForgotPasswordRequestDto;
import com.company.projectmanagement.dto.ResetPasswordWithTokenRequestDto;
import com.company.projectmanagement.dto.UserDto;
import com.company.projectmanagement.entity.User;
import com.company.projectmanagement.exception.BadRequestException;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import com.company.projectmanagement.repository.UserRepository;
import com.company.projectmanagement.service.AuditLogService;
import com.company.projectmanagement.security.JwtTokenProvider;
import com.company.projectmanagement.security.SecurityUserPrincipal;
import com.company.projectmanagement.service.AuthService;
import com.company.projectmanagement.service.UserService;
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
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public AuthTokenResponseDto login(AuthLoginRequestDto request) {
        User userRecord = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Login failed. Check email and password."));
        ensureLoginAllowed(userRecord);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        SecurityUserPrincipal principal = (SecurityUserPrincipal) authentication.getPrincipal();
        Long userId = Objects.requireNonNull(principal.userId(), "Authenticated user id is required");
        String token = jwtTokenProvider.generateToken(principal);

        List<String> authorities = principal.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .sorted()
                .toList();

        boolean passwordChangeRequired = Boolean.TRUE.equals(userRecord.getPasswordChangeRequired());
        userService.recordSuccessfulLogin(userId);

        return AuthTokenResponseDto.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresInMs(jwtTokenProvider.getExpirationMs())
                .userId(userId)
                .email(principal.getUsername())
                .authorities(authorities)
                .passwordChangeRequired(passwordChangeRequired)
                .build();
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof SecurityUserPrincipal principal)) {
            throw new BadRequestException("Authenticated user is required");
        }

        Long userId = Objects.requireNonNull(principal.userId(), "Authenticated user id is required");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String currentHash = user.getPasswordHash() == null ? "" : user.getPasswordHash();
        if (!passwordEncoder.matches(request.getCurrentPassword(), currentHash)) {
            throw new BadRequestException("Current password is invalid");
        }

        if (request.getNewPassword().length() < 8) {
            throw new BadRequestException("New password must be at least 8 characters");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangeRequired(false);
        user.setAccountStatus(UserService.STATUS_ACTIVE);
        userRepository.save(user);
        auditLogService.record("USER", user.getId(), "USER_PASSWORD_CHANGED", null,
                "email=" + user.getEmail() + ", accountStatus=" + user.getAccountStatus(),
                userId, "User changed their password from Settings.");
    }

    @Override
    @Transactional
    public UserDto activateInvitation(ActivateInvitationRequestDto request) {
        return userService.activateInvitation(request.getToken(), request.getNewPassword());
    }

    @Override
    @Transactional
    public UserDto forgotPassword(ForgotPasswordRequestDto request) {
        return userService.beginForgotPassword(request.getEmail().trim());
    }

    @Override
    @Transactional
    public UserDto resetPasswordWithToken(ResetPasswordWithTokenRequestDto request) {
        return userService.completePasswordReset(request.getToken(), request.getNewPassword());
    }

    private void ensureLoginAllowed(User user) {
        String status = user.getAccountStatus() == null ? "" : user.getAccountStatus().trim().toUpperCase();
        if (UserService.STATUS_INVITED.equals(status)) {
            throw new BadRequestException("Invitation pending. Ask admin for the activation link.");
        }
        if (UserService.STATUS_SUSPENDED.equals(status)) {
            throw new BadRequestException("Your account is suspended. Contact an administrator.");
        }
        if (UserService.STATUS_DEACTIVATED.equals(status)) {
            throw new BadRequestException("Your account is deactivated. Contact an administrator.");
        }
        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new BadRequestException("Your account is inactive. Contact an administrator.");
        }
    }
}
