package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.AuthLoginRequestDto;
import com.company.projectmanagement.dto.AuthTokenResponseDto;
import com.company.projectmanagement.dto.ActivateInvitationRequestDto;
import com.company.projectmanagement.dto.ChangePasswordRequestDto;
import com.company.projectmanagement.dto.ForgotPasswordRequestDto;
import com.company.projectmanagement.dto.ResetPasswordWithTokenRequestDto;
import com.company.projectmanagement.dto.UserDto;
import com.company.projectmanagement.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthTokenResponseDto> login(@Valid @RequestBody AuthLoginRequestDto request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequestDto request) {
        authService.changePassword(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/activate")
    public ResponseEntity<UserDto> activateInvitation(@Valid @RequestBody ActivateInvitationRequestDto request) {
        return ResponseEntity.ok(authService.activateInvitation(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<UserDto> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<UserDto> resetPassword(@Valid @RequestBody ResetPasswordWithTokenRequestDto request) {
        return ResponseEntity.ok(authService.resetPasswordWithToken(request));
    }
}
