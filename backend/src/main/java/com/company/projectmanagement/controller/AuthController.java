package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.AuthLoginRequestDto;
import com.company.projectmanagement.dto.AuthTokenResponseDto;
import com.company.projectmanagement.dto.ChangePasswordRequestDto;
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
}
